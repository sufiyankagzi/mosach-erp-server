require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,

  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },
});

// Test Connection
pool.getConnection((err, connection) => {
  console.log("HOST =", JSON.stringify(process.env.DB_HOST));
  if (err) {
    console.error("Database Error:", err);
  } else {
    console.log("Database Connected Successfully");
    console.log("DB_HOST:", process.env.DB_HOST);
    console.log("DB_PORT:", process.env.DB_PORT);
    console.log("DB_USER:", process.env.DB_USER);
    console.log("DB_NAME:", process.env.DB_NAME);

    connection.release();
  }
});

module.exports = pool;
// require("dotenv").config();
// const mysql = require("mysql2");

// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   ssl: {
//     minVersion: "TLSv1.2",
//     rejectUnauthorized: true,
//   },
// });

// db.connect((err) => {
//   if (err) {
//     console.error("Database Error:", err);
//     console.log("DB_HOST:", process.env.DB_HOST);
// console.log("DB_PORT:", process.env.DB_PORT);
// console.log("DB_USER:", process.env.DB_USER);
// console.log("DB_NAME:", process.env.DB_NAME);
//   } else {
//     console.log("Database Connected Successfully");
//     console.log("DB_HOST:", process.env.DB_HOST);
// console.log("DB_PORT:", process.env.DB_PORT);
// console.log("DB_USER:", process.env.DB_USER);
// console.log("DB_NAME:", process.env.DB_NAME);
//   }
// });

// module.exports = db;