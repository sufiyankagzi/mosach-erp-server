const db = require("../config/connectdb");

// GET ALL MATERIAL
const getAllMaterial = (callback) => {
    const sql = `
        SELECT *
        FROM material
        ORDER BY materialid DESC
    `;

    db.query(sql, callback);
};


// GET SINGLE MATERIAL
const getMaterialById = (id, callback) => {

    const sql = `
        SELECT *
        FROM material
        WHERE materialid = ?
    `;

    db.query(sql, [id], callback);
};


// CREATE MATERIAL
const createMaterial = (data, callback) => {

    const checkSql = `
        SELECT materialID, material
        FROM material
        WHERE material = ?
    `;

    db.query(
        checkSql,
        [
            data.material
            
        ],
        (err, rows) => {

            if (err) return callback(err);

            for (const row of rows) {

                if (row.material === data.material) {
                    return callback(
                        new Error("Material already exists")
                    );
                }

                
            }

            const sql = `
                INSERT INTO material
                (
                    material
                    
                )
                VALUES (?)
            `;

            db.query(
                sql,
                [
                    data.material,
                ],
                callback
            );
        }
    );
};


// UPDATE MATERIAL
const updateMaterial = (id, data, callback) => {

    const checkSql = `
        SELECT materialid, material
        FROM material
        WHERE materialid != ?
    `;

    db.query(
        checkSql,
        [
            id
        ],
        (err, rows) => {

            if (err) return callback(err);

            for (const row of rows) {

                if (row.material === data.material) {
                    return callback(
                        new Error("Material already exists")
                    );
                }

                
            }

            const sql = `
                UPDATE material
                SET
                    material = ?
                WHERE materialid = ?
            `;

            db.query(
                sql,
                [
                    data.material,
                    id
                ],
                callback
            );
        }
    );
};


// DELETE MATERIAL
const deleteMaterial = (id, callback) => {

    const sql = `
        DELETE FROM material
        WHERE materialid = ?
    `;

    db.query(sql, [id], callback);
};


module.exports = {
    getAllMaterial,
    getMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial
};