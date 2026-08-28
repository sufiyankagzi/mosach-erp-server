
const Article = require("../models/articleModel");


// ==========================================
// GET ALL ARTICLES
// ==========================================

exports.getAllArticles = (req, res) => {

    Article.getAllArticles((err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Error fetching articles",
                error: err
            });
        }

        res.json(result);

    });

};


// ==========================================
// GET ARTICLE BY ID
// ==========================================

exports.getArticleById = (req, res) => {

    const articleid = req.params.id;

    Article.getArticleById(articleid, (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Error fetching article",
                error: err
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Article not found"
            });
        }

        res.json(result[0]);

    });

};


// ==========================================
// GET ARTICLE VARIANTS
// ==========================================

exports.getArticleVariants = (req, res) => {

    const articleid = req.params.id;

    Article.getArticleVariants(articleid, (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Error fetching article variants",
                error: err
            });
        }

        res.json(result);

    });

};


// ==========================================
// GET ARTICLE IMAGES
// ==========================================

exports.getArticleImages = (req, res) => {

    const articleid = req.params.id;

    Article.getArticleImages(articleid, (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Error fetching article images",
                error: err
            });
        }

        res.json(result);

    });

};


// ==========================================
// CREATE ARTICLE
// ==========================================

exports.createArticle = (req, res) => {

    const {
        articleno,
        articlename,
        categoryid,
        sizegroupid
    } = req.body;


    // BASIC VALIDATION

    if (
        !articleno ||
        !articlename ||
        !categoryid ||
        !sizegroupid
    ) {

        return res.status(400).json({
            message: "All required fields are required"
        });

    }


    const articleData = {
        articleno,
        articlename,
        categoryid,
        sizegroupid
    };


    Article.createArticle(articleData, (err, result) => {

        if (err) {

            if (err.code === "ER_DUP_ENTRY") {

                return res.status(409).json({
                    message: "Article number already exists"
                });

            }

            return res.status(500).json({
                message: "Error creating article",
                error: err
            });

        }


        res.status(201).json({
            message: "Article created successfully",
            articleid: result.insertId
        });

    });

};


// ==========================================
// UPDATE ARTICLE
// ==========================================

exports.updateArticle = (req, res) => {

    const articleid = req.params.id;

    const {
        articleno,
        articlename,
        categoryid,
        sizegroupid,
        isactive
    } = req.body;


    // BASIC VALIDATION

    if (
        !articleno ||
        !articlename ||
        !categoryid ||
        !sizegroupid
    ) {

        return res.status(400).json({
            message: "All required fields are required"
        });

    }


    const articleData = {
        articleno,
        articlename,
        categoryid,
        sizegroupid,
        isactive
    };


    Article.updateArticle(
        articleid,
        articleData,
        (err, result) => {

            if (err) {

                if (err.code === "ER_DUP_ENTRY") {

                    return res.status(409).json({
                        message: "Article number already exists"
                    });

                }

                return res.status(500).json({
                    message: "Error updating article",
                    error: err
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Article not found"
                });

            }


            res.json({
                message: "Article updated successfully"
            });

        }
    );

};


// ==========================================
// DELETE ARTICLE
// ==========================================

exports.deleteArticle = (req, res) => {

    const articleid = req.params.id;


    Article.deleteArticle(articleid, (err, result) => {

        if (err) {

            return res.status(500).json({
                message: "Error deleting article",
                error: err
            });

        }


        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Article not found"
            });

        }


        res.json({
            message: "Article deleted successfully"
        });

    });

};


// ==========================================
// CREATE ARTICLE VARIANT
// ==========================================

exports.createArticleVariant = (req, res) => {

    const articleid = req.params.id;

    const {
        genderid,
        colorid,
        sizeid
    } = req.body;


    // BASIC VALIDATION

    if (
        !genderid ||
        !colorid ||
        !sizeid
    ) {

        return res.status(400).json({
            message: "Gender, color and size are required"
        });

    }


    const variantData = {

        articleid,
        genderid,
        colorid,
        sizeid

    };


    Article.createArticleVariant(
        variantData,
        (err, result) => {

            if (err) {

                if (err.code === "ER_DUP_ENTRY") {

                    return res.status(409).json({
                        message: "This article variant already exists"
                    });

                }

                return res.status(500).json({
                    message: "Error creating article variant",
                    error: err
                });

            }


            res.status(201).json({

                message: "Article variant created successfully",

                variantid: result.insertId

            });

        }
    );

};


