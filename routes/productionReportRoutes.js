const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
    uploadProductionExcel,
    fetchProductionReport,
    fetchProductionSummary
} = require("../controllers/productionReportController");

// MULTER CONFIGURATION

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Maximum 10 MB
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = /\.(xlsx|xls)$/i;

        if (allowedExtensions.test(file.originalname)) {
            return cb(null, true);
        }

        cb(new Error("Only Excel files (.xlsx, .xls) are allowed."));
    }
});

// 1. UPLOAD PRODUCTION EXCEL
router.post(
    "/upload",
    upload.single("file"),
    uploadProductionExcel
);

// 2. GET PRODUCTION REPORT
router.get(
    "/",
    fetchProductionReport
);

// 3. GET DASHBOARD SUMMARY
router.get(
    "/summary",
    fetchProductionSummary
);

module.exports = router;