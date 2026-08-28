const express = require("express");

const router = express.Router();

const orderController = require("../controllers/orderController");


// =====================================================
// ORDER ROUTES
// =====================================================

// GET ALL ORDERS
// GET /api/orders
router.get(
    "/",
    orderController.getAllOrders
);


// GET ORDER BY ID WITH DETAILS
// GET /api/orders/:id
router.get(
    "/:id",
    orderController.getOrderById
);


// CREATE ORDER
// POST /api/orders
router.post(
    "/",
    orderController.createOrder
);


// UPDATE ORDER
// PUT /api/orders/:id
router.put(
    "/:id",
    orderController.updateOrder
);


// DELETE ORDER
// DELETE /api/orders/:id
router.delete(
    "/:id",
    orderController.deleteOrder
);


// =====================================================
// ORDER FILTER ROUTES
// =====================================================

// GET ORDERS BY SALESPERSON
// GET /api/orders/salesperson/:salespersonid
router.get(
    "/salesperson/:salespersonid",
    orderController.getOrdersBySalesperson
);


// GET ORDERS BY DATE
// GET /api/orders/date/:orderdate
router.get(
    "/date/:orderdate",
    orderController.getOrdersByDate
);


// =====================================================
// ARTICLE ROUTES FOR ORDER ENTRY
// =====================================================

// GET ARTICLE + PRIMARY IMAGE
// GET /api/orders/article/:articleid
router.get(
    "/article/:articleid",
    orderController.getArticleForOrder
);


// GET ARTICLE VARIANTS
// Gender + Color + Size + Image
// GET /api/orders/article/:articleid/variants
router.get(
    "/article/:articleid/variants",
    orderController.getArticleVariantsForOrder
);


// =====================================================
// ORDER NUMBER
// =====================================================

// CHECK ORDER NUMBER
// GET /api/orders/check-orderno/:orderno
router.get(
    "/check-orderno/:orderno",
    orderController.checkOrderNoExists
);


module.exports = router;