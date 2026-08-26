const db = require("../config/connectdb");


// ========================================
// GET ALL SIZE
// ========================================
exports.getAllSize = (callback) => {

    const sql = `
        SELECT 
            s.sizeid,
            s.sizegroupid,
            sg.sizegroup,
            s.size,
            s.created_at
        FROM size s
        LEFT JOIN sizegroup sg
            ON s.sizegroupid = sg.sizegroupid
        ORDER BY s.sizeid DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.error("GET ALL SIZE MODEL ERROR:", err);
            return callback(err);
        }

        console.log("GET ALL SIZE RESULT:", result);

        callback(null, result);
    });
};


// ========================================
// GET SIZE BY ID
// ========================================


exports.getSizeById = (id, callback) => {

    const sql = `
        SELECT
            s.sizeid,
            s.sizegroupid,
            sg.sizegroup,
            s.size,
            s.created_at
        FROM size s
        LEFT  JOIN sizegroup sg
            ON s.sizegroupid = sg.sizegroupid
        WHERE s.sizeid = ?
    `;

    db.query(sql, [id], callback);
};


// ========================================
// CREATE SIZE
// ========================================
exports.createSize = (data, callback) => {

    const checkSql = `
        SELECT sizeid
        FROM size
        WHERE sizegroupid = ?
        AND size = ?
    `;

    db.query(
        checkSql,
        [
            data.sizegroupid,
            data.size
        ],
        (err, result) => {

            if (err) {
                return callback(err);
            }

            if (result.length > 0) {
                return callback(
                    new Error(
                        "Size already exists in this size group"
                    )
                );
            }

            const sql = `
                INSERT INTO size
                (
                    sizegroupid,
                    size
                )
                VALUES (?, ?)
            `;

            db.query(
                sql,
                [
                    data.sizegroupid,
                    data.size
                ],
                callback
            );
        }
    );
};


// ========================================
// UPDATE SIZE
// ========================================
exports.updateSize = (id, data, callback) => {

    const checkSql = `
        SELECT sizeid
        FROM size
        WHERE sizegroupid = ?
        AND size = ?
        AND sizeid != ?
    `;

    db.query(
        checkSql,
        [
            data.sizegroupid,
            data.size,
            id
        ],
        (err, result) => {

            if (err) {
                return callback(err);
            }

            if (result.length > 0) {
                return callback(
                    new Error(
                        "Size already exists in this size group"
                    )
                );
            }

            const sql = `
                UPDATE size
                SET
                    sizegroupid = ?,
                    size = ?
                WHERE sizeid = ?
            `;

            db.query(
                sql,
                [
                    data.sizegroupid,
                    data.size,
                    id
                ],
                callback
            );
        }
    );
};


// ========================================
// DELETE SIZE
// ========================================
exports.deleteSize = (id, callback) => {

    const sql = `
        DELETE FROM size
        WHERE sizeid = ?
    `;

    db.query(
        sql,
        [id],
        callback
    );
};