const express=require("express");
const router=express.Router();
const userController=require("../controllers/usersController");
const authMiddleware = require("../middlewares/authMiddleware");

// PROTECTED
router.get("/", authMiddleware, userController.getUsers);
router.get("/:id", authMiddleware, userController.getUser);

router.post("/", authMiddleware, userController.addUser);

router.put("/:id", authMiddleware, userController.editUser);

router.delete("/:id", authMiddleware, userController.deleteUser);

// // GET ALL
// router.get("/",userController.getUsers);
// // GET SINGLE
// router.get("/:id",userController.getUser);
// // CREATE
// router.post("/",userController.addUser);
// // UPDATE
// router.put("/:id",userController.editUser);
// // DELETE
// router.delete("/:id",userController.deleteUser);

module.exports=router;