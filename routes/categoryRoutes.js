const express=require("express");
const router=express.Router();
const categoryController=require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");

// PROTECTED
router.get("/", authMiddleware, categoryController.getAllCategory);
router.get("/:id",authMiddleware,  categoryController.getCategoryById);
router.post("/",authMiddleware,  categoryController.addCategory);
router.put("/:id",authMiddleware,  categoryController.editCategory);
router.delete("/:id",authMiddleware,  categoryController.deleteCategory);

module.exports=router;