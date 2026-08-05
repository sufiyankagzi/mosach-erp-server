const db = require("../config/connectdb");


// GET ALL COMPANY
exports.getAllCompanies = (callback) => {
    const sql = "SELECT * FROM company ORDER BY companyid  DESC";

    db.query(sql, callback);
};


// GET SINGLE COMPANY
exports.getCompanyById = (id, callback) => {

    const sql = "SELECT * FROM company WHERE companyid =?";

    db.query(sql, [id], callback);

};


// CREATE COMPANY
exports.createCompany = (data, callback) => {

    const checkSql = `
        SELECT companycode, companyname, gstno, panno
        FROM company
        WHERE companycode = ?
           OR companyname = ?
           OR gstno = ?
           OR panno = ?
    `;

    db.query(
        checkSql,
        [
            data.companycode,
            data.companyname,
            data.gstno,
            data.panno
        ],
        (err, rows) => {

            if (err) return callback(err);

            if (rows.length > 0) {

                const row = rows[0];

                if (row.companycode === data.companycode)
                    return callback(new Error("Company Code already exists"));

                if (row.companyname === data.companyname)
                    return callback(new Error("Company Name already exists"));

                if (row.gstno === data.gstno)
                    return callback(new Error("GST Number already exists"));

                if (row.panno === data.panno)
                    return callback(new Error("PAN Number already exists"));
            }

            const sql = `
                INSERT INTO company
                (
                    companycode,
                    companyname,
                    gstno,
                    panno,
                    mobileno,
                    whatsappno,
                    email,
                    website,
                    contactperson,
                    address1,
                    address2,
                    city,
                    state,
                    country,
                    pincode,
                    logo,
                    isactive
                )
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            `;

            db.query(
                sql,
                [
                    data.companycode,
                    data.companyname,
                    data.gstno,
                    data.panno,
                    data.mobileno,
                    data.whatsappno,
                    data.email,
                    data.website,
                    data.contactperson,
                    data.address1,
                    data.address2,
                    data.city,
                    data.state,
                    data.country,
                    data.pincode,
                    data.logo,
                    data.isactive
                ],
                callback
            );

        }
    );

};


// UPDATE COMPANY
exports.updateCompany = (id, data, callback) => {

    const checkSql = `
        SELECT companycode, companyname, gstno, panno
        FROM company
        WHERE companyid != ?
        AND (
            companycode = ?
            OR companyname = ?
            OR gstno = ?
            OR panno = ?
        )
    `;

    db.query(
        checkSql,
        [
            id,
            data.companycode,
            data.companyname,
            data.gstno,
            data.panno
        ],
        (err, rows) => {

            if (err) return callback(err);

            for (const row of rows) {

    if (row.companycode === data.companycode) {
        return callback(new Error("Company Code already exists"));
    }

    if (row.companyname === data.companyname) {
        return callback(new Error("Company Name already exists"));
    }

    if (row.gstno === data.gstno) {
        return callback(new Error("GST Number already exists"));
    }

    if (row.panno === data.panno) {
        return callback(new Error("PAN Number already exists"));
    }

}

            const sql = `
                UPDATE company SET
                    companycode=?,
                    companyname=?,
                    gstno=?,
                    panno=?,
                    mobileno=?,
                    whatsappno=?,
                    email=?,
                    website=?,
                    contactperson=?,
                    address1=?,
                    address2=?,
                    city=?,
                    state=?,
                    country=?,
                    pincode=?,
                    isactive=?
                WHERE companyid=?
            `;

            db.query(
                sql,
                [
                    data.companycode,
                    data.companyname,
                    data.gstno,
                    data.panno,
                    data.mobileno,
                    data.whatsappno,
                    data.email,
                    data.website,
                    data.contactperson,
                    data.address1,
                    data.address2,
                    data.city,
                    data.state,
                    data.country,
                    data.pincode,
                    data.isactive,
                    id
                ],
                callback
            );

        }
    );
};



// DELETE COMPANY

exports.deleteCompany=(id,callback)=>{


    const sql="DELETE FROM company WHERE companyid=?";


    db.query(sql,[id],callback);


};