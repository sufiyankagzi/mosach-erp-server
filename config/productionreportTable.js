
const db = require("../config/connectdb");

// ======================================================
// CREATE PRODUCTION REPORT TABLE
// ======================================================

const createProductionReportTable = () => {

    const sql = `
        CREATE TABLE IF NOT EXISTS productionreport (

            productionreportid BIGINT AUTO_INCREMENT PRIMARY KEY,

            sku VARCHAR(100),
            reportdate DATE,
            jobcard VARCHAR(50),

            article VARCHAR(100),
            colour VARCHAR(100),
            size VARCHAR(50),
            pair INT DEFAULT 0,

            cuttingreceiveddate DATE,
            cuttingcontractor VARCHAR(150),

            uppercontractor VARCHAR(150),
            upperissuedate DATE,
            upperreceiveddate DATE,
            upperreceivedpair INT DEFAULT 0,

            upperinsolecontractor VARCHAR(150),
            upperinsoleissueddate DATE,

            upperstorereceiveddate DATE,
            upperstorepairqty INT DEFAULT 0,

            upperstorestatus VARCHAR(100),

            machineno VARCHAR(100),
            machineissuedate DATE,
            machinepairqty INT DEFAULT 0,

            firstpair INT DEFAULT 0,
            secondpair INT DEFAULT 0,
            rejection INT DEFAULT 0,
            totalpair INT DEFAULT 0,

            uploadbatchid VARCHAR(100),

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,

            INDEX idx_production_date (reportdate),
            INDEX idx_production_jobcard (jobcard),
            INDEX idx_production_article (article),
            INDEX idx_production_sku (sku)

        )
    `;

    db.query(sql, (err) => {

        if (err) {
            console.log("Production Report Table Error:", err);
        } else {
            console.log("Production Report table ready.");
        }

    });

};

module.exports = {
    createProductionReportTable
};

