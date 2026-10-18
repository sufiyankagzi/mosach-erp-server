
const db = require("../config/connectdb");

// ======================================================
// PRODUCTION REPORT MODEL
// MOSACH ERP
// ======================================================


// ======================================================
// 1. INSERT OR UPDATE PRODUCTION REPORT DATA
// MOSACH ERP
// Job Card No. is UNIQUE
// ======================================================


const insertProductionRows = (rows) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      return resolve({
        affectedRows: 0,
        insertedRows: 0,
        updatedRows: 0,
      });
    }

    const validRows = rows.filter(
      (row) => row.jobcard && String(row.jobcard).trim() !== ""
    );

    if (validRows.length === 0) {
      return resolve({
        affectedRows: 0,
        insertedRows: 0,
        updatedRows: 0,
      });
    }

    // Duplicate Job Card ko ek hi baar process karein.
    // Excel mein same Job Card multiple times ho to last row use hogi.
    const uniqueRowsMap = new Map();

    validRows.forEach((row) => {
      uniqueRowsMap.set(String(row.jobcard).trim(), {
        ...row,
        jobcard: String(row.jobcard).trim(),
      });
    });

    const uniqueRows = Array.from(uniqueRowsMap.values());

    const jobcards = uniqueRows.map((row) => row.jobcard);

    // Check karein ki kaunse Job Cards database mein pehle se hain.
    const checkSql = `
      SELECT jobcard
      FROM productionreport
      WHERE jobcard IN (?)
    `;

    db.query(checkSql, [jobcards], (checkErr, existingResults) => {
      if (checkErr) {
        console.error("Check Existing Job Cards Error:", checkErr);
        return reject(checkErr);
      }

      const existingJobCards = new Set(
        existingResults.map((row) => String(row.jobcard).trim())
      );

      const updatedRows = uniqueRows.filter((row) =>
        existingJobCards.has(row.jobcard)
      ).length;

      const insertedRows = uniqueRows.length - updatedRows;

      const sql = `
        INSERT INTO productionreport (
          sku, reportdate, jobcard, article, colour, size, pair,
          cuttingreceiveddate, cuttingcontractor,
          uppercontractor, upperissuedate, upperreceiveddate,
          upperreceivedpair, upperinsolecontractor, upperinsoleissuedate,
          upperstorereceiveddate, upperstorepairqty, upperstorestatus,
          machineno, machineissuedate, machinepairqty,
          firstpair, secondpair, rejection, totalpair, uploadbatchid
        )
        VALUES ?
        ON DUPLICATE KEY UPDATE
          sku = VALUES(sku),
          reportdate = VALUES(reportdate),
          article = VALUES(article),
          colour = VALUES(colour),
          size = VALUES(size),
          pair = VALUES(pair),
          cuttingreceiveddate = VALUES(cuttingreceiveddate),
          cuttingcontractor = VALUES(cuttingcontractor),
          uppercontractor = VALUES(uppercontractor),
          upperissuedate = VALUES(upperissuedate),
          upperreceiveddate = VALUES(upperreceiveddate),
          upperreceivedpair = VALUES(upperreceivedpair),
          upperinsolecontractor = VALUES(upperinsolecontractor),
          upperinsoleissuedate = VALUES(upperinsoleissuedate),
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
        row.cuttingreceiveddate ?? null,
        row.cuttingcontractor ?? null,
        row.uppercontractor ?? null,
        row.upperissuedate ?? null,
        row.upperreceiveddate ?? null,
        row.upperreceivedpair ?? 0,
        row.upperinsolecontractor ?? null,
        row.upperinsoleissuedate ?? null,
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
        row.uploadbatchid ?? null,
      ]);

      db.query(sql, [values], (err, result) => {
        if (err) {
          console.error("Insert/Update Production Report Error:", err);
          return reject(err);
        }

        resolve({
          affectedRows: result.affectedRows,
          insertedRows,
          updatedRows,
        });
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

