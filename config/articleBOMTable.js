const db = require("../config/connectdb");

const createArticleBomTable = () => {

    const sql = `
        CREATE TABLE IF NOT EXISTS articlebom (
            articlebomid INT AUTO_INCREMENT PRIMARY KEY,

            articleid INT NOT NULL,
            categoryid INT NULL,
            colorid INT NULL,
            sizegroupid INT NULL,

            upperrexineid INT NULL,
            upperrexineavg DECIMAL(10,4) NULL,

            insolerexineid INT NULL,
            insolerexineavg DECIMAL(10,4) NULL,

            epdmid INT NULL,
            epdmavg DECIMAL(10,4) NULL,

            liningid INT NULL,
            liningavg DECIMAL(10,4) NULL,

            componentsid INT NULL,
            componentsavg DECIMAL(10,4) NULL,

            other1id INT NULL,
            other1avg DECIMAL(10,4) NULL,

            other2id INT NULL,
            other2avg DECIMAL(10,4) NULL,

            other3id INT NULL,
            other3avg DECIMAL(10,4) NULL,

            other4id INT NULL,
            other4avg DECIMAL(10,4) NULL,

            other5id INT NULL,
            other5avg DECIMAL(10,4) NULL,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,

            INDEX idx_articleid (articleid),
            INDEX idx_categoryid (categoryid),
            INDEX idx_colorid (colorid),
            INDEX idx_sizegroupid (sizegroupid),
            INDEX idx_upperrexineid (upperrexineid),
            INDEX idx_insolerexineid (insolerexineid),
            INDEX idx_epdmid (epdmid),
            INDEX idx_liningid (liningid),
            INDEX idx_componentsid (componentsid)
        )
    `;

    db.query(sql, (err) => {
        if (err) {
            console.log("Article BOM Table Error:", err);
        } else {
            console.log("Article BOM table ready.");
        }
    });
};

module.exports = createArticleBomTable;