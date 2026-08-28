const Article = require("../models/articleModel");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// ======================================================
// GET ALL ARTICLES
// ======================================================

exports.getAllArticles = (req, res) => {
    Article.getAllArticles((err, result) => {
        if (err) {
            console.error("GET ALL ARTICLES ERROR:", err);

            return res.status(500).json({
                message: "Error fetching articles",
                error: err.message
            });
        }

        res.json(result);
    });
};


// ======================================================
// GET ARTICLE BY ID
// ======================================================

exports.getArticleById = (req, res) => {

    const articleid = req.params.id;

    Article.getArticleById(articleid, (err, result) => {

        if (err) {
            console.error("GET ARTICLE ERROR:", err);

            return res.status(500).json({
                message: "Error fetching article",
                error: err.message
            });
        }

        if (!result || result.length === 0) {
            return res.status(404).json({
                message: "Article not found"
            });
        }

        res.json(result[0]);
    });
};


// ======================================================
// GET ARTICLE VARIANTS
// ======================================================

exports.getArticleVariants = (req, res) => {

    const articleid = req.params.id;

    Article.getArticleVariants(articleid, (err, result) => {

        if (err) {
            console.error("GET ARTICLE VARIANTS ERROR:", err);

            return res.status(500).json({
                message: "Error fetching article variants",
                error: err.message
            });
        }

        res.json(result);
    });
};


// ======================================================
// GET ARTICLE IMAGES
// ======================================================

exports.getArticleImages = (req, res) => {

    const articleid = req.params.id;

    Article.getArticleImages(articleid, (err, result) => {

        if (err) {
            console.error("GET ARTICLE IMAGES ERROR:", err);

            return res.status(500).json({
                message: "Error fetching article images",
                error: err.message
            });
        }

        res.json(result);
    });
};


// ======================================================
// CREATE ARTICLE
// ======================================================

exports.createArticle = (req, res) => {

    const {
        articleno,
        articlename,
        categoryid,
        sizegroupid
    } = req.body;

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
        articleno: articleno.trim(),
        articlename: articlename.trim(),
        categoryid: Number(categoryid),
        sizegroupid: Number(sizegroupid)
    };

    Article.createArticle(articleData, (err, result) => {

        if (err) {

            console.error("CREATE ARTICLE ERROR:", err);

            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Article number already exists"
                });
            }

            return res.status(500).json({
                message: "Error creating article",
                error: err.message
            });
        }

        res.status(201).json({
            message: "Article created successfully",
            articleid: result.insertId
        });
    });
};


// ======================================================
// UPDATE ARTICLE
// ======================================================

exports.updateArticle = (req, res) => {

    const articleid = req.params.id;

    const {
        articleno,
        articlename,
        categoryid,
        sizegroupid,
        isactive
    } = req.body;

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
        articleno: articleno.trim(),
        articlename: articlename.trim(),
        categoryid: Number(categoryid),
        sizegroupid: Number(sizegroupid),
        isactive:
            isactive !== undefined
                ? Number(isactive)
                : 1
    };

    Article.updateArticle(
        articleid,
        articleData,
        (err, result) => {

            if (err) {

                console.error("UPDATE ARTICLE ERROR:", err);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Article number already exists"
                    });
                }

                return res.status(500).json({
                    message: "Error updating article",
                    error: err.message
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


// ======================================================
// DELETE ARTICLE
// ======================================================

exports.deleteArticle = (req, res) => {

    const articleid = req.params.id;

    Article.deleteArticle(articleid, (err, result) => {

        if (err) {
            console.error("DELETE ARTICLE ERROR:", err);

            return res.status(500).json({
                message: "Error deleting article",
                error: err.message
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


// ======================================================
// CREATE ARTICLE VARIANT
// ======================================================

exports.createArticleVariant = (req, res) => {

    const articleid = req.params.id;

    const {
        genderid,
        colorid,
        sizeid
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
        articleid: Number(articleid),
        genderid: Number(genderid),
        colorid: Number(colorid),
        sizeid: Number(sizeid)
    };

    Article.createArticleVariant(
        variantData,
        (err, result) => {

            if (err) {

                console.error(
                    "CREATE ARTICLE VARIANT ERROR:",
                    err
                );

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message:
                            "This article variant already exists"
                    });
                }

                return res.status(500).json({
                    message:
                        "Error creating article variant",
                    error: err.message
                });
            }

            res.status(201).json({
                message:
                    "Article variant created successfully",
                variantid: result.insertId
            });
        }
    );
};


// ======================================================
// UPDATE ARTICLE VARIANT
// ======================================================

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
        genderid: Number(genderid),
        colorid: Number(colorid),
        sizeid: Number(sizeid),
        isactive:
            isactive !== undefined
                ? Number(isactive)
                : 1
    };

    Article.updateArticleVariant(
        variantid,
        variantData,
        (err, result) => {

            if (err) {

                console.error(
                    "UPDATE ARTICLE VARIANT ERROR:",
                    err
                );

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message:
                            "This article variant already exists"
                    });
                }

                return res.status(500).json({
                    message:
                        "Error updating article variant",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message:
                        "Article variant not found"
                });
            }

            res.json({
                message:
                    "Article variant updated successfully"
            });
        }
    );
};


// ======================================================
// DELETE SINGLE ARTICLE VARIANT
// ======================================================

