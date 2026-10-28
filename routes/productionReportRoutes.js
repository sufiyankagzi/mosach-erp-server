const express = require("express");
const multer = require("multer");

const router = express.Router();

// Import Controller
const productionReportController = require("../controllers/productionReportController");

// ========================================
// MULTER CONFIGURATION
// ========================================

const storage = multer.memoryStorage();

const upload = multer({
storage: storage,
limits: {
fileSize: 10 * 1024 * 1024
},
fileFilter: function (req, file, cb) {
const allowedExtensions = /\.(xlsx|xls)$/i;


    if (allowedExtensions.test(file.originalname)) {
        return cb(null, true);
    }

    return cb(
        new Error("Only Excel files (.xlsx, .xls) are allowed.")
    );
}


});

// ========================================
// UPLOAD PRODUCTION EXCEL
// POST /api/production-report/upload
// ========================================

router.post(
"/upload",
upload.single("file"),
function (req, res, next) {
if (typeof productionReportController.uploadProductionExcel !== "function") {
return res.status(500).json({
success: false,
message: "uploadProductionExcel controller function not found."
});
}


    return productionReportController.uploadProductionExcel(req, res, next);
}


);

// ========================================
// GET PRODUCTION REPORT
// GET /api/production-report
// ========================================

router.get(
"/",
function (req, res, next) {
if (typeof productionReportController.getProductionReport !== "function") {
return res.status(500).json({
success: false,
message: "getProductionReport controller function not found."
});
}


    return productionReportController.getProductionReport(req, res, next);
}


);

// ========================================
// GET PRODUCTION SUMMARY
// GET /api/production-report/summary
// ========================================

router.get(
"/summary",
function (req, res, next) {
if (typeof productionReportController.getProductionSummary !== "function") {
return res.status(500).json({
success: false,
message: "getProductionSummary controller function not found."
});
}


    return productionReportController.getProductionSummary(req, res, next);
}


);

// ========================================
// EXPORT ROUTER
// ========================================

module.exports = router;
