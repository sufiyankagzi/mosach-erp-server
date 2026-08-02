const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Amaan#0712",
  database: "mosacherp",
});

db.connect((err) => {
  if (err) {
    console.log("Database Connection Failed:", err);
  } else {
    console.log("Database Connected Successfully");
  }
});

module.exports = db;