const express=require("express");
const router=express.Router();
const genderController=require("../controllers/genderController");
const authMiddleware = require("../middlewares/authMiddleware");

// PROTECTED
router.get("/", authMiddleware, genderController.getAllgender);
router.get("/:id",authMiddleware,  genderController.getgenderById);
router.post("/",authMiddleware,  genderController.addgender);
router.put("/:id",authMiddleware,  genderController.editgender);
router.delete("/:id",authMiddleware,  genderController.deletegender);

module.exports=router;