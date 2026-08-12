const express=require("express");
const router=express.Router();
const userController=require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// PROTECTED
router.get("/", authMiddleware, userController.getUsers);
router.get("/:id", authMiddleware, userController.getUser);
router.post("/", authMiddleware, userController.addUser);
router.put("/:id", authMiddleware, userController.editUser);
router.delete("/:id", authMiddleware, userController.deleteUser);

module.exports=router;