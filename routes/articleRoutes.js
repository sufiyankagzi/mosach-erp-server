const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
// ==========================================
// ARTICLE
// ==========================================
// GET ALL ARTICLES
router.get(
    "/getallarticles",
    articleController.getAllArticles
);
// GET ARTICLE BY ID
router.get(
    "/getarticle/:id",
    articleController.getArticleById
);
// CREATE ARTICLE
router.post(
    "/createarticle",
    articleController.createArticle
);
// UPDATE ARTICLE
router.put(
    "/updatearticle/:id",
    articleController.updateArticle
);
// DELETE ARTICLE
router.delete(
    "/deletearticle/:id",
    articleController.deleteArticle
);


// ==========================================
// ARTICLE VARIANTS
// ==========================================
// GET ARTICLE VARIANTS
router.get(
    "/getvariants/:id",
    articleController.getArticleVariants
);
// CREATE ARTICLE VARIANT
router.post(
    "/createvariant/:id",
    articleController.createArticleVariant
);
// UPDATE ARTICLE VARIANT
router.put(
    "/updatevariant/:id",
    articleController.updateArticleVariant
);
// DELETE SINGLE ARTICLE VARIANT
router.delete(
    "/deletevariant/:id",
    articleController.deleteArticleVariant
);
// DELETE ALL ARTICLE VARIANTS
router.delete(
    "/deletevariants/:id",
    articleController.deleteArticleVariants
);


// ==========================================
// ARTICLE IMAGES
// ==========================================
// GET ARTICLE IMAGES
router.get(
    "/getimages/:id",
    articleController.getArticleImages
);
// CREATE ARTICLE IMAGE
router.post(
    "/createimage/:id",
    articleController.createArticleImage
);
// UPDATE ARTICLE IMAGE
router.put(
    "/updateimage/:id",
    articleController.updateArticleImage
);
// DELETE SINGLE ARTICLE IMAGE
router.delete(
    "/deleteimage/:id",
    articleController.deleteArticleImage
);
// DELETE ALL ARTICLE IMAGES
router.delete(
    "/deleteimages/:id",
    articleController.deleteArticleImages
);
module.exports = router;

