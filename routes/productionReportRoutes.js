const express = require("express");
const multer = require("multer");

const router = express.Router();

const productionReportController = require("../controllers/productionReportController");

// ======================================================
// MULTER CONFIGURATION
// ======================================================

const storage = multer.memoryStorage();

const upload = multer({
storage,
limits: {
fileSize: 10 * 1024 * 1024 // 10 MB
},
fileFilter: (req, file, cb) => {
const allowedExtensions = /.(xlsx|xls)$/i;

 
    if (allowedExtensions.test(file.originalname)) {
        return cb(null, true);
    }

    return cb(
        new Error("Only Excel files (.xlsx, .xls) are allowed.")
    );
}
 

});

// ======================================================
// UPLOAD PRODUCTION EXCEL
// POST /api/production-report/upload
// ======================================================

router.post(
"/upload",
upload.single("file"),
(req, res, next) => {
if (
typeof productionReportController.uploadProductionExcel !==
"function"
) {
return res.status(500).json({
success: false,
message: "uploadProductionExcel controller function not found."
});
}

 
    return productionReportController.uploadProductionExcel(
        req,
        res,
        next
    );
}
 

);

// ======================================================
// GET PRODUCTION REPORT
// GET /api/production-report
// ======================================================

router.get("/", (req, res, next) => {
if (
typeof productionReportController.getProductionReport !== "function"
) {
return res.status(500).json({
success: false,
message: "getProductionReport controller function not found."
});
}

 
return productionReportController.getProductionReport(
    req,
    res,
    next
);
 

});

// Optional alias:
// GET /api/production-report/report

router.get("/report", (req, res, next) => {
if (
typeof productionReportController.getProductionReport !== "function"
) {
return res.status(500).json({
success: false,
message: "getProductionReport controller function not found."
});
}

 
return productionReportController.getProductionReport(
    req,
    res,
    next
);
 

});

// ======================================================
// GET PRODUCTION SUMMARY
// GET /api/production-report/summary
// ======================================================

router.get("/summary", (req, res, next) => {
if (
typeof productionReportController.getProductionSummary !== "function"
) {
return res.status(500).json({
success: false,
message: "getProductionSummary controller function not found."
});
}

 
return productionReportController.getProductionSummary(
    req,
    res,
    next
);
 

});

// ======================================================
// MULTER ERROR HANDLER
// ======================================================

router.use((err, req, res, next) => {
if (err instanceof multer.MulterError) {
const message =
err.code === "LIMIT_FILE_SIZE"
? "Excel file maximum size is 10 MB."
: err.message;

 
    return res.status(400).json({
        success: false,
        message
    });
}

if (
    err.message ===
    "Only Excel files (.xlsx, .xls) are allowed."
) {
    return res.status(400).json({
        success: false,
        message: err.message
    });
}

console.error("Production Report Route Error:", err);

return res.status(500).json({
    success: false,
    message: "Production report request failed.",
    error: err.message
});
 

});

module.exports = router;
