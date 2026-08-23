const db = require("../config/connectdb");

// GET ALL SIZE GROUP
const getAllSizeGroup = (callback) => {
    const sql = `
        SELECT *
        FROM sizegroup
        ORDER BY sizegroupid DESC
    `;

    db.query(sql, callback);
};


// GET SINGLE SIZE GROUP
const getSizeGroupById = (id, callback) => {

    const sql = `
        SELECT *
        FROM sizegroup
        WHERE sizegroup = ?
    `;

    db.query(sql, [id], callback);
};


// CREATE SIZE GROUP
const createSizeGroup = (data, callback) => {

    const checkSql = `
        SELECT sizegroupid, sizegroup
        FROM sizegroup
        WHERE sizegroup = ?
    `;

    db.query(
        checkSql,
        [
            data.sizegroup
            
        ],
        (err, rows) => {

            if (err) return callback(err);

            for (const row of rows) {

                if (row.sizegroup === data.sizegroup) {
                    return callback(
                        new Error("Size group already exists")
                    );
                }

                
            }

            const sql = `
                INSERT INTO sizegroup
                (
                    sizegroup
                    
                )
                VALUES (?)
            `;

            db.query(
                sql,
                [
                    data.sizegroup,
                ],
                callback
            );
        }
    );
};


// UPDATE SIZE GROUP
const updateSizeGroup = (id, data, callback) => {

    const checkSql = `
        SELECT sizegroupid, sizegroup
        FROM sizegroup
        WHERE sizegroupid != ?
    `;

    db.query(
        checkSql,
        [
            id
        ],
        (err, rows) => {

            if (err) return callback(err);

            for (const row of rows) {

                if (row.sizegroup === data.sizegroup) {
                    return callback(
                        new Error("Size group already exists")
                    );
                }

                
            }

            const sql = `
                UPDATE sizegroup
                SET
                    sizegroup = ?
                WHERE sizegroupid = ?
            `;

            db.query(
                sql,
                [
                    data.sizegroup,
                    id
                ],
                callback
            );
        }
    );
};


// DELETE SIZE GROUP
const deleteSizeGroup = (id, callback) => {

    const sql = `
        DELETE FROM sizegroup
        WHERE sizegroupid = ?
    `;

    db.query(sql, [id], callback);
};


module.exports = {
    getAllSizeGroup,
    getSizeGroupById,
    createSizeGroup,    
    updateSizeGroup,
    deleteSizeGroup
};