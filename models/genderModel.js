const db = require("../config/connectdb");

// GET ALL GENDER
const getAllGender = (callback) => {
    const sql = `
        SELECT *
        FROM gender
        ORDER BY genderid DESC
    `;

    db.query(sql, callback);
};


// GET SINGLE GENDER
const getGenderById = (id, callback) => {

    const sql = `
        SELECT *
        FROM gender
        WHERE genderid = ?
    `;

    db.query(sql, [id], callback);
};


// CREATE GENDER
const createGender = (data, callback) => {

    const checkSql = `
        SELECT genderid, gender
        FROM gender
        WHERE geder = ?
    `;

    db.query(
        checkSql,
        [
            data.gender
            
        ],
        (err, rows) => {

            if (err) return callback(err);

            for (const row of rows) {

                if (row.gender === data.gender) {
                    return callback(
                        new Error("Gender already exists")
                    );
                }

                
            }

            const sql = `
                INSERT INTO gender
                (
                    gender
                    
                )
                VALUES (?)
            `;

            db.query(
                sql,
                [
                    data.gender,
                ],
                callback
            );
        }
    );
};


// UPDATE GENDER
const updateGender = (id, data, callback) => {

    const checkSql = `
        SELECT genderid, gender
        FROM gender
        WHERE genderid != ?
        AND (
            gender = ?
        )
    `;

    db.query(
        checkSql,
        [
            id,
            data.gender
        ],
        (err, rows) => {

            if (err) return callback(err);

            for (const row of rows) {

                if (row.gender === data.gender) {
                    return callback(
                        new Error("Gender already exists")
                    );
                }

                
            }

            const sql = `
                UPDATE gender
                SET
                    gender = ?,
                WHERE genderid = ?
            `;

            db.query(
                sql,
                [
                    data.gender,
                    id
                ],
                callback
            );
        }
    );
};


// DELETE GENDER
const deleteGender = (id, callback) => {

    const sql = `
        DELETE FROM gender
        WHERE genderid = ?
    `;

    db.query(sql, [id], callback);
};


module.exports = {
    getAllGender,
    getGenderById,
    createGender,
    updateGender,
    deleteGender
};