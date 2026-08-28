const db = require("../config/connectdb");


// ==========================================
// GET ALL ARTICLES
// ==========================================

exports.getAllArticles = (callback) => {

    const sql = `
        SELECT
            a.articleid,
            a.articleno,
            a.articlename,
            a.categoryid,
            c.category,
            a.sizegroupid,
            sg.sizegroup,
            a.isactive,
            a.created_at,

            (
                SELECT ai.imageurl
                FROM articleimages ai
                WHERE ai.articleid = a.articleid
                ORDER BY ai.isprimary DESC, ai.sortorder ASC
                LIMIT 1
            ) AS imageurl

        FROM articlemaster a

        LEFT JOIN category c
            ON a.categoryid = c.categoryid

        LEFT JOIN sizegroup sg
            ON a.sizegroupid = sg.sizegroupid

        ORDER BY a.articleid DESC
    `;

    db.query(sql, callback);
};


// ==========================================
// GET ARTICLE BY ID
// ==========================================

exports.getArticleById = (articleid, callback) => {

    const sql = `
        SELECT
            a.articleid,
            a.articleno,
            a.articlename,
            a.categoryid,
            c.category,
            a.sizegroupid,
            sg.sizegroup,
            a.isactive,
            a.created_at

        FROM articlemaster a

        LEFT JOIN category c
            ON a.categoryid = c.categoryid

        LEFT JOIN sizegroup sg
            ON a.sizegroupid = sg.sizegroupid

        WHERE a.articleid = ?
    `;

    db.query(sql, [articleid], callback);
};


// ==========================================
// GET ARTICLE VARIANTS
// ==========================================

exports.getArticleVariants = (articleid, callback) => {

    const sql = `
        SELECT
            av.variantid,
            av.articleid,

            av.genderid,
            g.gender,

            av.colorid,
            c.color,

            av.sizeid,
            s.size,

            s.sizegroupid,
            sg.sizegroup,

            av.isactive,
            av.created_at

        FROM articlevariant av

        LEFT JOIN gender g
            ON av.genderid = g.genderid

        LEFT JOIN color c
            ON av.colorid = c.colorid

        LEFT JOIN size s
            ON av.sizeid = s.sizeid

        LEFT JOIN sizegroup sg
            ON s.sizegroupid = sg.sizegroupid

        WHERE av.articleid = ?

        ORDER BY av.variantid ASC
    `;

    db.query(sql, [articleid], callback);
};

// ==========================================
// GET ARTICLE IMAGES
// ==========================================

exports.getArticleImages = (articleid, callback) => {

    const sql = `
        SELECT
            imageid,
            articleid,
            imageurl,
            isprimary,
            sortorder,
            created_at

        FROM articleimages

        WHERE articleid = ?

        ORDER BY isprimary DESC, sortorder ASC
    `;

    db.query(sql, [articleid], callback);
};


// ==========================================
// CREATE ARTICLE
// ==========================================

exports.createArticle = (articleData, callback) => {

    const {
        articleno,
        articlename,
        categoryid,
        sizegroupid
    } = articleData;

    const sql = `
        INSERT INTO articlemaster
        (
            articleno,
            articlename,
            categoryid,
            sizegroupid
        )
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            articleno,
            articlename,
            categoryid,
            sizegroupid
        ],
        callback
    );
};


// ==========================================
// UPDATE ARTICLE
// ==========================================

exports.updateArticle = (articleid, articleData, callback) => {

    const {
        articleno,
        articlename,
        categoryid,
        sizegroupid,
        isactive
    } = articleData;

    const sql = `
        UPDATE articlemaster
        SET
            articleno = ?,
            articlename = ?,
            categoryid = ?,
            sizegroupid = ?,
            isactive = ?
        WHERE articleid = ?
    `;

    db.query(
        sql,
        [
            articleno,
            articlename,
            categoryid,
            sizegroupid,
            isactive,
            articleid
        ],
        callback
    );
};


// ==========================================
// DELETE ARTICLE
// ==========================================

exports.deleteArticle = (articleid, callback) => {

    const sql = `
        DELETE FROM articlemaster
        WHERE articleid = ?
    `;

    db.query(sql, [articleid], callback);
};


// ==========================================
// ADD ARTICLE VARIANT
// ==========================================

exports.createArticleVariant = (variantData, callback) => {

    const {
        articleid,
        genderid,
        colorid,
        sizeid
    } = variantData;

    const sql = `
        INSERT INTO articlevariant
        (
            articleid,
            genderid,
            colorid,
            sizeid
        )
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            articleid,
            genderid,
            colorid,
            sizeid
        ],
        callback
    );
};

// ==========================================
// UPDATE ARTICLE VARIANT
// ==========================================

exports.updateArticleVariant = (variantid, variantData, callback) => {

    const {
        genderid,
        colorid,
        sizeid,
        isactive
    } = variantData;

    const sql = `
        UPDATE articlevariant
        SET
            genderid = ?,
            colorid = ?,
            sizeid = ?,
            isactive = ?
        WHERE variantid = ?
    `;

    db.query(
        sql,
        [
            genderid,
            colorid,
            sizeid,
            isactive,
            variantid
        ],
        callback
    );
};

// ==========================================
// DELETE SINGLE ARTICLE VARIANT
// ==========================================

exports.deleteArticleVariant = (variantid, callback) => {

    const sql = `
        DELETE FROM articlevariant
        WHERE variantid = ?
    `;

    db.query(sql, [variantid], callback);
};

// ==========================================
// DELETE ALL ARTICLE VARIANTS
// ==========================================

exports.deleteArticleVariants = (articleid, callback) => {

    const sql = `
        DELETE FROM articlevariant
        WHERE articleid = ?
    `;

    db.query(sql, [articleid], callback);
};


// ==========================================
// ADD ARTICLE IMAGE
// ==========================================

exports.createArticleImage = (imageData, callback) => {

    const {
        articleid,
        imageurl,
        isprimary,
        sortorder
    } = imageData;

    const sql = `
        INSERT INTO articleimages
        (
            articleid,
            imageurl,
            isprimary,
            sortorder
        )
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            articleid,
            imageurl,
            isprimary,
            sortorder
        ],
        callback
    );
};

// ==========================================
// UPDATE ARTICLE IMAGE
// ==========================================

exports.updateArticleImage = (imageid, imageData, callback) => {

    const {
        imageurl,
        isprimary,
        sortorder
    } = imageData;

    const sql = `
        UPDATE articleimages
        SET
            imageurl = ?,
            isprimary = ?,
            sortorder = ?
        WHERE imageid = ?
    `;

    db.query(
        sql,
        [
            imageurl,
            isprimary,
            sortorder,
            imageid
        ],
        callback
    );
};

// ==========================================
// DELETE ARTICLE IMAGE
// ==========================================

exports.deleteArticleImage = (imageid, callback) => {

    const sql = `
        DELETE FROM articleimages
        WHERE imageid = ?
    `;

    db.query(sql, [imageid], callback);
};


// ==========================================
// DELETE ALL ARTICLE IMAGES
// ==========================================

exports.deleteArticleImages = (articleid, callback) => {

    const sql = `
        DELETE FROM articleimages
        WHERE articleid = ?
    `;

    db.query(sql, [articleid], callback);
};