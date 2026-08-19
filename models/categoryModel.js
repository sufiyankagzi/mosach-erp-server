const db = require("../config/connectdb");

// GET ALL CATEGORY
const getAllCategory = (callback) => {
    const sql = `
        SELECT *
        FROM category
        ORDER BY categoryid DESC
    `;

    db.query(sql, callback);
};


// GET SINGLE CATEGORY
const getCategoryById = (id, callback) => {

    const sql = `
        SELECT *
        FROM category
        WHERE categoryid = ?
    `;

    db.query(sql, [id], callback);
};


// CREATE CATEGORY
const createCategory = (data, callback) => {

    const checkSql = `
        SELECT categoryid, category
        FROM category
        WHERE category = ?
    `;

    db.query(
        checkSql,
        [
            data.category
            
        ],
        (err, rows) => {

            if (err) return callback(err);

            for (const row of rows) {

                if (row.category === data.category) {
                    return callback(
                        new Error("Category already exists")
                    );
                }

                
            }

            const sql = `
                INSERT INTO category
                (
                    category
                    
                )
                VALUES (?)
            `;

            db.query(
                sql,
                [
                    data.category,
                ],
                callback
            );
        }
    );
};


// UPDATE CATEGORY
const updateCategory = (id, data, callback) => {

    const checkSql = `
        SELECT categoryid, category
        FROM category
        WHERE categoryid != ?
    `;

    db.query(
        checkSql,
        [
            id
        ],
        (err, rows) => {

            if (err) return callback(err);

            for (const row of rows) {

                if (row.category === data.category) {
                    return callback(
                        new Error("Category already exists")
                    );
                }

                
            }

            const sql = `
                UPDATE category
                SET
                    category = ?
                WHERE categoryid = ?
            `;

            db.query(
                sql,
                [
                    data.category,
                    id
                ],
                callback
            );
        }
    );
};


// DELETE CATEGORY
const deleteCategory = (id, callback) => {

    const sql = `
        DELETE FROM category
        WHERE categoryid = ?
    `;

    db.query(sql, [id], callback);
};


module.exports = {
    getAllCategory,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};