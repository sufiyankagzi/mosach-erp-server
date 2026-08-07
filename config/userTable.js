const db = require("../config/connectdb");

const createUserTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
    userid INT AUTO_INCREMENT PRIMARY KEY,
    companyid INT NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    fullname VARCHAR(150) NOT NULL,
    mobileno VARCHAR(15) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN','USER') DEFAULT 'USER',
    isactive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (companyid) REFERENCES company(companyid)
) `;

  db.query(sql, (err) => {
    if (err) {
      console.log("Users Table Error:", err);
    } else {
      console.log("Users table ready.");
    }
  });
};

module.exports = createUserTable;