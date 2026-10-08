
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

            console.error(
                "GET ALL ARTICLES ERROR:",
                err
            );

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

    const articleid = Number(req.params.id);

    if (!articleid) {

        return res.status(400).json({
            message: "Invalid article ID"
        });
    }

    Article.getArticleById(
        articleid,
        (err, result) => {

            if (err) {

                console.error(
                    "GET ARTICLE ERROR:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Error fetching article",
                    error:
                        err.message
                });
            }

            if (
                !result ||
                result.length === 0
            ) {

                return res.status(404).json({
                    message:
                        "Article not found"
                });
            }

            res.json(result[0]);
        }
    );
};


// ======================================================
// GET ARTICLE SIZE GROUPS
// ======================================================

exports.getArticleSizeGroups = (
    req,
    res
) => {

    const articleid =
        Number(req.params.id);

    if (!articleid) {

        return res.status(400).json({
            message:
                "Invalid article ID"
        });
    }

    Article.getArticleSizeGroups(
        articleid,
        (err, result) => {

            if (err) {

                console.error(
                    "GET ARTICLE SIZE GROUPS ERROR:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Error fetching article size groups",
                    error:
                        err.message
                });
            }

            res.json(result);
        }
    );
};


// ======================================================
// GET ARTICLE VARIANTS
// ======================================================

exports.getArticleVariants = (
    req,
    res
) => {

    const articleid =
        Number(req.params.id);

    if (!articleid) {

        return res.status(400).json({
            message:
                "Invalid article ID"
        });
    }

    Article.getArticleVariants(
        articleid,
        (err, result) => {

            if (err) {

                console.error(
                    "GET ARTICLE VARIANTS ERROR:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Error fetching article variants",
                    error:
                        err.message
                });
            }

            res.json(result);
        }
    );
};


// ======================================================
// GET ARTICLE IMAGES
// ======================================================

exports.getArticleImages = (
    req,
    res
) => {

    const articleid =
        Number(req.params.id);

    if (!articleid) {

        return res.status(400).json({
            message:
                "Invalid article ID"
        });
    }

    Article.getArticleImages(
        articleid,
        (err, result) => {

            if (err) {

                console.error(
                    "GET ARTICLE IMAGES ERROR:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Error fetching article images",
                    error:
                        err.message
                });
            }

            res.json(result);
        }
    );
};


// ======================================================
// CREATE ARTICLE
// ======================================================

exports.createArticle = (
    req,
    res
) => {

    const {
        articleno,
        articlename,
        categoryid,
        sizegroupids
    } = req.body;


    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (
        !articleno ||
        !articlename ||
        !categoryid
    ) {

        return res.status(400).json({
            message:
                "Article No, Article Name and Category are required"
        });
    }


    if (
        !Array.isArray(sizegroupids) ||
        sizegroupids.length === 0
    ) {

        return res.status(400).json({
            message:
                "At least one Size Group is required"
        });
    }


    // ------------------------------------------
    // CLEAN SIZE GROUP IDS
    // ------------------------------------------

    const cleanSizeGroupIds = [
        ...new Set(
            sizegroupids
                .map(id => Number(id))
                .filter(id => id > 0)
        )
    ];


    if (
        cleanSizeGroupIds.length === 0
    ) {

        return res.status(400).json({
            message:
                "Invalid Size Group selection"
        });
    }


    const articleData = {

        articleno:
            String(articleno).trim(),

        articlename:
            String(articlename).trim(),

        categoryid:
            Number(categoryid)
    };


    // ------------------------------------------
    // CREATE ARTICLE
    // ------------------------------------------

    Article.createArticle(
        articleData,
        async (err, result) => {

            if (err) {

                console.error(
                    "CREATE ARTICLE ERROR:",
                    err
                );


                if (
                    err.code ===
                    "ER_DUP_ENTRY"
                ) {

                    return res.status(409).json({
                        message:
                            "Article number already exists"
                    });
                }


                return res.status(500).json({
                    message:
                        "Error creating article",
                    error:
                        err.message
                });
            }


            const articleid =
                result.insertId;


            try {

                // ------------------------------------------
                // SAVE SIZE GROUPS
                // ------------------------------------------

                for (
                    const sizegroupid
                    of cleanSizeGroupIds
                ) {

                    await new Promise(
                        (
                            resolve,
                            reject
                        ) => {

                            Article.createArticleSizeGroup(
                                {
                                    articleid,
                                    sizegroupid
                                },
                                (
                                    err
                                ) => {

                                    if (err) {

                                        reject(err);

                                    } else {

                                        resolve();

                                    }
                                }
                            );

                        }
                    );
                }


                return res.status(201).json({

                    message:
                        "Article created successfully",

                    articleid,

                    sizegroupids:
                        cleanSizeGroupIds
                });


            } catch (error) {

                console.error(
                    "CREATE ARTICLE SIZE GROUP ERROR:",
                    error
                );


                return res.status(500).json({

                    message:
                        "Article created but Size Groups could not be saved",

                    articleid,

                    error:
                        error.message
                });
            }
        }
    );
};


