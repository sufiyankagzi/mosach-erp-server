const SalesPerson = require("../models/salespersonModel");


// GET ALL SALES PERSON
exports.getAllSalesPerson = (req, res) => {

    SalesPerson.getAllSalesPerson((err, result) => {

        if (err) {
            console.error("GET ALL SALES PERSON ERROR:", err);

            return res.status(500).json({
                message: err.message
            });
        }

        res.status(200).json(result);
    });
};


// GET SINGLE SALES PERSON
exports.getSalesPersonById = (req, res) => {

    SalesPerson.getSalesPersonById(
        req.params.id,
        (err, result) => {

            if (err) {
                console.error("GET SALES PERSON ERROR:", err);

                return res.status(500).json({
                    message: err.message
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Sales person not found"
                });
            }

            res.status(200).json(result[0]);
        }
    );
};


// CREATE SALES PERSON
exports.addSalesPerson = (req, res) => {

    console.log("REQ.SALES PERSON:", req.user);

    const data = {
        ...req.body
    };

    SalesPerson.createSalesPerson(
        data,
        (err, result) => {

            if (err) {

                if (
                    err.message === "Sales Person already exists" ||
                    err.message === "Sales person already exists" ||
                    err.message === "Mobile No. already exists"
                ) {
                    return res.status(400).json({
                        message: err.message
                    });
                }

                console.error(
                    "CREATE SALES PERSON ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            res.status(201).json({
                message: "Sales person created successfully",
                id: result.insertId
            });
        }
    );
};


// UPDATE SALES PERSON
exports.editSalesPerson = (req, res) => {

    const data = {
        ...req.body
    };

    console.log(
        "UPDATE SALES PERSON DATA:",
        data
    );

    SalesPerson.updateSalesPerson(
        req.params.id,
        data,
        (err, result) => {

            if (err) {

                if (
                    err.message === "Sales Person already exists" ||
                    err.message === "Sales person already exists" ||
                    err.message === "Mobile No. already exists"
                ) {
                    return res.status(400).json({
                        message: err.message
                    });
                }

                console.error(
                    "UPDATE SALES PERSON ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Sales person not found"
                });
            }

            res.status(200).json({
                message: "Sales person updated successfully"
            });
        }
    );
};


// DELETE SALES PERSON
exports.deleteSalesPerson = (req, res) => {

    SalesPerson.deleteSalesPerson(
        req.params.id,
        (err, result) => {

            if (err) {
                console.error(
                    "DELETE SALES PERSON ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Sales person not found"
                });
            }

            res.status(200).json({
                message: "Sales person deleted successfully"
            });
        }
    );
};