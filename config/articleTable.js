
const db = require("../config/connectdb");


// ======================================================
// CREATE ARTICLE MASTER TABLE
// ======================================================

const createArticleMasterTable = () => {

    const sql = `
        CREATE TABLE IF NOT EXISTS articlemaster (

            articleid INT AUTO_INCREMENT PRIMARY KEY,

            articleno VARCHAR(50) NOT NULL UNIQUE,

            articlename VARCHAR(150) NOT NULL,

            categoryid INT NOT NULL,

            isactive BOOLEAN DEFAULT TRUE,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT fk_article_category
                FOREIGN KEY (categoryid)
                REFERENCES category(categoryid)
                ON UPDATE CASCADE
                ON DELETE RESTRICT

        )
    `;

    db.query(sql, (err) => {

        if (err) {
            console.log("Article Master Table Error:", err);
        } else {
            console.log("Article Master table ready.");
        }

    });

};


// ======================================================
// CREATE ARTICLE SIZE GROUP TABLE
// ======================================================
// One Article can have multiple Size Groups
//
// Example:
//
// Article A101
//      ├── Size Group 1-5
//      ├── Size Group 6-10
//      └── Size Group Free Size
//
// ======================================================

const createArticleSizeGroupTable = () => {

    const sql = `
        CREATE TABLE IF NOT EXISTS articlesizegroup (

            id INT AUTO_INCREMENT PRIMARY KEY,

            articleid INT NOT NULL,

            sizegroupid INT NOT NULL,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT fk_asg_article
                FOREIGN KEY (articleid)
                REFERENCES articlemaster(articleid)
                ON UPDATE CASCADE
                ON DELETE CASCADE,

            CONSTRAINT fk_asg_sizegroup
                FOREIGN KEY (sizegroupid)
                REFERENCES sizegroup(sizegroupid)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,

            UNIQUE (articleid, sizegroupid)

        )
    `;

    db.query(sql, (err) => {

        if (err) {
            console.log("Article Size Group Table Error:", err);
        } else {
            console.log("Article Size Group table ready.");
        }

    });

};


// ======================================================
// CREATE ARTICLE VARIANT TABLE
// ======================================================
//
// Variant combination:
//
// Article
// + Gender
// + Color
// + Size Group
// + Size
//
// Example:
//
// A101 + Male + Black + Size Group 1-5 + Size 1
//
// ======================================================

const createArticleVariantTable = () => {

    const sql = `
        CREATE TABLE IF NOT EXISTS articlevariant (

            variantid INT AUTO_INCREMENT PRIMARY KEY,

            articleid INT NOT NULL,

            genderid INT NOT NULL,

            colorid INT NOT NULL,

            sizegroupid INT NOT NULL,

            sizeid INT NOT NULL,

            isactive BOOLEAN DEFAULT TRUE,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


            -- ARTICLE
            CONSTRAINT fk_variant_article
                FOREIGN KEY (articleid)
                REFERENCES articlemaster(articleid)
                ON UPDATE CASCADE
                ON DELETE CASCADE,


            -- GENDER
            CONSTRAINT fk_variant_gender
                FOREIGN KEY (genderid)
                REFERENCES gender(genderid)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,


            -- COLOR
            CONSTRAINT fk_variant_color
                FOREIGN KEY (colorid)
                REFERENCES color(colorid)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,


            -- SIZE GROUP
            CONSTRAINT fk_variant_sizegroup
                FOREIGN KEY (sizegroupid)
                REFERENCES sizegroup(sizegroupid)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,


            -- SIZE
            CONSTRAINT fk_variant_size
                FOREIGN KEY (sizeid)
                REFERENCES size(sizeid)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,


            -- PREVENT DUPLICATE VARIANT
            UNIQUE (
                articleid,
                genderid,
                colorid,
                sizegroupid,
                sizeid
            )

        )
    `;

    db.query(sql, (err) => {

        if (err) {
            console.log("Article Variant Table Error:", err);
        } else {
            console.log("Article Variant table ready.");
        }

    });

};


// ======================================================
// CREATE ARTICLE IMAGES TABLE
// ======================================================

const createArticleImagesTable = () => {

    const sql = `
        CREATE TABLE IF NOT EXISTS articleimages (

            imageid INT AUTO_INCREMENT PRIMARY KEY,

            articleid INT NOT NULL,

            imageurl VARCHAR(255) NOT NULL,

            isprimary BOOLEAN DEFAULT FALSE,

            sortorder INT DEFAULT 0,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


            CONSTRAINT fk_article_images
                FOREIGN KEY (articleid)
                REFERENCES articlemaster(articleid)
                ON UPDATE CASCADE
                ON DELETE CASCADE

        )
    `;

    db.query(sql, (err) => {

        if (err) {
            console.log("Article Images Table Error:", err);
        } else {
            console.log("Article Images table ready.");
        }

    });

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createArticleMasterTable,

    createArticleSizeGroupTable,

    createArticleVariantTable,

    createArticleImagesTable

};

