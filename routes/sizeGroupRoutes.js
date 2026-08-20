const express=require("express");
const router=express.Router();
const sizeGroupController=require("../controllers/sizeGroupController");
const authMiddleware = require("../middlewares/authMiddleware");

// PROTECTED
router.get("/", authMiddleware, sizeGroupController.getAllSizeGroup);
router.get("/:id",authMiddleware,  sizeGroupController.getSizeGroupById);
router.post("/",authMiddleware,  sizeGroupController.addSizeGroup);
router.put("/:id",authMiddleware,  sizeGroupController.editSizeGroup);
router.delete("/:id",authMiddleware,  sizeGroupController.deleteSizeGroup);

module.exports=router;