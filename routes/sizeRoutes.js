const express = require("express");

const router = express.Router();

const sizeController = require("../controllers/sizeController");
const authMiddleware = require("../middlewares/authMiddleware");


// ========================================
// GET ALL SIZE
// ========================================
router.get(
    "/",
    authMiddleware,
    sizeController.getAllSize
);


// ========================================
// GET SINGLE SIZE
// ========================================
router.get(
    "/:id",
    authMiddleware,
    sizeController.getSizeById
);


// ========================================
// CREATE SIZE
// ========================================
router.post(
    "/",
    authMiddleware,
    sizeController.addSize
);


// ========================================
// UPDATE SIZE
// ========================================
router.put(
    "/:id",
    authMiddleware,
    sizeController.editSize
);


// ========================================
// DELETE SIZE
// ========================================
router.delete(
    "/:id",
    authMiddleware,
    sizeController.deleteSize
);



module.exports = router;