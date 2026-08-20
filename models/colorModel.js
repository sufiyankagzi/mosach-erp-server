const db = require("../config/connectdb");

// GET ALL COLOR
const getAllColor = (callback) => {
    const sql = `
        SELECT *
        FROM color
        ORDER BY colorid DESC
    `;

    db.query(sql, callback);
};


// GET SINGLE COLOR
const getColorById = (id, callback) => {

    const sql = `
        SELECT *
        FROM color
        WHERE colorid = ?
    `;

    db.query(sql, [id], callback);
};


// CREATE COLOR
const createColor = (data, callback) => {

    const checkSql = `
        SELECT colorid, color
        FROM color
        WHERE color = ?
    `;

    db.query(
        checkSql,
        [
            data.color
            
        ],
        (err, rows) => {

            if (err) return callback(err);

            for (const row of rows) {

                if (row.color === data.color) {
                    return callback(
                        new Error("Color already exists")
                    );
                }

                
            }

            const sql = `
                INSERT INTO color
                (
                    color
                    
                )
                VALUES (?)
            `;

            db.query(
                sql,
                [
                    data.color,
                ],
                callback
            );
        }
    );
};


// UPDATE COLOR
const updateColor = (id, data, callback) => {

    const checkSql = `
        SELECT colorid, color
        FROM color
        WHERE colorid != ?
    `;

    db.query(
        checkSql,
        [
            id
        ],
        (err, rows) => {

            if (err) return callback(err);

            for (const row of rows) {

                if (row.color === data.color) {
                    return callback(
                        new Error("Color already exists")
                    );
                }

                
            }

            const sql = `
                UPDATE color
                SET
                    color = ?
                WHERE colorid = ?
            `;

            db.query(
                sql,
                [
                    data.color,
                    id
                ],
                callback
            );
        }
    );
};


// DELETE COLOR
const deleteColor = (id, callback) => {

    const sql = `
        DELETE FROM color
        WHERE colorid = ?
    `;

    db.query(sql, [id], callback);
};


module.exports = {
    getAllColor,
    getColorById,
    createColor,
    updateColor,
    deleteColor
};