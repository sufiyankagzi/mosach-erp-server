const db = require("../config/connectdb");

const createSalesPersonTable = () => {
 const sql = `
    CREATE TABLE IF NOT EXISTS salesperson (
    salespersonid INT AUTO_INCREMENT PRIMARY KEY,
    salesperson VARCHAR(100) NOT NULL UNIQUE,
    mobileno VARCHAR(15) UNIQUE,
    isactive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) `;

  db.query(sql, (err) => {
    if (err) {
      console.log("Sales Person Table Error:", err);
    } else {
      console.log("Sales Person table ready.");
    }
  });
};

module.exports = createSalesPersonTable;