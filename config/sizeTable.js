const db = require("../config/connectdb")

const createSizeTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS size (
    sizeid INT AUTO_INCREMENT PRIMARY KEY,
    sizegroupid INT NOT NULL,
    size VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_size_group (sizegroupid, size),

    CONSTRAINT fk_size_sizegroup
        FOREIGN KEY (sizegroupid)
        REFERENCES sizegroup(sizegroupid)
) `;
    db.query(sql, (err) => {
        if (err) {
            console.log("Size Table Error:", err);
        } else {
            console.log("Size table ready.");
        }

    })
}

module.exports = createSizeTable;