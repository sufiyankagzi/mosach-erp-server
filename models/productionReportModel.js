
const db = require("../config/connectdb");

// ======================================================
// PRODUCTION REPORT MODEL
// MOSACH ERP
// ======================================================


// ======================================================
// 1. INSERT PRODUCTION REPORT DATA
// ======================================================

const insertProductionRows = (rows) => {

    return new Promise((resolve, reject) => {

        if (!Array.isArray(rows) || rows.length === 0) {
            return resolve({
                affectedRows: 0
            });
        }

        const sql = `
            INSERT INTO productionreport (

                sku,
                reportdate,
                jobcard,
                article,
                colour,
                size,
                pair,

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
        `;

        const values = rows.map(row => [

            row.sku ?? null,
            row.reportdate ?? null,
            row.jobcard ?? null,
            row.article ?? null,
            row.colour ?? null,
            row.size ?? null,
            row.pair ?? 0,

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

        db.query(sql, [values], (err, result) => {

            if (err) {
                console.error(
                    "Insert Production Report Error:",
                    err
                );

                return reject(err);
            }

            resolve({
                affectedRows: result.affectedRows
            });

        });

    });

};


// ======================================================
// 2. GET PRODUCTION REPORT
// Supports date, article, job card and SKU filters
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

        sql += " ORDER BY reportdate DESC, productionreportid DESC";

        db.query(sql, params, (err, rows) => {

            if (err) {
                console.error(
                    "Get Production Report Error:",
                    err
                );

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
                console.error(
                    "Production Summary Error:",
                    err
                );

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