exports.deleteArticleVariant = (req, res) => {

    const variantid = req.params.id;

    Article.deleteArticleVariant(
        variantid,
        (err, result) => {

            if (err) {

                console.error(
                    "DELETE ARTICLE VARIANT ERROR:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Error deleting article variant",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message:
                        "Article variant not found"
                });
            }

            res.json({
                message:
                    "Article variant deleted successfully"
            });
        }
    );
};


// ======================================================
// DELETE ALL ARTICLE VARIANTS
// ======================================================

exports.deleteArticleVariants = (req, res) => {

    const articleid = req.params.id;

    Article.deleteArticleVariants(
        articleid,
        (err, result) => {

            if (err) {

                console.error(
                    "DELETE ALL ARTICLE VARIANTS ERROR:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Error deleting article variants",
                    error: err.message
                });
            }

            res.json({
                message:
                    "All article variants deleted successfully",
                deletedRows:
                    result.affectedRows
            });
        }
    );
};


// ======================================================
// CREATE ARTICLE IMAGE
// ======================================================

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
        articleid: Number(articleid),
        imageurl,
        isprimary:
            isprimary !== undefined
                ? Number(isprimary)
                : 0,
        sortorder:
            sortorder !== undefined
                ? Number(sortorder)
                : 0
    };

    Article.createArticleImage(
        imageData,
        (err, result) => {

            if (err) {

                console.error(
                    "CREATE ARTICLE IMAGE ERROR:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Error creating article image",
                    error: err.message
                });
            }

            res.status(201).json({
                message:
                    "Article image created successfully",
                imageid:
                    result.insertId
            });
        }
    );
};


// ======================================================
// UPDATE ARTICLE IMAGE
// ======================================================

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
        isprimary:
            isprimary !== undefined
                ? Number(isprimary)
                : 0,
        sortorder:
            sortorder !== undefined
                ? Number(sortorder)
                : 0
    };

    Article.updateArticleImage(
        imageid,
        imageData,
        (err, result) => {

            if (err) {

                console.error(
                    "UPDATE ARTICLE IMAGE ERROR:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Error updating article image",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message:
                        "Article image not found"
                });
            }

            res.json({
                message:
                    "Article image updated successfully"
            });
        }
    );
};


// ======================================================
// DELETE SINGLE ARTICLE IMAGE
// ======================================================

exports.deleteArticleImage = (req, res) => {

    const imageid = req.params.id;

    Article.deleteArticleImage(
        imageid,
        (err, result) => {

            if (err) {

                console.error(
                    "DELETE ARTICLE IMAGE ERROR:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Error deleting article image",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message:
                        "Article image not found"
                });
            }

            res.json({
                message:
                    "Article image deleted successfully"
            });
        }
    );
};


// ======================================================
// DELETE ALL ARTICLE IMAGES
// ======================================================

exports.deleteArticleImages = (req, res) => {

    const articleid = req.params.id;

    Article.deleteArticleImages(
        articleid,
        (err, result) => {

            if (err) {

                console.error(
                    "DELETE ALL ARTICLE IMAGES ERROR:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Error deleting article images",
                    error: err.message
                });
            }

            res.json({
                message:
                    "All article images deleted successfully",
                deletedRows:
                    result.affectedRows
            });
        }
    );
};


// ======================================================
// ARTICLE IMAGE UPLOAD - MULTER
// ======================================================

// Upload folder
const uploadDir = path.join(
    __dirname,
    "../uploads/articles"
);


// Create folder if not exists
if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(uploadDir, {
        recursive: true
    });

}


// ======================================================
// MULTER STORAGE
// ======================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadDir);

    },

    filename: (req, file, cb) => {

        const ext =
            path.extname(
                file.originalname
            ).toLowerCase();

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(
                Math.random() * 1E9
            ) +
            ext;

        cb(
            null,
            uniqueName
        );
    }

});


// ======================================================
// MULTER FILTER
// ======================================================

const fileFilter = (
    req,
    file,
    cb
) => {

    const allowedExtensions =
        [
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".gif"
        ];

    const ext =
        path
            .extname(
                file.originalname
            )
            .toLowerCase();

    const allowedMimeTypes =
        [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

    if (
        allowedExtensions.includes(ext) &&
        allowedMimeTypes.includes(
            file.mimetype
        )
    ) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only JPG, JPEG, PNG, WEBP and GIF images are allowed"
            )
        );

    }

};


// ======================================================
// MULTER INSTANCE
// ======================================================

const upload = multer({

    storage,

    limits: {

        fileSize:
            5 * 1024 * 1024

    },

    fileFilter

});


// ======================================================
// EXPORT MULTER
// ======================================================

exports.upload = upload;


// ======================================================
// UPLOAD ARTICLE IMAGE
// ======================================================

exports.uploadArticleImage = (
    req,
    res
) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                message:
                    "Image is required"
            });

        }


        const imageurl =
            `/uploads/articles/${req.file.filename}`;


        console.log(
            "ARTICLE IMAGE UPLOADED:",
            imageurl
        );


        res.status(200).json({

            message:
                "Image uploaded successfully",

            imageurl

        });

    } catch (error) {

        console.error(
            "UPLOAD ARTICLE IMAGE ERROR:",
            error
        );

        return res.status(500).json({

            message:
                error.message ||
                "Image upload failed"

        });

    }

};