const db = require("../config/connectdb");

// ======================================================
// MOSACH ERP - PRODUCTION REPORT MODEL
// Excel columns are mapped by the controller.
// This model saves normalized rows into productionreport.
// ======================================================

// Excel columns mapped to database fields.
const productionFields = [
"sku",
"packing",
"reportdate",
"jobcard",
"article",
"colour",
"size",
"pair",
"cuttingreceiveddate",
"cuttingcontractor",
"uppercontractor",
"upperissuedate",
"upperreceiveddate",
"upperreceivedpair",
"upperinsolecontractor",
"upperinsoleissuedate",
"upperstorereceiveddate",
"upperstorepairqty",
"upperstorestatus",
"machineno",
"machineissuedate",
"machinepairqty",
"firstpair",
"secondpair",
"rejection",
"totalpair"
];

const dateFields = [
"reportdate",
"cuttingreceiveddate",
"upperissuedate",
"upperreceiveddate",
"upperinsoleissuedate",
"upperstorereceiveddate",
"machineissuedate"
];

const numericFields = [
"packing",
"carton",
"pair",
"upperreceivedpair",
"upperstorepairqty",
"machinepairqty",
"firstpair",
"secondpair",
"rejection",
"totalpair"
];

// ======================================================
// HELPERS
// ======================================================

const normalizeText = (value) => {
if (value === undefined || value === null) {
return null;
}


const text = String(value).trim();

return text === "" ? null : text;


};

const normalizeNumber = (value, field) => {
if (value === undefined || value === null || String(value).trim() === "") {
return 0;
}


if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
}

const cleaned = String(value)
    .replace(/,/g, "")
    .trim();

if (!cleaned) return 0;

const number = Number(cleaned);

if (!Number.isFinite(number)) {
    throw new Error(
        `Invalid numeric value for "${field}": ${value}`
    );
}

return number;


};

// Convert incoming date values to YYYY-MM-DD.
// Excel serial/date conversion should primarily be done in the controller.
const normalizeDate = (value, field) => {
if (value === undefined || value === null || value === "") {
return null;
}


if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;

    return [
        value.getFullYear(),
        String(value.getMonth() + 1).padStart(2, "0"),
        String(value.getDate()).padStart(2, "0")
    ].join("-");
}

const text = String(value).trim();

if (!text) return null;

// Already YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...
const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);

    if (
        year >= 1901 &&
        month >= 1 && month <= 12 &&
        day >= 1 && day <= 31
    ) {
        return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }

    throw new Error(`Invalid date for "${field}": ${text}`);
}

// Accept DD/MM/YYYY or DD-MM-YYYY.
const dmyMatch = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

if (dmyMatch) {
    const day = Number(dmyMatch[1]);
    const month = Number(dmyMatch[2]);
    const year = Number(dmyMatch[3]);

    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        throw new Error(`Invalid date for "${field}": ${text}`);
    }

    return [
        year,
        String(month).padStart(2, "0"),
        String(day).padStart(2, "0")
    ].join("-");
}

// Do not silently save JavaScript date strings or unknown formats.
throw new Error(
    `Unsupported date format for "${field}": ${text}`
);


};

const normalizeRow = (sourceRow) => {
const row = {};


for (const field of productionFields) {
    const value = sourceRow[field];

    if (dateFields.includes(field)) {
        row[field] = normalizeDate(value, field);
    } else if (numericFields.includes(field)) {
        row[field] = normalizeNumber(value, field);
    } else {
        row[field] = normalizeText(value);
    }
}

// SKU and Job Card are required to identify a production row.
if (!row.jobcard) {
    throw new Error("Job Card is missing in a production row.");
}

if (!row.sku) {
    throw new Error(
        `SKU is missing for Job Card "${row.jobcard}".`
    );
}

row.carton = normalizeNumber(sourceRow.carton, "carton");
row.uploadbatchid = normalizeText(sourceRow.uploadbatchid);

return row;


};

const normalizeComparableValue = (value, field) => {
if (value === undefined || value === null || value === "") {
return dateFields.includes(field) ? null :
(numericFields.includes(field) ? 0 : null);
}


if (dateFields.includes(field)) {
    return normalizeDate(value, field);
}

if (numericFields.includes(field)) {
    return Number(value) || 0;
}

return String(value).trim();


};

const isRecordChanged = (existing, incoming) => {
const fieldsToCompare = [
...productionFields,
"carton"
];


return fieldsToCompare.some((field) => {
    return (
        normalizeComparableValue(existing[field], field) !==
        normalizeComparableValue(incoming[field], field)
    );
});


};

// Use a composite identity because one Job Card can have multiple SKUs.
// Confirm that this combination uniquely identifies a row in your Excel.
const makeRowKey = (row) => {
return [
row.jobcard,
row.sku
].map((value) => String(value ?? "").trim().toUpperCase()).join("||");
};

// ======================================================
// 1. INSERT / UPDATE PRODUCTION ROWS
// ======================================================

