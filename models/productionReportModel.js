const db = require("../config/connectdb");

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
"upperinsoleissueddate",
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
"upperinsoleissueddate",
"upperstorereceiveddate",
"machineissuedate"
];

const numericFields = [
"packing",
"pair",
"upperreceivedpair",
"upperstorepairqty",
"machinepairqty",
"firstpair",
"secondpair",
"rejection",
"totalpair"
];

const normalizeText = (value) => {
if (value === undefined || value === null) return null;


const text = String(value).trim();
return text === "" ? null : text;


};

const normalizeNumber = (value, field) => {
if (value === undefined || value === null || String(value).trim() === "") {
return 0;
}

 
if (typeof value === "number") {
    if (!Number.isFinite(value)) {
        throw new Error(`Invalid number in "${field}".`);
    }
    return value;
}

const cleaned = String(value).replace(/,/g, "").trim();
const number = Number(cleaned);

if (!Number.isFinite(number)) {
    throw new Error(`Invalid numeric value for "${field}": ${value}`);
}

return number;
 

};

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

let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        throw new Error(`Invalid date for "${field}": ${text}`);
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        throw new Error(`Invalid date for "${field}": ${text}`);
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

throw new Error(`Unsupported date format for "${field}": ${text}`);
 

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

if (!row.jobcard) {
    throw new Error("Job Card is missing in an Excel row.");
}

if (!row.sku) {
    throw new Error(`SKU is missing for Job Card "${row.jobcard}".`);
}

// Carton calculation: 24 pairs = 1 carton.
row.carton = Number((row.pair / 24).toFixed(2));

row.uploadbatchid = normalizeText(sourceRow.uploadbatchid);

return row;
 

};

const makeRowKey = (row) =>
`${String(row.jobcard || "").trim().toUpperCase()}||${String(row.sku || "").trim().toUpperCase()}`;

const queryAsync = (sql, params = []) =>
new Promise((resolve, reject) => {
db.query(sql, params, (err, result) => {
if (err) return reject(err);
resolve(result);
});
});

// ======================================================
// INSERT / UPDATE PRODUCTION ROWS
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

 
const uniqueMap = new Map();

for (const sourceRow of rows) {
    const row = normalizeRow(sourceRow);
    uniqueMap.set(makeRowKey(row), row);
}

const incomingRows = [...uniqueMap.values()];
const jobcards = [...new Set(incomingRows.map((row) => row.jobcard))];

const existingRows = [];

// Chunk queries to avoid excessively large SQL statements.
for (let i = 0; i < jobcards.length; i += 300) {
    const batch = jobcards.slice(i, i + 300);
    const placeholders = batch.map(() => "?").join(", ");

    const result = await queryAsync(
        `SELECT * FROM productionreport WHERE jobcard IN (${placeholders})`,
        batch
    );

    existingRows.push(...result);
}

const existingMap = new Map();

for (const row of existingRows) {
    existingMap.set(makeRowKey(row), row);
}

const columns = [
    ...productionFields,
    "carton",
    "uploadbatchid"
];

let insertedRows = 0;
let updatedRows = 0;
let unchangedRows = 0;

const rowsToInsert = [];
const rowsToUpdate = [];

for (const row of incomingRows) {
    const existing = existingMap.get(makeRowKey(row));

    if (!existing) {
        insertedRows++;
        rowsToInsert.push(row);
        continue;
    }

    const changed = columns.some((field) => {
        if (field === "uploadbatchid") return false;

        if (dateFields.includes(field)) {
            const oldDate = existing[field]
                ? normalizeDate(existing[field], field)
                : null;

            return oldDate !== row[field];
        }

        if (numericFields.includes(field) || field === "carton") {
            return Number(existing[field] || 0) !== Number(row[field] || 0);
        }

        const oldValue = existing[field] == null
            ? null
            : String(existing[field]).trim();

        return oldValue !== row[field];
    });

    if (changed) {
        updatedRows++;
        rowsToUpdate.push(row);
    } else {
        unchangedRows++;
    }
}

// Insert new records.
for (let i = 0; i < rowsToInsert.length; i += 200) {
    const batch = rowsToInsert.slice(i, i + 200);
    const values = batch.map((row) =>
        columns.map((column) => row[column] ?? null)
    );

    const placeholders = batch
        .map(() => `(${columns.map(() => "?").join(", ")})`)
        .join(", ");

    const flatValues = values.flat();

    await queryAsync(
        `INSERT INTO productionreport (${columns.join(", ")}) VALUES ${placeholders}`,
        flatValues
    );
}

// Update records using the matched productionreportid.
for (const row of rowsToUpdate) {
    const existing = existingMap.get(makeRowKey(row));
    if (!existing) continue;

    const updateColumns = columns.filter(
        (column) => column !== "uploadbatchid"
    );

    const setClause = updateColumns
        .map((column) => `${column} = ?`)
        .join(", ");

    const values = updateColumns.map((column) => row[column] ?? null);

    await queryAsync(
        `UPDATE productionreport SET ${setClause} WHERE productionreportid = ?`,
        [...values, existing.productionreportid]
    );
}

return {
    affectedRows: rowsToInsert.length + rowsToUpdate.length,
    insertedRows,
    updatedRows,
    unchangedRows
};
 

};

// ======================================================
// GET PRODUCTION REPORT
// ======================================================

const getProductionReport = (filters = {}) => {
let sql = `SELECT * FROM productionreport WHERE 1 = 1`;
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

sql += " ORDER BY reportdate DESC, productionreportid DESC";

return queryAsync(sql, params);
 

};

// ======================================================
// GET PRODUCTION SUMMARY
// ======================================================

const getProductionSummary = (filters = {}) => {
let sql = `         SELECT
            COUNT(*) AS totalRecords,
            COALESCE(SUM(pair), 0) AS totalPairs,
            COALESCE(SUM(upperreceivedpair), 0) AS totalUpperReceivedPairs,
            COALESCE(SUM(upperstorepairqty), 0) AS totalUpperStorePairs,
            COALESCE(SUM(machinepairqty), 0) AS totalMachinePairs,
            COALESCE(SUM(firstpair), 0) AS totalFirstPairs,
            COALESCE(SUM(secondpair), 0) AS totalSecondPairs,
            COALESCE(SUM(rejection), 0) AS totalRejection,
            COALESCE(SUM(totalpair), 0) AS totalProductionPairs
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

return queryAsync(sql, params).then((rows) => rows[0]);


};

module.exports = {
insertProductionRows,
getProductionReport,
getProductionSummary
};
