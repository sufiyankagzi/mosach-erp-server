
const db = require("./connectdb");

const createProductionReportTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS productionreport (

            productionreportid BIGINT AUTO_INCREMENT PRIMARY KEY,

            -- Excel Column 1-8
            sku VARCHAR(100),
            packing INT DEFAULT 0,
            reportdate DATE,
            jobcard VARCHAR(150) NOT NULL,
            article VARCHAR(100),
            colour VARCHAR(100),
            size VARCHAR(50),
            pair INT DEFAULT 0,

            -- Excel Column 9-14
            cuttingreceiveddate DATE,
            cuttingcontractor VARCHAR(150),

            uppercontractor VARCHAR(150),
            upperissuedate DATE,
            upperreceiveddate DATE,
            upperreceivedpair INT DEFAULT 0,

            -- Excel Column 15-19
            upperinsolecontractor VARCHAR(150),
            upperinsoleissueddate DATE,

            upperstorereceiveddate DATE,
            upperstorepairqty INT DEFAULT 0,
            upperstorestatus VARCHAR(100),

            -- Excel Column 20-22
            machineno VARCHAR(100),
            machineissuedate DATE,
            machinepairqty INT DEFAULT 0,

            -- Excel Column 23-26
            firstpair INT DEFAULT 0,
            secondpair INT DEFAULT 0,
            rejection INT DEFAULT 0,
            totalpair INT DEFAULT 0,

            -- Additional system columns
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

    db.query(sql, (err) => {
        if (err) {
            console.error("Production Report Table Error:", err);
            return;
        }

        console.log("Production Report table ready.");

        // Add missing columns to an existing table.
        const columns = [
            {
                name: "packing",
                definition: "INT DEFAULT 0"
            },
            {
                name: "carton",
                definition: "DECIMAL(12,2) DEFAULT 0"
            },
            {
                name: "uploadbatchid",
                definition: "VARCHAR(100)"
            }
        ];

        const addMissingColumn = (index = 0) => {
            if (index >= columns.length) {
                console.log("Production Report columns checked.");
                return;
            }

            const column = columns[index];

            const checkSql = `
                SELECT COUNT(*) AS total
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'productionreport'
                  AND COLUMN_NAME = ?
            `;

            db.query(checkSql, [column.name], (checkErr, results) => {
                if (checkErr) {
                    console.error(
                        `Error checking ${column.name}:`,
                        checkErr
                    );
                    return;
                }

                if (results[0].total > 0) {
                    addMissingColumn(index + 1);
                    return;
                }

                const alterSql = `
                    ALTER TABLE productionreport
                    ADD COLUMN ${column.name} ${column.definition}
                `;

                db.query(alterSql, (alterErr) => {
                    if (alterErr) {
                        console.error(
                            `Error adding ${column.name}:`,
                            alterErr
                        );
                        return;
                    }

                    console.log(`${column.name} column added.`);
                    addMissingColumn(index + 1);
                });
            });
        };

        addMissingColumn();
    });
};

module.exports = {
    createProductionReportTable
};

