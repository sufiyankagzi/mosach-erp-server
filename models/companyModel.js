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

};



// UPDATE COMPANY
exports.updateCompany = (id,data,callback)=>{


    const sql=`
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


};



// DELETE COMPANY

exports.deleteCompany=(id,callback)=>{


    const sql="DELETE FROM company WHERE companyid=?";


    db.query(sql,[id],callback);


};