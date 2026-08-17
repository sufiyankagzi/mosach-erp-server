const db = require("../config/connectdb")

const createGenderTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS gender (
    genderid INT AUTO_INCREMENT PRIMARY KEY,
    gender VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) `;
    db.query(sql, (err) => {
        if (err) {
            console.log("Gender Table Error:", err);
        } else {
            console.log("Gender table ready.");
        }

    })
}

module.exports = createGenderTable;