const express = require("express");
const router = express.Router();
const articleBomController = require("../controllers/articleBomController");
const authMiddleware = require("../middlewares/authMiddleware");


router.get("/",authMiddleware,articleBomController.getAllArticleBom);
router.get("/:id",authMiddleware,articleBomController.getArticleBomById);
router.get("/article/:articleid",authMiddleware,articleBomController.getArticleBomByArticleId);
router.post("/",authMiddleware,articleBomController.addArticleBom);
router.put("/:id",authMiddleware,articleBomController.editArticleBom);
router.delete("/:id",authMiddleware,articleBomController.deleteArticleBom);


module.exports = router;