// ======================================================
// UPDATE ARTICLE
// ======================================================

exports.updateArticle = (
    req,
    res
) => {

    const articleid =
        Number(req.params.id);


    if (!articleid) {

        return res.status(400).json({
            message:
                "Invalid article ID"
        });
    }


    const {
        articleno,
        articlename,
        categoryid,
        sizegroupids,
        isactive
    } = req.body;


    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (
        !articleno ||
        !articlename ||
        !categoryid
    ) {

        return res.status(400).json({
            message:
                "Article No, Article Name and Category are required"
        });
    }


    if (
        !Array.isArray(sizegroupids) ||
        sizegroupids.length === 0
    ) {

        return res.status(400).json({
            message:
                "At least one Size Group is required"
        });
    }


    const cleanSizeGroupIds = [
        ...new Set(
            sizegroupids
                .map(id => Number(id))
                .filter(id => id > 0)
        )
    ];


    if (
        cleanSizeGroupIds.length === 0
    ) {

        return res.status(400).json({
            message:
                "Invalid Size Group selection"
        });
    }


    const articleData = {

        articleno:
            String(articleno).trim(),

        articlename:
            String(articlename).trim(),

        categoryid:
            Number(categoryid),

        isactive:
            isactive !== undefined
                ? Number(isactive)
                : 1
    };


    // ------------------------------------------
    // UPDATE ARTICLE
    // ------------------------------------------

    Article.updateArticle(
        articleid,
        articleData,
        async (err, result) => {

            if (err) {

                console.error(
                    "UPDATE ARTICLE ERROR:",
                    err
                );


                if (
                    err.code ===
                    "ER_DUP_ENTRY"
                ) {

                    return res.status(409).json({
                        message:
                            "Article number already exists"
                    });
                }


                return res.status(500).json({
                    message:
                        "Error updating article",
                    error:
                        err.message
                });
            }


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({
                    message:
                        "Article not found"
                });
            }


            try {

                // ------------------------------------------
                // DELETE OLD SIZE GROUP MAPPINGS
                // ------------------------------------------

                await new Promise(
                    (
                        resolve,
                        reject
                    ) => {

                        Article.deleteArticleSizeGroups(
                            articleid,
                            (err) => {

                                if (err) {

                                    reject(err);

                                } else {

                                    resolve();

                                }
                            }
                        );

                    }
                );


                // ------------------------------------------
                // ADD NEW SIZE GROUP MAPPINGS
                // ------------------------------------------

                for (
                    const sizegroupid
                    of cleanSizeGroupIds
                ) {

                    await new Promise(
                        (
                            resolve,
                            reject
                        ) => {

                            Article.createArticleSizeGroup(
                                {
                                    articleid,
                                    sizegroupid
                                },
                                (
                                    err
                                ) => {

                                    if (err) {

                                        reject(err);

                                    } else {

                                        resolve();

                                    }
                                }
                            );

                        }
                    );
                }


                return res.json({

                    message:
                        "Article updated successfully",

                    articleid,

                    sizegroupids:
                        cleanSizeGroupIds
                });


            } catch (error) {

                console.error(
                    "UPDATE ARTICLE SIZE GROUP ERROR:",
                    error
                );


                return res.status(500).json({

                    message:
                        "Article updated but Size Groups could not be updated",

                    error:
                        error.message
                });
            }
        }
    );
};


// ======================================================
// DELETE ARTICLE
// ======================================================

exports.deleteArticle = (
    req,
    res
) => {

    const articleid =
        Number(req.params.id);


    if (!articleid) {

        return res.status(400).json({
            message:
                "Invalid article ID"
        });
    }


    Article.deleteArticle(
        articleid,
        (err, result) => {

            if (err) {

                console.error(
                    "DELETE ARTICLE ERROR:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Error deleting article",
                    error:
                        err.message
                });
            }


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({
                    message:
                        "Article not found"
                });
            }


            res.json({

                message:
                    "Article deleted successfully"
            });
        }
    );
};


// ======================================================
// CREATE ARTICLE VARIANT
// ======================================================

exports.createArticleVariant = (
    req,
    res
) => {

    const articleid =
        Number(req.params.id);


    const {
        genderid,
        colorid,
        sizegroupid,
        sizeid
    } = req.body;


    if (!articleid) {

        return res.status(400).json({
            message:
                "Invalid article ID"
        });
    }


    if (
        !genderid ||
        !colorid ||
        !sizegroupid ||
        !sizeid
    ) {

        return res.status(400).json({
            message:
                "Gender, color, size group and size are required"
        });
    }


    const variantData = {

        articleid,

        genderid:
            Number(genderid),

        colorid:
            Number(colorid),

        sizegroupid:
            Number(sizegroupid),

        sizeid:
            Number(sizeid)
    };


    Article.createArticleVariant(
        variantData,
        (err, result) => {

            if (err) {

                console.error(
                    "CREATE ARTICLE VARIANT ERROR:",
                    err
                );


                if (
                    err.code ===
                    "ER_DUP_ENTRY"
                ) {

                    return res.status(409).json({
                        message:
                            "This article variant already exists"
                    });
                }


                return res.status(500).json({
                    message:
                        "Error creating article variant",
                    error:
                        err.message
                });
            }


            res.status(201).json({

                message:
                    "Article variant created successfully",

                variantid:
                    result.insertId
            });
        }
    );
};


