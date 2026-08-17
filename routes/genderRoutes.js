const express=require("express");
const router=express.Router();
const genderController=require("../controllers/genderController");
const authMiddleware = require("../middlewares/authMiddleware");

// PROTECTED
router.get("/", authMiddleware, genderController.getAllGender);
router.get("/:id",authMiddleware,  genderController.getGenderById);
router.post("/",authMiddleware,  genderController.addGender);
router.put("/:id",authMiddleware,  genderController.editGender);
router.delete("/:id",authMiddleware,  genderController.deleteGender);

module.exports=router;