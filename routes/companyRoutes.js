const express=require("express");
const router=express.Router();
const companyController=require("../controllers/companyController");

// GET ALL
router.get("/",companyController.getCompanies);
// GET SINGLE
router.get("/:id",companyController.getCompany);
// CREATE
router.post("/",companyController.addCompany);
// UPDATE
router.put("/:id",companyController.editCompany);
// DELETE
router.delete("/:id",companyController.removeCompany);

module.exports=router;