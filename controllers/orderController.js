const orderModel = require("../models/orderModel");


// =====================================================
// GET ALL ORDERS
// =====================================================

exports.getAllOrders = (req, res) => {

    orderModel.getAllOrders((err, results) => {

        if (err) {
            console.error("GET ALL ORDERS ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch orders",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
};


// =====================================================
// GET ORDER BY ID
// =====================================================

exports.getOrderById = (req, res) => {

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Order ID is required"
        });
    }

    orderModel.getOrderWithDetails(id, (err, results) => {

        if (err) {
            console.error("GET ORDER ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch order",
                error: err.message
            });
        }

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            data: results[0]
        });
    });
};


// =====================================================
// CREATE ORDER
// =====================================================

exports.createOrder = (req, res) => {

    const {
        orderdate,
        salespersonid,
        details
    } = req.body;


    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!salespersonid) {
        return res.status(400).json({
            success: false,
            message: "Salesperson is required"
        });
    }


    if (!details || !Array.isArray(details) || details.length === 0) {
        return res.status(400).json({
            success: false,
            message: "At least one order detail is required"
        });
    }


    // -------------------------------------------------
    // VALIDATE DETAILS
    // -------------------------------------------------

    for (const detail of details) {

        if (!detail.variantid) {
            return res.status(400).json({
                success: false,
                message: "Variant ID is required in every order detail"
            });
        }

        if (
            detail.qty === undefined ||
            detail.qty === null ||
            Number(detail.qty) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }
    }


    // -------------------------------------------------
    // CALCULATE TOTAL QTY
    // -------------------------------------------------

    const totalqty = details.reduce(
        (total, detail) => {
            return total + Number(detail.qty);
        },
        0
    );


    // -------------------------------------------------
    // GENERATE ORDER NUMBER
    // -------------------------------------------------

    orderModel.getLastOrderNo((err, result) => {

        if (err) {
            console.error("GET LAST ORDER NO ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to generate order number",
                error: err.message
            });
        }


        let nextOrderNumber = 1;


        if (result && result.length > 0 && result[0].orderno) {

            const lastOrderNo = String(result[0].orderno);

            const numberPart = parseInt(
                lastOrderNo.replace(/\D/g, ""),
                10
            );

            if (!isNaN(numberPart)) {
                nextOrderNumber = numberPart + 1;
            }
        }


        const orderno =
            "ORD-" + String(nextOrderNumber).padStart(5, "0");


        // -------------------------------------------------
        // ORDER DATE
        // -------------------------------------------------

        const finalOrderDate =
            orderdate || new Date();


        // -------------------------------------------------
        // CREATE ORDER
        // -------------------------------------------------

        orderModel.createOrder(
            {
                orderno,
                orderdate: finalOrderDate,
                salespersonid,
                totalqty
            },

            (createErr, orderResult) => {

                if (createErr) {

                    console.error(
                        "CREATE ORDER ERROR:",
                        createErr
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Failed to create order",
                        error: createErr.message
                    });
                }


                const orderid = orderResult.insertId;


                // -------------------------------------------------
                // CREATE ORDER DETAILS
                // -------------------------------------------------

                orderModel.createOrderDetails(
                    orderid,
                    details,

                    (detailErr) => {

                        if (detailErr) {

                            console.error(
                                "CREATE ORDER DETAILS ERROR:",
                                detailErr
                            );


                            // Rollback style cleanup
                            orderModel.deleteOrder(
                                orderid,
                                () => {}
                            );


                            return res.status(500).json({
                                success: false,
                                message: "Failed to create order details",
                                error: detailErr.message
                            });
                        }


                        // -------------------------------------------------
                        // SUCCESS
                        // -------------------------------------------------

                        res.status(201).json({
                            success: true,
                            message: "Order created successfully",

                            data: {
                                orderid,
                                orderno,
                                orderdate: finalOrderDate,
                                salespersonid,
                                totalqty,
                                details
                            }
                        });
                    }
                );
            }
        );
    });
};


// =====================================================
// UPDATE ORDER
// =====================================================

