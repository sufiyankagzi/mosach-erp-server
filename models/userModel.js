const bcrypt = require("bcrypt");
const db = require("../config/connectdb");


// GET ALL USERS
const getAllUsers = (callback) => {
    const sql = "SELECT * FROM users ORDER BY userid  DESC";

    db.query(sql, callback);
};


// GET SINGLE USER
const getUserById = (id, callback) => {

    const sql = "SELECT * FROM users WHERE userid =?";

    db.query(sql, [id], callback);

};


// CREATE USERS
const createUser = (data, callback) => {

    const checkSql = `
        SELECT userid, companyid, username, fullname, mobileno, password, role, isactive
        FROM users
        WHERE username = ?
           OR mobileno = ?
    `;

    db.query(
        checkSql,
        [
            data.username,
            data.mobileno
        ],
        (err, rows) => {

            if (err) return callback(err);

            for (const row of rows) {

                if (row.username === data.username) {
                    return callback(new Error("Username already exists"));
                }

                if (row.mobileno === data.mobileno) {
                    return callback(new Error("Mobile No. already exists"));
                }

            }

            // Hash Password
            bcrypt.hash(data.password, 10, (err, hashedPassword) => {

                if (err) return callback(err);

                const sql = `
                    INSERT INTO users
                    (
                        companyid,
                        username,
                        fullname,
                        mobileno,
                        password,
                        role,
                        isactive
                    )
                    VALUES (?,?,?,?,?,?,?)
                `;

                db.query(
                    sql,
                    [
                        data.companyid,
                        data.username,
                        data.fullname,
                        data.mobileno,
                        hashedPassword,
                        data.role,
                        data.isactive
                    ],
                    callback
                );

            });

        }
    );

};


// UPDATE USER
const updateUser = (id, data, callback) => {

    const checkSql = `
        SELECT userid, username, mobileno
        FROM users
        WHERE userid != ?
        AND (
            username = ?
            OR mobileno = ?
        )
    `;

    db.query(
        checkSql,
        [
            id,
            data.username,
            data.mobileno
        ],
        (err, rows) => {

            if (err) return callback(err);

            for (const row of rows) {

                if (row.username === data.username) {
                    return callback(new Error("Username already exists"));
                }

                if (row.mobileno === data.mobileno) {
                    return callback(new Error("Mobile No. already exists"));
                }

            }

            // Password change karna hai
            if (data.password && data.password.trim() !== "") {

                bcrypt.hash(data.password, 10, (err, hashedPassword) => {

                    if (err) return callback(err);

                    const sql = `
                        UPDATE users SET
                            companyid=?,
                            username=?,
                            fullname=?,
                            mobileno=?,
                            password=?,
                            role=?,
                            isactive=?
                        WHERE userid=?
                    `;

                    db.query(
                        sql,
                        [
                            data.companyid,
                            data.username,
                            data.fullname,
                            data.mobileno,
                            hashedPassword,
                            data.role,
                            data.isactive,
                            id
                        ],
                        callback
                    );

                });

            }
            // Password change nahi karna
            else {

                const sql = `
                    UPDATE users SET
                        companyid=?,
                        username=?,
                        fullname=?,
                        mobileno=?,
                        role=?,
                        isactive=?
                    WHERE userid=?
                `;

                db.query(
                    sql,
                    [
                        data.companyid,
                        data.username,
                        data.fullname,
                        data.mobileno,
                        data.role,
                        data.isactive,
                        id
                    ],
                    callback
                );

            }

        }
    );

};


// DELETE USER

const deleteUser=(id,callback)=>{


    const sql="DELETE FROM users WHERE userid=?";


    db.query(sql,[id],callback);


};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};