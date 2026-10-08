const db = require("../config/connectdb")

const createMaterialTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS material (
    materialid INT AUTO_INCREMENT PRIMARY KEY,
    material VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) `;
    db.query(sql, (err) => {
        if (err) {
            console.log("Material Table Error:", err);
        } else {
            console.log("Material table ready.");
        }

    })
}

module.exports = createMaterialTable;