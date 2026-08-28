const db = require("../config/connectdb");


// =====================================================
// GET ALL ORDERS
// =====================================================

exports.getAllOrders = (callback) => {

    const sql = `
        SELECT
            o.orderid,
            o.orderno,
            o.orderdate,
            o.salespersonid,
            sp.salespersonname,
            o.totalqty,
            o.isactive,
            o.created_at

        FROM orders o

        LEFT JOIN salesperson sp
            ON o.salespersonid = sp.salespersonid

        WHERE o.isactive = 1

        ORDER BY o.orderid DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("ORDER MODEL SQL ERROR:", err);
            console.error("SQL:", sql);
            return callback(err, null);
        }

        callback(null, results);
    });
};


// =====================================================
// GET ORDER BY ID
// =====================================================

exports.getOrderById = (orderid, callback) => {

    const sql = `
        SELECT
            o.orderid,
            o.orderno,
            o.orderdate,
            o.salespersonid,
            sp.salespersonname,
            o.totalqty,
            o.isactive,
            o.created_at

        FROM orders o

        LEFT JOIN salesperson sp
            ON o.salespersonid = sp.salespersonid

        WHERE o.orderid = ?
          AND o.isactive = 1
    `;

    db.query(sql, [orderid], callback);
};


// =====================================================
// GET ORDER DETAILS
// =====================================================

exports.getOrderDetails = (orderid, callback) => {

    const sql = `
        SELECT

            od.orderdetailid,
            od.orderid,
            od.variantid,

            av.articleid,

            a.articleno,
            a.articlename,

            av.genderid,
            g.gender,

            av.colorid,
            c.color,

            av.sizeid,
            s.size,

            (
                SELECT ai.imageurl
                FROM articleimages ai
                WHERE ai.articleid = a.articleid
                ORDER BY ai.isprimary DESC, ai.sortorder ASC
                LIMIT 1
            ) AS imageurl,

            od.qty,
            od.created_at

        FROM orderdetails od

        LEFT JOIN articlevariant av
            ON od.variantid = av.variantid

        LEFT JOIN articlemaster a
            ON av.articleid = a.articleid

        LEFT JOIN gender g
            ON av.genderid = g.genderid

        LEFT JOIN color c
            ON av.colorid = c.colorid

        LEFT JOIN size s
            ON av.sizeid = s.sizeid

        WHERE od.orderid = ?

        ORDER BY od.orderdetailid ASC
    `;

    db.query(sql, [orderid], callback);
};


// =====================================================
// GET ORDER WITH DETAILS
// =====================================================

exports.getOrderWithDetails = (orderid, callback) => {

    exports.getOrderById(orderid, (err, orderResult) => {

        if (err) {
            return callback(err);
        }

        if (!orderResult || orderResult.length === 0) {
            return callback(null, []);
        }

        exports.getOrderDetails(orderid, (detailErr, detailResult) => {

            if (detailErr) {
                return callback(detailErr);
            }

            const order = orderResult[0];

            order.details = detailResult;

            callback(null, [order]);
        });
    });
};


// =====================================================
// CREATE ORDER
// =====================================================

exports.createOrder = (orderData, callback) => {

    const {
        orderno,
        orderdate,
        salespersonid,
        totalqty
    } = orderData;

    const sql = `
        INSERT INTO orders
        (
            orderno,
            orderdate,
            salespersonid,
            totalqty,
            isactive
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            orderno,
            orderdate,
            salespersonid,
            totalqty || 0,
            1
        ],
        callback
    );
};


// =====================================================
// UPDATE ORDER
// =====================================================

exports.updateOrder = (orderid, orderData, callback) => {

    const {
        orderno,
        orderdate,
        salespersonid,
        totalqty,
        isactive
    } = orderData;

    const sql = `
        UPDATE orders
        SET
            orderno = ?,
            orderdate = ?,
            salespersonid = ?,
            totalqty = ?,
            isactive = ?

        WHERE orderid = ?
    `;

    db.query(
        sql,
        [
            orderno,
            orderdate,
            salespersonid,
            totalqty || 0,
            isactive !== undefined ? isactive : 1,
            orderid
        ],
        callback
    );
};


// =====================================================
// DELETE ORDER
// =====================================================

exports.deleteOrder = (orderid, callback) => {

    const sql = `
        UPDATE orders
        SET isactive = 0
        WHERE orderid = ?
    `;

    db.query(
        sql,
        [orderid],
        callback
    );
};


// =====================================================
// CREATE ORDER DETAIL
// =====================================================

