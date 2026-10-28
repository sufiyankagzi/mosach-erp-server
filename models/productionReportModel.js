const db = require("../config/connectdb");

// ======================================================
// PRODUCTION REPORT MODEL
// MOSACH ERP
// ======================================================

// ======================================================
// DATABASE FIELDS USED FOR COMPARISON
// ======================================================

const productionFields = [
    "sku",
    "reportdate",
    "article",
    "colour",
    "size",
    "pair",

    // NEW FIELDS
    "packing",
    "carton",

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

// ======================================================
// HELPER: NORMALIZE VALUES FOR COMPARISON
// ======================================================

const normalizeValue = (value, field) => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }

    // Normalize dates
    if (
        field.toLowerCase().includes("date") ||
        field === "reportdate"
    ) {
        if (value instanceof Date) {
            return value.toISOString().slice(0, 10);
        }

        const text = String(value).trim();

        if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
            return text.slice(0, 10);
        }

        return text;
    }

    // Normalize integer and decimal numeric fields
    const numericFields = [
        "pair",
        "packing",
        "carton",
        "upperreceivedpair",
        "upperstorepairqty",
        "machinepairqty",
        "firstpair",
        "secondpair",
        "rejection",
        "totalpair"
    ];

    if (numericFields.includes(field)) {
        const number = Number(value);

        return Number.isFinite(number) ? number : 0;
    }

    return String(value).trim();
};

// ======================================================
// HELPER: CHECK IF RECORD HAS CHANGED
// ======================================================

const isRecordChanged = (existing, incoming) => {
    return productionFields.some((field) => {
        const oldValue = normalizeValue(existing[field], field);
        const newValue = normalizeValue(incoming[field], field);

        return oldValue !== newValue;
    });
};

// ======================================================
// 1. INSERT OR UPDATE PRODUCTION REPORT
// Requires UNIQUE INDEX on productionreport.jobcard
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

    // Remove records without Job Card
    const validRows = rows.filter((row) => {
        return (
            row.jobcard !== null &&
            row.jobcard !== undefined &&
            String(row.jobcard).trim() !== ""
        );
    });

    if (validRows.length === 0) {
        return {
            affectedRows: 0,
            insertedRows: 0,
            updatedRows: 0,
            unchangedRows: 0
        };
    }

    // Remove duplicate Job Cards from same upload.
    // Keep the last occurrence.
    const uniqueMap = new Map();

    for (const row of validRows) {
        const jobcard = String(row.jobcard).trim();

        uniqueMap.set(jobcard, {
            ...row,
            jobcard
        });
    }

    const uniqueRows = Array.from(uniqueMap.values());

    // Fetch existing records
    const jobcards = uniqueRows.map((row) => row.jobcard);
    const placeholders = jobcards.map(() => "?").join(", ");

    const selectSql = `
        SELECT *
        FROM productionreport
        WHERE jobcard IN (${placeholders})
    `;

    const existingRows = await new Promise((resolve, reject) => {
        db.query(selectSql, jobcards, (err, result) => {
            if (err) {
                return reject(err);
            }

            resolve(result);
        });
    });

    const existingMap = new Map();

    for (const row of existingRows) {
        existingMap.set(String(row.jobcard).trim(), row);
    }

    // Calculate insert/update/unchanged counts
    let insertedRows = 0;
    let updatedRows = 0;
    let unchangedRows = 0;

    for (const row of uniqueRows) {
        const existing = existingMap.get(row.jobcard);

        if (!existing) {
            insertedRows++;
        } else if (isRecordChanged(existing, row)) {
            updatedRows++;
        } else {
            unchangedRows++;
        }
    }

    // INSERT / UPDATE QUERY
    const sql = `
        INSERT INTO productionreport (
            sku,
            reportdate,
            jobcard,
            article,
            colour,
            size,
            pair,
            packing,
            carton,
            cuttingreceiveddate,
            cuttingcontractor,
            uppercontractor,
            upperissuedate,
            upperreceiveddate,
            upperreceivedpair,
            upperinsolecontractor,
            upperinsoleissueddate,
            upperstorereceiveddate,
            upperstorepairqty,
            upperstorestatus,
            machineno,
            machineissuedate,
            machinepairqty,
            firstpair,
            secondpair,
            rejection,
            totalpair,
            uploadbatchid
        )
        VALUES ?
        ON DUPLICATE KEY UPDATE
            sku = VALUES(sku),
            reportdate = VALUES(reportdate),
            article = VALUES(article),
            colour = VALUES(colour),
            size = VALUES(size),
            pair = VALUES(pair),
            packing = VALUES(packing),
            carton = VALUES(carton),
            cuttingreceiveddate = VALUES(cuttingreceiveddate),
            cuttingcontractor = VALUES(cuttingcontractor),
            uppercontractor = VALUES(uppercontractor),
            upperissuedate = VALUES(upperissuedate),
            upperreceiveddate = VALUES(upperreceiveddate),
            upperreceivedpair = VALUES(upperreceivedpair),
            upperinsolecontractor = VALUES(upperinsolecontractor),
            upperinsoleissueddate = VALUES(upperinsoleissueddate),
            upperstorereceiveddate = VALUES(upperstorereceiveddate),
            upperstorepairqty = VALUES(upperstorepairqty),
            upperstorestatus = VALUES(upperstorestatus),
            machineno = VALUES(machineno),
            machineissuedate = VALUES(machineissuedate),
            machinepairqty = VALUES(machinepairqty),
            firstpair = VALUES(firstpair),
            secondpair = VALUES(secondpair),
            rejection = VALUES(rejection),
            totalpair = VALUES(totalpair),
            uploadbatchid = VALUES(uploadbatchid)
    `;

    const values = uniqueRows.map((row) => [
        row.sku ?? null,
        row.reportdate ?? null,
        row.jobcard,
        row.article ?? null,
        row.colour ?? null,
        row.size ?? null,
        row.pair ?? 0,

        // NEW FIELDS
        row.packing ?? 0,
        row.carton ?? 0,

        row.cuttingreceiveddate ?? null,
        row.cuttingcontractor ?? null,
        row.uppercontractor ?? null,
        row.upperissuedate ?? null,
        row.upperreceiveddate ?? null,
        row.upperreceivedpair ?? 0,
        row.upperinsolecontractor ?? null,
        row.upperinsoleissueddate ?? null,
        row.upperstorereceiveddate ?? null,
        row.upperstorepairqty ?? 0,
        row.upperstorestatus ?? null,
        row.machineno ?? null,
        row.machineissuedate ?? null,
        row.machinepairqty ?? 0,
        row.firstpair ?? 0,
        row.secondpair ?? 0,
        row.rejection ?? 0,
        row.totalpair ?? 0,
        row.uploadbatchid ?? null
    ]);

    // Execute query
    const result = await new Promise((resolve, reject) => {
        db.query(sql, [values], (err, result) => {
            if (err) {
                console.error(
                    "Insert/Update Production Report Error:",
                    err
                );

                return reject(err);
            }

            resolve(result);
        });
    });

    return {
        affectedRows: result.affectedRows,
        insertedRows,
        updatedRows,
        unchangedRows
    };
};

// ======================================================
// 2. GET PRODUCTION REPORT
// ======================================================

const getProductionReport = (filters = {}) => {
    return new Promise((resolve, reject) => {
        let sql = `
            SELECT *
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
        let sql = `
            SELECT
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
// 4. EXPORT MODEL FUNCTIONS
// ======================================================

module.exports = {
    insertProductionRows,
    getProductionReport,
    getProductionSummary
};