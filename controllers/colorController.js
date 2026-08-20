const Color = require("../models/colorModel");


// GET ALL COLOR
exports.getAllColor = (req, res) => {

    Color.getAllColor((err, result) => {

        if (err) {
            console.error("GET ALL COLOR ERROR:", err);

            return res.status(500).json({
                message: err.message
            });
        }

        res.status(200).json(result);
    });
};


// GET SINGLE COLOR
exports.getColorById = (req, res) => {

    Color.getColorById(
        req.params.id,
        (err, result) => {

            if (err) {
                console.error("GET COLOR ERROR:", err);

                return res.status(500).json({
                    message: err.message
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Color not found"
                });
            }

            res.status(200).json(result[0]);
        }
    );
};


// CREATE COLOR
exports.addColor = (req, res) => {

    console.log("REQ.COLOR:", req.user);

    const data = {
        ...req.body
    };

    Color.createColor(
        data,
        (err, result) => {

            if (err) {

                if (
                    err.message === "Color already exists"
                ) {
                    return res.status(400).json({
                        message: err.message
                    });
                }

                console.error(
                    "CREATE COLOR ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            res.status(201).json({
                message: "Color created successfully",
                id: result.insertId
            });
        }
    );
};

// UPDATE COLOR
exports.editColor = (req, res) => {

    const data = {
        ...req.body
    };

    console.log(
        "UPDATE COLOR DATA:",
        data
    );

    Color.updateColor(
        req.params.id,
        data,
        (err, result) => {

            if (err) {

                if (
                    err.message === "Color already exists"
                ) {
                    return res.status(400).json({
                        message: err.message
                    });
                }

                console.error(
                    "UPDATE COLOR ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Color not found"
                });
            }

            res.status(200).json({
                message: "Color updated successfully"
            });
        }
    );
};


// DELETE COLOR
exports.deleteColor = (req, res) => {

    Color.deleteColor(
        req.params.id,
        (err, result) => {

            if (err) {
                console.error(
                    "DELETE COLOR ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Color not found"
                });
            }

            res.status(200).json({
                message: "Color deleted successfully"
            });
        }
    );
};