exports.createOrderDetail = (detailData, callback) => {

    const {
        orderid,
        variantid,
        qty
    } = detailData;

    const sql = `
        INSERT INTO orderdetails
        (
            orderid,
            variantid,
            qty
        )
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [
            orderid,
            variantid,
            qty
        ],
        callback
    );
};


// =====================================================
// CREATE MULTIPLE ORDER DETAILS
// =====================================================

exports.createOrderDetails = (orderid, details, callback) => {

    if (!details || details.length === 0) {
        return callback(null);
    }

    const values = details.map(detail => [
        orderid,
        detail.variantid,
        detail.qty
    ]);

    const sql = `
        INSERT INTO orderdetails
        (
            orderid,
            variantid,
            qty
        )
        VALUES ?
    `;

    db.query(sql, [values], callback);
};


// =====================================================
// UPDATE ORDER DETAIL
// =====================================================

exports.updateOrderDetail = (orderdetailid, detailData, callback) => {

    const {
        variantid,
        qty
    } = detailData;

    const sql = `
        UPDATE orderdetails
        SET
            variantid = ?,
            qty = ?

        WHERE orderdetailid = ?
    `;

    db.query(
        sql,
        [
            variantid,
            qty,
            orderdetailid
        ],
        callback
    );
};


// =====================================================
// DELETE SINGLE ORDER DETAIL
// =====================================================

exports.deleteOrderDetail = (orderdetailid, callback) => {

    const sql = `
        DELETE FROM orderdetails
        WHERE orderdetailid = ?
    `;

    db.query(sql, [orderdetailid], callback);
};


// =====================================================
// DELETE ALL ORDER DETAILS
// =====================================================

exports.deleteOrderDetails = (orderid, callback) => {

    const sql = `
        DELETE FROM orderdetails
        WHERE orderid = ?
    `;

    db.query(sql, [orderid], callback);
};


// =====================================================
// UPDATE ORDER TOTAL QTY
// =====================================================

exports.updateOrderTotalQty = (orderid, callback) => {

    const sql = `
        UPDATE orders
        SET totalqty = (
            SELECT COALESCE(SUM(qty), 0)
            FROM orderdetails
            WHERE orderid = ?
        )
        WHERE orderid = ?
    `;

    db.query(
        sql,
        [
            orderid,
            orderid
        ],
        callback
    );
};


// =====================================================
// GET NEXT ORDER ID
// =====================================================

exports.getNextOrderId = (callback) => {

    const sql = `
        SELECT
            COALESCE(MAX(orderid), 0) + 1 AS nextorderid
        FROM orders
    `;

    db.query(sql, callback);
};


// =====================================================
// GET LAST ORDER NUMBER
// =====================================================

exports.getLastOrderNo = (callback) => {

    const sql = `
        SELECT
            orderno
        FROM orders
        ORDER BY orderid DESC
        LIMIT 1
    `;

    db.query(sql, callback);
};


// =====================================================
// CHECK ORDER NUMBER EXISTS
// =====================================================

exports.checkOrderNoExists = (orderno, callback) => {

    const sql = `
        SELECT
            orderid,
            orderno
        FROM orders
        WHERE orderno = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [orderno],
        callback
    );
};


// =====================================================
// GET ORDERS BY SALESPERSON
// =====================================================

exports.getOrdersBySalesperson = (salespersonid, callback) => {

    const sql = `
        SELECT
            o.orderid,
            o.orderno,
            o.orderdate,
            o.salespersonid,
            sp.salespersonname,
            o.totalqty,
            o.created_at

        FROM orders o

        LEFT JOIN salesperson sp
            ON o.salespersonid = sp.salespersonid

        WHERE o.salespersonid = ?

        ORDER BY o.orderid DESC
    `;

    db.query(
        sql,
        [salespersonid],
        callback
    );
};


// =====================================================
// GET ORDERS BY DATE
// =====================================================

exports.getOrdersByDate = (orderdate, callback) => {

    const sql = `
        SELECT
            o.orderid,
            o.orderno,
            o.orderdate,
            o.salespersonid,
            sp.salespersonname,
            o.totalqty,
            o.created_at

        FROM orders o

        LEFT JOIN salesperson sp
            ON o.salespersonid = sp.salespersonid

        WHERE DATE(o.orderdate) = ?

        ORDER BY o.orderid DESC
    `;

    db.query(
        sql,
        [orderdate],
        callback
    );
};


// =====================================================
// GET ARTICLE VARIANTS FOR ORDER ENTRY
// =====================================================
// Article select karne ke baad variant + image
// dikhane ke liye
// =====================================================

exports.getArticleVariantsForOrder = (articleid, callback) => {

    const sql = `
        SELECT

            av.variantid,
            av.articleid,

            a.articleno,
            a.articlename,

            av.genderid,
            g.gender,

            av.colorid,
            c.color,

            av.sizeid,
            s.size,

            (
                SELECT ai.imageurl
                FROM articleimages ai
                WHERE ai.articleid = a.articleid
                ORDER BY ai.isprimary DESC, ai.sortorder ASC
                LIMIT 1
            ) AS imageurl,

            av.isactive

        FROM articlevariant av

        LEFT JOIN articlemaster a
            ON av.articleid = a.articleid

        LEFT JOIN gender g
            ON av.genderid = g.genderid

        LEFT JOIN color c
            ON av.colorid = c.colorid

        LEFT JOIN size s
            ON av.sizeid = s.sizeid

        WHERE av.articleid = ?
          AND av.isactive = 1

        ORDER BY av.variantid ASC
    `;

    db.query(
        sql,
        [articleid],
        callback
    );
};


// =====================================================
// GET ARTICLE FOR ORDER ENTRY
// =====================================================
// Article select karte hi article ki primary image
// aur basic information lene ke liye
// =====================================================

exports.getArticleForOrder = (articleid, callback) => {

    const sql = `
        SELECT

            a.articleid,
            a.articleno,
            a.articlename,

            a.categoryid,
            c.category,

            a.sizegroupid,
            sg.sizegroup,

            (
                SELECT ai.imageurl
                FROM articleimages ai
                WHERE ai.articleid = a.articleid
                ORDER BY ai.isprimary DESC, ai.sortorder ASC
                LIMIT 1
            ) AS imageurl,

            a.isactive,
            a.created_at

        FROM articlemaster a

        LEFT JOIN category c
            ON a.categoryid = c.categoryid

        LEFT JOIN sizegroup sg
            ON a.sizegroupid = sg.sizegroupid

        WHERE a.articleid = ?

        LIMIT 1
    `;

    db.query(
        sql,
        [articleid],
        callback
    );
};