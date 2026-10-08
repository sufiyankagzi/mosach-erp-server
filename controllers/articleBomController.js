const ArticleBom = require("../models/articleBomModel");


// ======================================================
// GET ALL ARTICLE BOM
// ======================================================

exports.getAllArticleBom = (req, res) => {

    ArticleBom.getAllArticleBom((err, result) => {

        if (err) {

            console.error(
                "GET ALL ARTICLE BOM ERROR:",
                err
            );

            return res.status(500).json({
                message: err.message
            });
        }

        res.status(200).json(result);
    });
};


// ======================================================
// GET SINGLE ARTICLE BOM
// ======================================================

exports.getArticleBomById = (req, res) => {

    ArticleBom.getArticleBomById(
        req.params.id,
        (err, result) => {

            if (err) {

                console.error(
                    "GET ARTICLE BOM ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message
                });
            }

            if (result.length === 0) {

                return res.status(404).json({
                    message: "Article BOM not found"
                });
            }

            res.status(200).json(result[0]);
        }
    );
};


// ======================================================
// GET BOM BY ARTICLE ID
// ======================================================

exports.getArticleBomByArticleId = (req, res) => {

    ArticleBom.getArticleBomByArticleId(
        req.params.articleid,
        (err, result) => {

            if (err) {

                console.error(
                    "GET ARTICLE BOM BY ARTICLE ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message
                });
            }

            res.status(200).json(result);
        }
    );
};


// ======================================================
// CREATE ARTICLE BOM
// ======================================================

exports.addArticleBom = (req, res) => {

    console.log(
        "CREATE ARTICLE BOM DATA:",
        req.body
    );

    const data = {
        ...req.body
    };

    ArticleBom.createArticleBom(
        data,
        (err, result) => {

            if (err) {

                if (
                    err.message ===
                    "Article BOM already exists for this Article, Category, Color and Size Group"
                ) {

                    return res.status(400).json({
                        message: err.message
                    });
                }

                console.error(
                    "CREATE ARTICLE BOM ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            res.status(201).json({
                message: "Article BOM created successfully",
                id: result.insertId
            });
        }
    );
};


// ======================================================
// UPDATE ARTICLE BOM
// ======================================================

exports.editArticleBom = (req, res) => {

    const data = {
        ...req.body
    };

    console.log(
        "UPDATE ARTICLE BOM DATA:",
        data
    );

    ArticleBom.updateArticleBom(
        req.params.id,
        data,
        (err, result) => {

            if (err) {

                if (
                    err.message ===
                    "Article BOM already exists for this Article, Category, Color and Size Group"
                ) {

                    return res.status(400).json({
                        message: err.message
                    });
                }

                console.error(
                    "UPDATE ARTICLE BOM ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Article BOM not found"
                });
            }

            res.status(200).json({
                message: "Article BOM updated successfully"
            });
        }
    );
};


// ======================================================
// DELETE ARTICLE BOM
// ======================================================

exports.deleteArticleBom = (req, res) => {

    ArticleBom.deleteArticleBom(
        req.params.id,
        (err, result) => {

            if (err) {

                console.error(
                    "DELETE ARTICLE BOM ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Article BOM not found"
                });
            }

            res.status(200).json({
                message: "Article BOM deleted successfully"
            });
        }
    );
};