exports.updateOrder = (req, res) => {

    const { id } = req.params;

    const {
        orderdate,
        salespersonid,
        details
    } = req.body;


    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Order ID is required"
        });
    }


    if (!salespersonid) {
        return res.status(400).json({
            success: false,
            message: "Salesperson is required"
        });
    }


    if (!details || !Array.isArray(details)) {
        return res.status(400).json({
            success: false,
            message: "Order details are required"
        });
    }


    // -------------------------------------------------
    // VALIDATE DETAILS
    // -------------------------------------------------

    for (const detail of details) {

        if (!detail.variantid) {
            return res.status(400).json({
                success: false,
                message: "Variant ID is required"
            });
        }

        if (
            detail.qty === undefined ||
            detail.qty === null ||
            Number(detail.qty) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }
    }


    // -------------------------------------------------
    // CALCULATE TOTAL
    // -------------------------------------------------

    const totalqty = details.reduce(
        (total, detail) => {
            return total + Number(detail.qty);
        },
        0
    );


    // -------------------------------------------------
    // GET EXISTING ORDER
    // -------------------------------------------------

    orderModel.getOrderById(
        id,

        (getErr, orderResult) => {

            if (getErr) {

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch order",
                    error: getErr.message
                });
            }


            if (!orderResult || orderResult.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Order not found"
                });
            }


            const existingOrder = orderResult[0];


            // -------------------------------------------------
            // UPDATE ORDER
            // -------------------------------------------------

            orderModel.updateOrder(
                id,

                {
                    orderno: existingOrder.orderno,
                    orderdate:
                        orderdate || existingOrder.orderdate,
                    salespersonid,
                    totalqty
                },

                (updateErr) => {

                    if (updateErr) {

                        console.error(
                            "UPDATE ORDER ERROR:",
                            updateErr
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Failed to update order",
                            error: updateErr.message
                        });
                    }


                    // -------------------------------------------------
                    // DELETE OLD DETAILS
                    // -------------------------------------------------

                    orderModel.deleteOrderDetails(
                        id,

                        (deleteErr) => {

                            if (deleteErr) {

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Failed to remove old order details",
                                    error: deleteErr.message
                                });
                            }


                            // -------------------------------------------------
                            // INSERT NEW DETAILS
                            // -------------------------------------------------

                            orderModel.createOrderDetails(
                                id,
                                details,

                                (detailErr) => {

                                    if (detailErr) {

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Failed to update order details",
                                            error: detailErr.message
                                        });
                                    }


                                    res.status(200).json({
                                        success: true,
                                        message:
                                            "Order updated successfully",

                                        data: {
                                            orderid: Number(id),
                                            orderno:
                                                existingOrder.orderno,
                                            orderdate:
                                                orderdate ||
                                                existingOrder.orderdate,
                                            salespersonid,
                                            totalqty,
                                            details
                                        }
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};


// =====================================================
// DELETE ORDER
// =====================================================

exports.deleteOrder = (req, res) => {

    const { id } = req.params;


    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Order ID is required"
        });
    }


    // -------------------------------------------------
    // DELETE DETAILS FIRST
    // -------------------------------------------------

    orderModel.deleteOrderDetails(
        id,

        (detailErr) => {

            if (detailErr) {

                console.error(
                    "DELETE ORDER DETAILS ERROR:",
                    detailErr
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete order details",
                    error: detailErr.message
                });
            }


            // -------------------------------------------------
            // DELETE ORDER
            // -------------------------------------------------

            orderModel.deleteOrder(
                id,

                (orderErr, result) => {

                    if (orderErr) {

                        console.error(
                            "DELETE ORDER ERROR:",
                            orderErr
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Failed to delete order",
                            error: orderErr.message
                        });
                    }


                    if (result.affectedRows === 0) {

                        return res.status(404).json({
                            success: false,
                            message: "Order not found"
                        });
                    }


                    res.status(200).json({
                        success: true,
                        message: "Order deleted successfully"
                    });
                }
            );
        }
    );
};


// =====================================================
// GET ORDERS BY SALESPERSON
// =====================================================

exports.getOrdersBySalesperson = (req, res) => {

    const { salespersonid } = req.params;


    if (!salespersonid) {
        return res.status(400).json({
            success: false,
            message: "Salesperson ID is required"
        });
    }


    orderModel.getOrdersBySalesperson(
        salespersonid,

        (err, results) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch orders",
                    error: err.message
                });
            }


            res.status(200).json({
                success: true,
                data: results
            });
        }
    );
};


// =====================================================
// GET ORDERS BY DATE
// =====================================================

exports.getOrdersByDate = (req, res) => {

    const { orderdate } = req.params;


    if (!orderdate) {
        return res.status(400).json({
            success: false,
            message: "Order date is required"
        });
    }


    orderModel.getOrdersByDate(
        orderdate,

        (err, results) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch orders",
                    error: err.message
                });
            }


            res.status(200).json({
                success: true,
                data: results
            });
        }
    );
};


// =====================================================
// GET ARTICLE FOR ORDER ENTRY
// =====================================================

exports.getArticleForOrder = (req, res) => {

    const { articleid } = req.params;


    if (!articleid) {
        return res.status(400).json({
            success: false,
            message: "Article ID is required"
        });
    }


    orderModel.getArticleForOrder(
        articleid,

        (err, results) => {

            if (err) {

                console.error(
                    "GET ARTICLE ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch article",
                    error: err.message
                });
            }


            if (!results || results.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Article not found"
                });
            }


            res.status(200).json({
                success: true,
                data: results[0]
            });
        }
    );
};


// =====================================================
// GET ARTICLE VARIANTS FOR ORDER
// =====================================================

exports.getArticleVariantsForOrder = (req, res) => {

    const { articleid } = req.params;


    if (!articleid) {
        return res.status(400).json({
            success: false,
            message: "Article ID is required"
        });
    }


    orderModel.getArticleVariantsForOrder(
        articleid,

        (err, results) => {

            if (err) {

                console.error(
                    "GET ARTICLE VARIANTS ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to fetch article variants",
                    error: err.message
                });
            }


            res.status(200).json({
                success: true,
                data: results
            });
        }
    );
};


// =====================================================
// CHECK ORDER NUMBER
// =====================================================

exports.checkOrderNoExists = (req, res) => {

    const { orderno } = req.params;


    if (!orderno) {
        return res.status(400).json({
            success: false,
            message: "Order number is required"
        });
    }


    orderModel.checkOrderNoExists(
        orderno,

        (err, results) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to check order number",
                    error: err.message
                });
            }


            res.status(200).json({
                success: true,
                exists:
                    results && results.length > 0,
                data: results
            });
        }
    );
};