// ======================================================
// UPDATE ARTICLE VARIANT
// ======================================================

exports.updateArticleVariant = (
    req,
    res
) => {

    const variantid =
        Number(req.params.id);


    if (!variantid) {

        return res.status(400).json({
            message:
                "Invalid variant ID"
        });
    }


    const {
        genderid,
        colorid,
        sizegroupid,
        sizeid,
        isactive
    } = req.body;


    if (
        !genderid ||
        !colorid ||
        !sizegroupid ||
        !sizeid
    ) {

        return res.status(400).json({
            message:
                "Gender, color, size group and size are required"
        });
    }


    const variantData = {

        genderid:
            Number(genderid),

        colorid:
            Number(colorid),

        sizegroupid:
            Number(sizegroupid),

        sizeid:
            Number(sizeid),

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


                if (
                    err.code ===
                    "ER_DUP_ENTRY"
                ) {

                    return res.status(409).json({
                        message:
                            "This article variant already exists"
                    });
                }


                return res.status(500).json({
                    message:
                        "Error updating article variant",
                    error:
                        err.message
                });
            }


            if (
                result.affectedRows === 0
            ) {

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

exports.deleteArticleVariant = (
    req,
    res
) => {

    const variantid =
        Number(req.params.id);


    if (!variantid) {

        return res.status(400).json({
            message:
                "Invalid variant ID"
        });
    }


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
                    error:
                        err.message
                });
            }


            if (
                result.affectedRows === 0
            ) {

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

exports.deleteArticleVariants = (
    req,
    res
) => {

    const articleid =
        Number(req.params.id);


    if (!articleid) {

        return res.status(400).json({
            message:
                "Invalid article ID"
        });
    }


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
                    error:
                        err.message
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

exports.createArticleImage = (
    req,
    res
) => {

    const articleid =
        Number(req.params.id);


    if (!articleid) {

        return res.status(400).json({
            message:
                "Invalid article ID"
        });
    }


    const {
        imageurl,
        isprimary,
        sortorder
    } = req.body;


    if (!imageurl) {

        return res.status(400).json({
            message:
                "Image URL is required"
        });
    }


    const imageData = {

        articleid,

        imageurl:
            String(imageurl).trim(),

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
                    error:
                        err.message
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

exports.updateArticleImage = (
    req,
    res
) => {

    const imageid =
        Number(req.params.id);


    if (!imageid) {

        return res.status(400).json({
            message:
                "Invalid image ID"
        });
    }


    const {
        imageurl,
        isprimary,
        sortorder
    } = req.body;


    if (!imageurl) {

        return res.status(400).json({
            message:
                "Image URL is required"
        });
    }


    const imageData = {

        imageurl:
            String(imageurl).trim(),

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
                    error:
                        err.message
                });
            }


            if (
                result.affectedRows === 0
            ) {

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

exports.deleteArticleImage = (
    req,
    res
) => {

    const imageid =
        Number(req.params.id);


    if (!imageid) {

        return res.status(400).json({
            message:
                "Invalid image ID"
        });
    }


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
                    error:
                        err.message
                });
            }


            if (
                result.affectedRows === 0
            ) {

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

exports.deleteArticleImages = (
    req,
    res
) => {

    const articleid =
        Number(req.params.id);


    if (!articleid) {

        return res.status(400).json({
            message:
                "Invalid article ID"
        });
    }


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
                    error:
                        err.message
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
// ARTICLE IMAGE UPLOAD
// ======================================================

const uploadDir = path.join(
    __dirname,
    "../uploads/articles"
);


// Create upload directory
if (
    !fs.existsSync(uploadDir)
) {

    fs.mkdirSync(
        uploadDir,
        {
            recursive: true
        }
    );
}


// ======================================================
// MULTER STORAGE
// ======================================================

const storage =
    multer.diskStorage({

        destination: (
            req,
            file,
            cb
        ) => {

            cb(
                null,
                uploadDir
            );
        },


        filename: (
            req,
            file,
            cb
        ) => {

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
// MULTER FILE FILTER
// ======================================================

const fileFilter = (
    req,
    file,
    cb
) => {

    const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif"
    ];


    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif"
    ];


    const ext =
        path.extname(
            file.originalname
        ).toLowerCase();


    if (
        allowedExtensions.includes(
            ext
        ) &&
        allowedMimeTypes.includes(
            file.mimetype
        )
    ) {

        cb(
            null,
            true
        );

    } else {

        cb(
            new Error(
                "Only JPG, JPEG, PNG, WEBP and GIF images are allowed"
            )
        );
    }
};


// ======================================================
// MULTER
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

