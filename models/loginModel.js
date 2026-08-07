const db = require("../config/connectdb");

const getUserByUsername = (username, callback) => {

    const sql = `
        SELECT *
        FROM users
        WHERE username = ?
        AND isactive = 1
    `;

    db.query(sql, [username], callback);
};

module.exports = {
    getUserByUsername
};