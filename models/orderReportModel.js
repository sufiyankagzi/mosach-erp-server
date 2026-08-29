const db = require("../config/connectdb");

// =====================================================
// GET ORDER REPORT
// =====================================================

exports.getOrderReport = (filters, callback) => {

    const {
        fromDate,
        toDate,
        orderno,
        articleno,
        articlename,
        categoryid,
        colorid,
        sizeid,
        sizegroupid,
        salespersonid
    } = filters;


    let sql = `
        SELECT
            om.orderid,
            om.orderno,
            om.orderdate,
            om.salespersonid,
            om.totalqty,

            od.orderdetailid,
            od.articleid,
            od.sizegroupid,
            od.sizeid,
            od.colorid,
            od.qty,

            am.articleno,
            am.articlename,
            am.categoryid,

            c.category,

            sg.sizegroup,

            s.size,

            col.color

        FROM orders om

        INNER JOIN orderdetails od
            ON om.orderid = od.orderid

        INNER JOIN articlemaster am
            ON od.articleid = am.articleid

        LEFT JOIN category c
            ON am.categoryid = c.categoryid

        LEFT JOIN sizegroup sg
            ON od.sizegroupid = sg.sizegroupid

        LEFT JOIN size s
            ON od.sizeid = s.sizeid

        LEFT JOIN color col
            ON od.colorid = col.colorid

        WHERE om.isactive = 1
    `;


    const params = [];


    // =====================================================
    // DATE FILTER
    // =====================================================

    if (fromDate) {
        sql += ` AND om.orderdate >= ? `;
        params.push(fromDate);
    }


    if (toDate) {
        sql += ` AND om.orderdate <= ? `;
        params.push(toDate);
    }


    // =====================================================
    // ORDER NO
    // =====================================================

    if (orderno) {
        sql += ` AND om.orderno LIKE ? `;
        params.push(`%${orderno}%`);
    }


    // =====================================================
    // ARTICLE NO
    // =====================================================

    if (articleno) {
        sql += ` AND am.articleno LIKE ? `;
        params.push(`%${articleno}%`);
    }


    // =====================================================
    // ARTICLE NAME
    // =====================================================

    if (articlename) {
        sql += ` AND am.articlename LIKE ? `;
        params.push(`%${articlename}%`);
    }


    // =====================================================
    // CATEGORY
    // =====================================================

    if (categoryid) {
        sql += ` AND am.categoryid = ? `;
        params.push(categoryid);
    }


    // =====================================================
    // COLOR
    // =====================================================

    if (colorid) {
        sql += ` AND od.colorid = ? `;
        params.push(colorid);
    }


    // =====================================================
    // SIZE
    // =====================================================

    if (sizeid) {
        sql += ` AND od.sizeid = ? `;
        params.push(sizeid);
    }


    // =====================================================
    // SIZE GROUP
    // =====================================================

    if (sizegroupid) {
        sql += ` AND od.sizegroupid = ? `;
        params.push(sizegroupid);
    }


    // =====================================================
    // SALESPERSON
    // =====================================================

    if (salespersonid) {
        sql += ` AND om.salespersonid = ? `;
        params.push(salespersonid);
    }


    // =====================================================
    // ORDER BY
    // =====================================================

    sql += `
        ORDER BY
            om.orderdate DESC,
            om.orderid DESC,
            od.orderdetailid ASC
    `;


    // =====================================================
    // EXECUTE QUERY
    // =====================================================

    db.query(sql, params, (err, result) => {

        if (err) {
            console.error("Order Report Model Error:", err);
            return callback(err, null);
        }

        callback(null, result);
    });
};