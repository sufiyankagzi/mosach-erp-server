const db = require("../config/connectdb")

const createSizeGroupTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS sizegroup (
    sizegorupid INT AUTO_INCREMENT PRIMARY KEY,
    sizegroup VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) `;
    db.query(sql, (err) => {
        if (err) {
            console.log("Size Group Table Error:", err);
        } else {
            console.log("Size group table ready.");
        }

    })
}

module.exports = createSizeGroupTable;