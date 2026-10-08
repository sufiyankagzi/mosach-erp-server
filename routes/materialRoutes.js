const express=require("express");
const router=express.Router();
const materialController=require("../controllers/materialController");
const authMiddleware = require("../middlewares/authMiddleware");

// PROTECTED
router.get("/", authMiddleware, materialController.getAllMaterial);
router.get("/:id",authMiddleware,  materialController.getMaterialById);
router.post("/",authMiddleware,  materialController.addMaterial);
router.put("/:id",authMiddleware,  materialController.editMaterial);
router.delete("/:id",authMiddleware,  materialController.deleteMaterial);

module.exports=router;