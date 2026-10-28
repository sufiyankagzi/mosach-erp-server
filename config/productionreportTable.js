const db = require("./connectdb");

// ======================================================
// PRODUCTION REPORT TABLE
// Create table if it does not exist and add missing columns
// ======================================================

const createProductionReportTable = () => {
const createTableSQL = `
CREATE TABLE IF NOT EXISTS productionreport (
productionreportid BIGINT AUTO_INCREMENT PRIMARY KEY,


        sku VARCHAR(100),
        packing INT DEFAULT 0,
        reportdate DATE,
        jobcard VARCHAR(150) NOT NULL,
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

        carton DECIMAL(12,2) DEFAULT 0,
        uploadbatchid VARCHAR(100),

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_production_jobcard (jobcard),
        INDEX idx_production_date (reportdate),
        INDEX idx_production_article (article),
        INDEX idx_production_sku (sku)
    )
`;

db.query(createTableSQL, (createError) => {
    if (createError) {
        console.error(
            "Production Report Table Creation Error:",
            createError
        );
        return;
    }

    console.log("Production Report table ready.");

    ensureProductionReportColumns();
});


};

// ======================================================
// CHECK AND ADD MISSING COLUMNS
// ======================================================

const ensureProductionReportColumns = () => {
const requiredColumns = [
{ name: "sku", definition: "VARCHAR(100) NULL" },
{ name: "packing", definition: "INT DEFAULT 0" },
{ name: "reportdate", definition: "DATE NULL" },
{ name: "jobcard", definition: "VARCHAR(150) NULL" },
{ name: "article", definition: "VARCHAR(100) NULL" },
{ name: "colour", definition: "VARCHAR(100) NULL" },
{ name: "size", definition: "VARCHAR(50) NULL" },
{ name: "pair", definition: "INT DEFAULT 0" },


    { name: "cuttingreceiveddate", definition: "DATE NULL" },
    { name: "cuttingcontractor", definition: "VARCHAR(150) NULL" },

    { name: "uppercontractor", definition: "VARCHAR(150) NULL" },
    { name: "upperissuedate", definition: "DATE NULL" },
    { name: "upperreceiveddate", definition: "DATE NULL" },
    { name: "upperreceivedpair", definition: "INT DEFAULT 0" },

    {
        name: "upperinsolecontractor",
        definition: "VARCHAR(150) NULL"
    },
    {
        name: "upperinsoleissueddate",
        definition: "DATE NULL"
    },

    {
        name: "upperstorereceiveddate",
        definition: "DATE NULL"
    },
    {
        name: "upperstorepairqty",
        definition: "INT DEFAULT 0"
    },
    {
        name: "upperstorestatus",
        definition: "VARCHAR(100) NULL"
    },

    { name: "machineno", definition: "VARCHAR(100) NULL" },
    { name: "machineissuedate", definition: "DATE NULL" },
    { name: "machinepairqty", definition: "INT DEFAULT 0" },

    { name: "firstpair", definition: "INT DEFAULT 0" },
    { name: "secondpair", definition: "INT DEFAULT 0" },
    { name: "rejection", definition: "INT DEFAULT 0" },
    { name: "totalpair", definition: "INT DEFAULT 0" },

    { name: "carton", definition: "DECIMAL(12,2) DEFAULT 0" },
    { name: "uploadbatchid", definition: "VARCHAR(100) NULL" },

    {
        name: "created_at",
        definition: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    },
    {
        name: "updated_at",
        definition:
            "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    }
];

const checkColumn = (index = 0) => {
    if (index >= requiredColumns.length) {
        console.log(
            "Production Report: All required columns checked successfully."
        );
        return;
    }

    const column = requiredColumns[index];

    const checkSQL = `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'productionreport'
          AND COLUMN_NAME = ?
    `;

    db.query(checkSQL, [column.name], (checkError, results) => {
        if (checkError) {
            console.error(
                `Error checking productionreport.${column.name}:`,
                checkError
            );
            return;
        }

        if (results.length > 0) {
            checkColumn(index + 1);
            return;
        }

        const alterSQL = `
            ALTER TABLE productionreport
            ADD COLUMN ${column.name} ${column.definition}
        `;

        db.query(alterSQL, (alterError) => {
            if (alterError) {
                console.error(
                    `Error adding productionreport.${column.name}:`,
                    alterError
                );
                return;
            }

            console.log(
                `Production Report: Added missing column ${column.name}.`
            );

            checkColumn(index + 1);
        });
    });
};

checkColumn();


};

module.exports = {
createProductionReportTable,
ensureProductionReportColumns
};
