const Gender = require("../models/genderModel");


// GET ALL GENDER
exports.getAllGender = (req, res) => {

    Gender.getAllGender((err, result) => {

        if (err) {
            console.error("GET ALL GENDER ERROR:", err);

            return res.status(500).json({
                message: err.message
            });
        }

        res.status(200).json(result);
    });
};


// GET SINGLE GENDER
exports.getGenderById = (req, res) => {

    Gender.getGenderById(
        req.params.id,
        (err, result) => {

            if (err) {
                console.error("GET GENDER ERROR:", err);

                return res.status(500).json({
                    message: err.message
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Gender not found"
                });
            }

            res.status(200).json(result[0]);
        }
    );
};


// CREATE GENDER
exports.addGender = (req, res) => {

    console.log("REQ.GENDER:", req.user);

    const data = {
        ...req.body
    };

    Gender.createGender(
        data,
        (err, result) => {

            if (err) {

                if (
                    err.message === "Gender already exists" ||
                    
                ) {
                    return res.status(400).json({
                        message: err.message
                    });
                }

                console.error(
                    "CREATE GENDER ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            res.status(201).json({
                message: "Gender created successfully",
                id: result.insertId
            });
        }
    );
};


// UPDATE GENDER
exports.editGender = (req, res) => {

    const data = {
        ...req.body
    };

    console.log(
        "UPDATE GENDER DATA:",
        data
    );

    Gender.updateGender(
        req.params.id,
        data,
        (err, result) => {

            if (err) {

                if (
                    err.message === "Gender already exists" ||
                    
                ) {
                    return res.status(400).json({
                        message: err.message
                    });
                }

                console.error(
                    "UPDATE GENDER ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Gender not found"
                });
            }

            res.status(200).json({
                message: "Gender updated successfully"
            });
        }
    );
};


// DELETE GENDER
exports.deleteGender = (req, res) => {

    Gender.deleteGender(
        req.params.id,
        (err, result) => {

            if (err) {
                console.error(
                    "DELETE GENDER ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Gender not found"
                });
            }

            res.status(200).json({
                message: "Gender deleted successfully"
            });
        }
    );
};