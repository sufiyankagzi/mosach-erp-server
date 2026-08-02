const db = require("../config/connectdb");

const createCompanyTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS company (
      companyid INT AUTO_INCREMENT PRIMARY KEY,
      companycode VARCHAR(150) UNIQUE,
      companyname VARCHAR(150) NOT NULL,
      gstno VARCHAR(15) UNIQUE,
      panno VARCHAR(10) UNIQUE,
      mobileno VARCHAR(15),
      whatsappno VARCHAR(15),
      email VARCHAR(100) UNIQUE,
      website VARCHAR(100),
      contactperson VARCHAR(100),
      address1 VARCHAR(255),
      address2 VARCHAR(255),
      city VARCHAR(100),
      state VARCHAR(100),
      country VARCHAR(100),
      pincode VARCHAR(20),
      logo VARCHAR(255),
      isactive BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(sql, (err) => {
    if (err) {
      console.log("Company Table Error:", err);
    } else {
      console.log("Company table ready.");
    }
  });
};

module.exports = createCompanyTable;