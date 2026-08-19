const db = require("../config/connectdb")

const createCategoryTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS category (
    categoryid INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) `;
    db.query(sql, (err) => {
        if (err) {
            console.log("Category Table Error:", err);
        } else {
            console.log("Category table ready.");
        }

    })
}

module.exports = createCategoryTable;