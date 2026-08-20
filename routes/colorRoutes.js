const express=require("express");
const router=express.Router();
const colorController=require("../controllers/colorController");
const authMiddleware = require("../middlewares/authMiddleware");

// PROTECTED
router.get("/", authMiddleware, colorController.getAllColor);
router.get("/:id",authMiddleware,  colorController.getColorById);
router.post("/",authMiddleware,  colorController.addColor);
router.put("/:id",authMiddleware,  colorController.editColor);
router.delete("/:id",authMiddleware,  colorController.deleteColor);

module.exports=router;