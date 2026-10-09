    const db = require("../config/connectdb");


    const getAllArticleBom = (callback) => {
    const sql = `
        SELECT
            ab.*,
            a.articleno AS articleno,
            a.articlename AS articlename,
            uppermat.material AS upperrexine,
            insolemat.material AS insolerexine,
            epdmmat.material AS epdm,
            liningmat.material AS lining,
            compmat.material AS components
        FROM articlebom ab
        LEFT JOIN articlemaster a
            ON a.articleid = ab.articleid
        LEFT JOIN material uppermat
            ON uppermat.materialid = ab.upperrexineid
        LEFT JOIN material insolemat
            ON insolemat.materialid = ab.insolerexineid
        LEFT JOIN material epdmmat
            ON epdmmat.materialid = ab.epdmid
        LEFT JOIN material liningmat
            ON liningmat.materialid = ab.liningid
        LEFT JOIN material compmat
            ON compmat.materialid = ab.componentsid
        ORDER BY ab.articlebomid DESC
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error("GET ARTICLE BOM ERROR:", err);
            return callback(err);
        }

        console.log("ARTICLE BOM API DATA:", rows);

        callback(null, rows);
    });
};

    // ======================================================
    // GET SINGLE ARTICLE BOM
    // ======================================================

    const getArticleBomById = (id, callback) => {

        const sql = `
            SELECT *
            FROM articlebom
            WHERE articlebomid = ?
        `;

        db.query(sql, [id], callback);
    };


    // ======================================================
    // GET BOM BY ARTICLE ID
    // ======================================================

    const getArticleBomByArticleId = (articleid, callback) => {

        const sql = `
            SELECT *
            FROM articlebom
            WHERE articleid = ?
            ORDER BY articlebomid DESC
        `;

        db.query(sql, [articleid], callback);
    };


    // ======================================================
    // CREATE ARTICLE BOM
    // ======================================================

    const createArticleBom = (data, callback) => {

        const checkSql = `
            SELECT articlebomid
            FROM articlebom
            WHERE articleid = ?
            AND categoryid = ?
            AND colorid = ?
            AND sizegroupid = ?
        `;

        db.query(
            checkSql,
            [
                data.articleid,
                data.categoryid,
                data.colorid,
                data.sizegroupid
            ],
            (err, rows) => {

                if (err) return callback(err);

                if (rows.length > 0) {
                    return callback(
                        new Error(
                            "Article BOM already exists for this Article, Category, Color and Size Group"
                        )
                    );
                }


                const sql = `
                    INSERT INTO articlebom
                    (
                        articleid,
                        categoryid,
                        colorid,
                        sizegroupid,

                        upperrexineid,
                        upperrexineavg,

                        insolerexineid,
                        insolerexineavg,

                        epdmid,
                        epdmavg,

                        liningid,
                        liningavg,

                        componentsid,
                        componentsavg,

                        other1id,
                        other1avg,

                        other2id,
                        other2avg,

                        other3id,
                        other3avg,

                        other4id,
                        other4avg,

                        other5id,
                        other5avg
                    )
                    VALUES (
                        ?, ?, ?, ?,
                        ?, ?,
                        ?, ?,
                        ?, ?,
                        ?, ?,
                        ?, ?,
                        ?, ?,
                        ?, ?,
                        ?, ?,
                        ?, ?,
                        ?, ?
                    )
                `;

                db.query(
                    sql,
                    [
                        data.articleid,
                        data.categoryid,
                        data.colorid,
                        data.sizegroupid,

                        data.upperrexineid,
                        data.upperrexineavg,

                        data.insolerexineid,
                        data.insolerexineavg,

                        data.epdmid,
                        data.epdmavg,

                        data.liningid,
                        data.liningavg,

                        data.componentsid,
                        data.componentsavg,

                        data.other1id,
                        data.other1avg,

                        data.other2id,
                        data.other2avg,

                        data.other3id,
                        data.other3avg,

                        data.other4id,
                        data.other4avg,

                        data.other5id,
                        data.other5avg
                    ],
                    callback
                );
            }
        );
    };


    // ======================================================
    // UPDATE ARTICLE BOM
    // ======================================================

    const updateArticleBom = (id, data, callback) => {

        const checkSql = `
            SELECT articlebomid
            FROM articlebom
            WHERE articleid = ?
            AND categoryid = ?
            AND colorid = ?
            AND sizegroupid = ?
            AND articlebomid != ?
        `;

        db.query(
            checkSql,
            [
                data.articleid,
                data.categoryid,
                data.colorid,
                data.sizegroupid,
                id
            ],
            (err, rows) => {

                if (err) return callback(err);

                if (rows.length > 0) {
                    return callback(
                        new Error(
                            "Article BOM already exists for this Article, Category, Color and Size Group"
                        )
                    );
                }


                const sql = `
                    UPDATE articlebom
                    SET

                        articleid = ?,
                        categoryid = ?,
                        colorid = ?,
                        sizegroupid = ?,

                        upperrexineid = ?,
                        upperrexineavg = ?,

                        insolerexineid = ?,
                        insolerexineavg = ?,

                        epdmid = ?,
                        epdmavg = ?,

                        liningid = ?,
                        liningavg = ?,

                        componentsid = ?,
                        componentsavg = ?,

                        other1id = ?,
                        other1avg = ?,

                        other2id = ?,
                        other2avg = ?,

                        other3id = ?,
                        other3avg = ?,

                        other4id = ?,
                        other4avg = ?,

                        other5id = ?,
                        other5avg = ?

                    WHERE articlebomid = ?
                `;

                db.query(
                    sql,
                    [
                        data.articleid,
                        data.categoryid,
                        data.colorid,
                        data.sizegroupid,

                        data.upperrexineid,
                        data.upperrexineavg,

                        data.insolerexineid,
                        data.insolerexineavg,

                        data.epdmid,
                        data.epdmavg,

                        data.liningid,
                        data.liningavg,

                        data.componentsid,
                        data.componentsavg,

                        data.other1id,
                        data.other1avg,

                        data.other2id,
                        data.other2avg,

                        data.other3id,
                        data.other3avg,

                        data.other4id,
                        data.other4avg,

                        data.other5id,
                        data.other5avg,

                        id
                    ],
                    callback
                );
            }
        );
    };


    // ======================================================
    // DELETE ARTICLE BOM
    // ======================================================

    const deleteArticleBom = (id, callback) => {

        const sql = `
            DELETE FROM articlebom
            WHERE articlebomid = ?
        `;

        db.query(sql, [id], callback);
    };


    // ======================================================
    // EXPORT
    // ======================================================

    module.exports = {
        getAllArticleBom,
        getArticleBomById,
        getArticleBomByArticleId,
        createArticleBom,
        updateArticleBom,
        deleteArticleBom
    };