// ==========================================
// UPDATE ARTICLE VARIANT
// ==========================================

exports.updateArticleVariant = (req, res) => {

    const variantid = req.params.id;

    const {
        genderid,
        colorid,
        sizeid,
        isactive
    } = req.body;


    if (
        !genderid ||
        !colorid ||
        !sizeid
    ) {

        return res.status(400).json({
            message: "Gender, color and size are required"
        });

    }


    const variantData = {

        genderid,
        colorid,
        sizeid,
        isactive

    };


    Article.updateArticleVariant(
        variantid,
        variantData,
        (err, result) => {

            if (err) {

                if (err.code === "ER_DUP_ENTRY") {

                    return res.status(409).json({
                        message: "This article variant already exists"
                    });

                }

                return res.status(500).json({
                    message: "Error updating article variant",
                    error: err
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Article variant not found"
                });

            }


            res.json({
                message: "Article variant updated successfully"
            });

        }
    );

};


// ==========================================
// DELETE SINGLE ARTICLE VARIANT
// ==========================================

exports.deleteArticleVariant = (req, res) => {

    const variantid = req.params.id;


    Article.deleteArticleVariant(
        variantid,
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Error deleting article variant",
                    error: err
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Article variant not found"
                });

            }


            res.json({
                message: "Article variant deleted successfully"
            });

        }
    );

};


// ==========================================
// DELETE ALL ARTICLE VARIANTS
// ==========================================

exports.deleteArticleVariants = (req, res) => {

    const articleid = req.params.id;


    Article.deleteArticleVariants(
        articleid,
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Error deleting article variants",
                    error: err
                });

            }


            res.json({
                message: "All article variants deleted successfully",
                deletedRows: result.affectedRows
            });

        }
    );

};


// ==========================================
// CREATE ARTICLE IMAGE
// ==========================================

exports.createArticleImage = (req, res) => {

    const articleid = req.params.id;

    const {
        imageurl,
        isprimary,
        sortorder
    } = req.body;


    if (!imageurl) {

        return res.status(400).json({
            message: "Image URL is required"
        });

    }


    const imageData = {

        articleid,
        imageurl,
        isprimary: isprimary ?? false,
        sortorder: sortorder ?? 0

    };


    Article.createArticleImage(
        imageData,
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Error creating article image",
                    error: err
                });

            }


            res.status(201).json({

                message: "Article image created successfully",

                imageid: result.insertId

            });

        }
    );

};


// ==========================================
// UPDATE ARTICLE IMAGE
// ==========================================

exports.updateArticleImage = (req, res) => {

    const imageid = req.params.id;

    const {
        imageurl,
        isprimary,
        sortorder
    } = req.body;


    if (!imageurl) {

        return res.status(400).json({
            message: "Image URL is required"
        });

    }


    const imageData = {

        imageurl,
        isprimary: isprimary ?? false,
        sortorder: sortorder ?? 0

    };


    Article.updateArticleImage(
        imageid,
        imageData,
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Error updating article image",
                    error: err
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Article image not found"
                });

            }


            res.json({
                message: "Article image updated successfully"
            });

        }
    );

};


// ==========================================
// DELETE ARTICLE IMAGE
// ==========================================

exports.deleteArticleImage = (req, res) => {

    const imageid = req.params.id;


    Article.deleteArticleImage(
        imageid,
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Error deleting article image",
                    error: err
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Article image not found"
                });

            }


            res.json({
                message: "Article image deleted successfully"
            });

        }
    );

};


// ==========================================
// DELETE ALL ARTICLE IMAGES
// ==========================================

exports.deleteArticleImages = (req, res) => {

    const articleid = req.params.id;


    Article.deleteArticleImages(
        articleid,
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Error deleting article images",
                    error: err
                });

            }


            res.json({
                message: "All article images deleted successfully",
                deletedRows: result.affectedRows
            });

        }
    );

};
