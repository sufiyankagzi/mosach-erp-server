const db = require("../config/connectdb");

exports.getOrderReport = (filters, callback) => {

    const {
        fromdate,
        todate
    } = filters;

    let sql = `
        SELECT
            o.orderid,
            o.orderno,
            o.orderdate,
            o.salespersonid,

            od.orderdetailid,
            od.articleid,
            od.colorid,
            od.sizegroupid,
            od.sizeid,
            od.qty

        FROM orders o

        INNER JOIN orderdetails od
            ON o.orderid = od.orderid

        WHERE o.isactive = 1
    `;

    const params = [];

    if (fromdate && todate) {
        sql += `
            AND DATE(o.orderdate) >= ?
            AND DATE(o.orderdate) <= ?
        `;

        params.push(fromdate, todate);
    }

    sql += `
        ORDER BY
            o.orderdate ASC,
            o.orderid ASC,
            od.orderdetailid ASC
    `;

    console.log("REPORT SQL:", sql);
    console.log("REPORT PARAMS:", params);

    db.query(sql, params, (err, results) => {

        if (err) {

            console.error("REPORT SQL ERROR:", err);

            return callback(err, null);
        }

        console.log("REPORT RESULT COUNT:", results.length);
        console.log("REPORT RESULTS:", results);

        callback(null, results);
    });
};