const insertProductionRows = async (rows) => {
if (!Array.isArray(rows) || rows.length === 0) {
return {
affectedRows: 0,
insertedRows: 0,
updatedRows: 0,
unchangedRows: 0
};
}


// Normalize rows and reject invalid rows rather than silently shifting data.
const normalizedRows = rows.map(normalizeRow);

// Keep the last occurrence of the same Job Card + SKU in this upload.
const uniqueMap = new Map();

for (const row of normalizedRows) {
    uniqueMap.set(makeRowKey(row), row);
}

const uniqueRows = Array.from(uniqueMap.values());

// Fetch possible existing records for these Job Cards.
const jobcards = [...new Set(uniqueRows.map((row) => row.jobcard))];
const placeholders = jobcards.map(() => "?").join(", ");

const selectSql = `
    SELECT *
    FROM productionreport
    WHERE jobcard IN (${placeholders})
`;

const existingRows = await new Promise((resolve, reject) => {
    db.query(selectSql, jobcards, (err, result) => {
        if (err) return reject(err);
        resolve(result);
    });
});

const existingMap = new Map();

for (const row of existingRows) {
    existingMap.set(makeRowKey(row), row);
}

let insertedRows = 0;
let updatedRows = 0;
let unchangedRows = 0;

for (const row of uniqueRows) {
    const existing = existingMap.get(makeRowKey(row));

    if (!existing) {
        insertedRows++;
    } else if (isRecordChanged(existing, row)) {
        updatedRows++;
    } else {
        unchangedRows++;
    }
}

const columns = [
    "sku",
    "packing",
    "reportdate",
    "jobcard",
    "article",
    "colour",
    "size",
    "pair",
    "cuttingreceiveddate",
    "cuttingcontractor",
    "uppercontractor",
    "upperissuedate",
    "upperreceiveddate",
    "upperreceivedpair",
    "upperinsolecontractor",
    "upperinsoleissuedate",
    "upperstorereceiveddate",
    "upperstorepairqty",
    "upperstorestatus",
    "machineno",
    "machineissuedate",
    "machinepairqty",
    "firstpair",
    "secondpair",
    "rejection",
    "totalpair",
    "carton",
    "uploadbatchid"
];

const updateColumns = columns.filter(
    (column) => !["jobcard", "sku"].includes(column)
);

const sql = `
    INSERT INTO productionreport (
        ${columns.join(", ")}
    )
    VALUES ?
`;

const values = uniqueRows.map((row) =>
    columns.map((column) => row[column] ?? null)
);

// Do not use ON DUPLICATE KEY UPDATE here.
// The current database may still have a UNIQUE index on jobcard.
// That index can incorrectly overwrite different SKU rows under one Job Card.
const result = await new Promise((resolve, reject) => {
    db.query(sql, [values], (err, result) => {
        if (err) {
            console.error("Insert Production Report Error:", err);
            return reject(err);
        }

        resolve(result);
    });
});

return {
    affectedRows: result.affectedRows,
    insertedRows,
    updatedRows,
    unchangedRows,
    message:
        "Rows processed. Existing-row update requires a verified unique key."
};


};

// ======================================================
// 2. GET PRODUCTION REPORT
// ======================================================

const getProductionReport = (filters = {}) => {
return new Promise((resolve, reject) => {
let sql = `             SELECT *
            FROM productionreport
            WHERE 1 = 1
        `;


    const params = [];

    if (filters.fromDate) {
        sql += " AND reportdate >= ?";
        params.push(filters.fromDate);
    }

    if (filters.toDate) {
        sql += " AND reportdate <= ?";
        params.push(filters.toDate);
    }

    if (filters.article) {
        sql += " AND article LIKE ?";
        params.push(`%${filters.article}%`);
    }

    if (filters.jobcard) {
        sql += " AND jobcard LIKE ?";
        params.push(`%${filters.jobcard}%`);
    }

    if (filters.sku) {
        sql += " AND sku LIKE ?";
        params.push(`%${filters.sku}%`);
    }

    sql += `
        ORDER BY reportdate DESC, productionreportid DESC
    `;

    db.query(sql, params, (err, rows) => {
        if (err) {
            console.error("Get Production Report Error:", err);
            return reject(err);
        }

        resolve(rows);
    });
});


};

// ======================================================
// 3. GET PRODUCTION DASHBOARD SUMMARY
// ======================================================

const getProductionSummary = (filters = {}) => {
return new Promise((resolve, reject) => {
let sql = `             SELECT
                COUNT(*) AS totalRecords,
                COALESCE(SUM(pair), 0) AS totalPairs,
                COALESCE(SUM(upperreceivedpair), 0)
                    AS totalUpperReceivedPairs,
                COALESCE(SUM(upperstorepairqty), 0)
                    AS totalUpperStorePairs,
                COALESCE(SUM(machinepairqty), 0)
                    AS totalMachinePairs,
                COALESCE(SUM(firstpair), 0)
                    AS totalFirstPairs,
                COALESCE(SUM(secondpair), 0)
                    AS totalSecondPairs,
                COALESCE(SUM(rejection), 0)
                    AS totalRejection,
                COALESCE(SUM(totalpair), 0)
                    AS totalProductionPairs
            FROM productionreport
            WHERE 1 = 1
        `;


    const params = [];

    if (filters.fromDate) {
        sql += " AND reportdate >= ?";
        params.push(filters.fromDate);
    }

    if (filters.toDate) {
        sql += " AND reportdate <= ?";
        params.push(filters.toDate);
    }

    db.query(sql, params, (err, rows) => {
        if (err) {
            console.error("Production Summary Error:", err);
            return reject(err);
        }

        resolve(rows[0]);
    });
});


};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
insertProductionRows,
getProductionReport,
getProductionSummary
};
