const db = require("../config/connectdb")

const createColorTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS color (
    colorid INT AUTO_INCREMENT PRIMARY KEY,
    color VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) `;
    db.query(sql, (err) => {
        if (err) {
            console.log("Color Table Error:", err);
        } else {
            console.log("Color table ready.");
        }

    })
}

module.exports = createColorTable;