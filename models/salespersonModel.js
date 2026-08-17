const db = require("../config/connectdb");

// GET ALL SALES PERSON
const getAllSalesPerson = (callback) => {
    const sql = `
        SELECT *
        FROM salesperson
        ORDER BY salespersonid DESC
    `;

    db.query(sql, callback);
};


// GET SINGLE SALES PERSON
const getSalesPersonById = (id, callback) => {

    const sql = `
        SELECT *
        FROM salesperson
        WHERE salespersonid = ?
    `;

    db.query(sql, [id], callback);
};


// CREATE SALES PERSON
const createSalesPerson = (data, callback) => {

    const checkSql = `
        SELECT salespersonid, salesperson, mobileno, isactive
        FROM salesperson
        WHERE salesperson = ?
           OR mobileno = ?
    `;

    db.query(
        checkSql,
        [
            data.salesperson,
            data.mobileno
        ],
        (err, rows) => {

            if (err) return callback(err);

            for (const row of rows) {

                if (row.salesperson === data.salesperson) {
                    return callback(
                        new Error("Sales Person already exists")
                    );
                }

                if (
                    data.mobileno &&
                    row.mobileno === data.mobileno
                ) {
                    return callback(
                        new Error("Mobile No. already exists")
                    );
                }
            }

            const sql = `
                INSERT INTO salesperson
                (
                    salesperson,
                    mobileno,
                    isactive
                )
                VALUES (?, ?, ?)
            `;

            db.query(
                sql,
                [
                    data.salesperson,
                    data.mobileno || null,
                    data.isactive ?? true
                ],
                callback
            );
        }
    );
};


// UPDATE SALES PERSON
const updateSalesPerson = (id, data, callback) => {

    const checkSql = `
        SELECT salespersonid, salesperson, mobileno
        FROM salesperson
        WHERE salespersonid != ?
        AND (
            salesperson = ?
            OR mobileno = ?
        )
    `;

    db.query(
        checkSql,
        [
            id,
            data.salesperson,
            data.mobileno
        ],
        (err, rows) => {

            if (err) return callback(err);

            for (const row of rows) {

                if (row.salesperson === data.salesperson) {
                    return callback(
                        new Error("Sales Person already exists")
                    );
                }

                if (
                    data.mobileno &&
                    row.mobileno === data.mobileno
                ) {
                    return callback(
                        new Error("Mobile No. already exists")
                    );
                }
            }

            const sql = `
                UPDATE salesperson
                SET
                    salesperson = ?,
                    mobileno = ?,
                    isactive = ?
                WHERE salespersonid = ?
            `;

            db.query(
                sql,
                [
                    data.salesperson,
                    data.mobileno || null,
                    data.isactive ?? true,
                    id
                ],
                callback
            );
        }
    );
};


// DELETE SALES PERSON
const deleteSalesPerson = (id, callback) => {

    const sql = `
        DELETE FROM salesperson
        WHERE salespersonid = ?
    `;

    db.query(sql, [id], callback);
};


module.exports = {
    getAllSalesPerson,
    getSalesPersonById,
    createSalesPerson,
    updateSalesPerson,
    deleteSalesPerson
};