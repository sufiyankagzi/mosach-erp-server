
const express = require("express");
const router = express.Router();
const orderReportController = require("../controllers/orderReportController");
// =====================================================
// ORDER REPORT
// =====================================================

router.get(
    "/",
    orderReportController.getOrderReport
);


module.exports = router;

