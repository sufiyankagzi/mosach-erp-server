
const orderReportModel = require("../models/orderReportModel");


// =====================================================
// GET ORDER REPORT
// =====================================================

exports.getOrderReport = (req, res) => {

    try {

        const {
            fromDate,
            toDate,
            salespersonid,
            articleid,
            colorid,
            sizegroupid,
            sizeid
        } = req.query;


        // =============================================
        // DATE VALIDATION
        // =============================================

        if (!fromDate || !toDate) {

            return res.status(400).json({
                success: false,
                message: "From Date or To Date is required"
            });

        }


        // =============================================
        // FILTERS
        // =============================================

        const filters = {
            fromDate,
            toDate,
            salespersonid,
            articleid,
            colorid,
            sizegroupid,
            sizeid
        };


        console.log(
            "ORDER REPORT FILTERS:",
            filters
        );


        // =============================================
        // MODEL
        // =============================================

        orderReportModel.getOrderReport(
            filters,
            (err, results) => {

                if (err) {

                    console.error(
                        "GET ORDER REPORT ERROR:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Failed to get order report",
                        error: err.message
                    });

                }


                // =====================================
                // SUCCESS
                // =====================================

                return res.status(200).json({

                    success: true,

                    count: results.length,

                    data: results

                });

            }
        );

    } catch (error) {

        console.error(
            "ORDER REPORT CONTROLLER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

            error: error.message

        });

    }

};

