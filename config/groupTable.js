const db = require('../config/connectdb')

const createGroupTable = () =>{
    const sql = `
    CREATE TABLE IF NOT EXISTS maingroup(
        groupid INT AUTO_INCREMENT PRIMARY KEY,
        groupname VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    )`;
    db.query (sql,(err) =>{
        if (err)
        {
             console.log("Group Table Error:", err);
        } else 
        {
            console.log("Group Table Created Successfully:");
        }
    });

};

module.exports = createGroupTable;