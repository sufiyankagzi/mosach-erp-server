const db = require("../config/connectdb");

// CREATE ARTICLE MASTER TABLE
const createArticleMasterTable = () => {

    const sql = `
        CREATE TABLE IF NOT EXISTS articlemaster (

            articleid INT AUTO_INCREMENT PRIMARY KEY,

            articleno VARCHAR(50) NOT NULL UNIQUE,

            articlename VARCHAR(150) NOT NULL,

            categoryid INT NOT NULL,

            sizegroupid INT NOT NULL,

            isactive BOOLEAN DEFAULT TRUE,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT fk_article_category
                FOREIGN KEY (categoryid)
                REFERENCES category(categoryid)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,

            CONSTRAINT fk_article_sizegroup
                FOREIGN KEY (sizegroupid)
                REFERENCES sizegroup(sizegroupid)
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


// CREATE ARTICLE VARIANT TABLE
const createArticleVariantTable = () => {

    const sql = `
        CREATE TABLE IF NOT EXISTS articlevariant (

            variantid INT AUTO_INCREMENT PRIMARY KEY,

            articleid INT NOT NULL,

            genderid INT NOT NULL,

            colorid INT NOT NULL,

            sizeid INT NOT NULL,

            isactive BOOLEAN DEFAULT TRUE,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT fk_variant_article
                FOREIGN KEY (articleid)
                REFERENCES articlemaster(articleid)
                ON UPDATE CASCADE
                ON DELETE CASCADE,

            CONSTRAINT fk_variant_gender
                FOREIGN KEY (genderid)
                REFERENCES gender(genderid)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,

            CONSTRAINT fk_variant_color
                FOREIGN KEY (colorid)
                REFERENCES color(colorid)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,

            CONSTRAINT fk_variant_size
                FOREIGN KEY (sizeid)
                REFERENCES size(sizeid)
                ON UPDATE CASCADE
                ON DELETE RESTRICT,

            UNIQUE (articleid, genderid, colorid, sizeid)

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


// CREATE ARTICLE IMAGES TABLE
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


module.exports = {
    createArticleMasterTable,
    createArticleVariantTable,
    createArticleImagesTable
};