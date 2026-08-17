const express=require("express");
const router=express.Router();
const salespersonController=require("../controllers/salespersonController");
const authMiddleware = require("../middlewares/authMiddleware");

// PROTECTED
router.get("/", authMiddleware, salespersonController.getAllSalesPerson);
router.get("/:id",authMiddleware,  salespersonController.getSalesPersonById);
router.post("/",authMiddleware,  salespersonController.addSalesPerson);
router.put("/:id",authMiddleware,  salespersonController.editSalesPerson);
router.delete("/:id",authMiddleware,  salespersonController.deleteSalesPerson);

module.exports=router;