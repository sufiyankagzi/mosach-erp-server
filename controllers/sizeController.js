const Size = require("../models/sizeModel");


// ========================================
// GET ALL SIZE
// ========================================


exports.getAllSize = (req, res) => {

    Size.getAllSize((err, result) => {

        if (err) {

            console.error("GET ALL SIZE ERROR:", err);

            return res.status(500).json({
                message: err.message
            });
        }

        res.status(200).json(result);
    });
};


// ========================================
// GET SINGLE SIZE
// ========================================
exports.getSizeById = (req, res) => {

    Size.getSizeById(
        req.params.id,
        (err, result) => {

            if (err) {

                console.error("GET SIZE ERROR:", err);

                return res.status(500).json({
                    message: err.message
                });
            }

            if (result.length === 0) {

                return res.status(404).json({
                    message: "Size not found"
                });
            }

            res.status(200).json(result[0]);
        }
    );
};


// ========================================
// CREATE SIZE
// ========================================
exports.addSize = (req, res) => {

    const data = {
        ...req.body
    };

    console.log("CREATE SIZE DATA:", data);

    Size.createSize(
        data,
        (err, result) => {

            if (err) {

                if (
                    err.message ===
                    "Size already exists in this size group"
                ) {

                    return res.status(400).json({
                        message: err.message
                    });
                }

                console.error(
                    "CREATE SIZE ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            res.status(201).json({
                message: "Size created successfully",
                id: result.insertId
            });
        }
    );
};


// ========================================
// UPDATE SIZE
// ========================================
exports.editSize = (req, res) => {

    const data = {
        ...req.body
    };

    console.log(
        "UPDATE SIZE DATA:",
        data
    );

    Size.updateSize(
        req.params.id,
        data,
        (err, result) => {

            if (err) {

                if (
                    err.message ===
                    "Size already exists in this size group"
                ) {

                    return res.status(400).json({
                        message: err.message
                    });
                }

                console.error(
                    "UPDATE SIZE ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Size not found"
                });
            }

            res.status(200).json({
                message: "Size updated successfully"
            });
        }
    );
};


// ========================================
// DELETE SIZE
// ========================================
exports.deleteSize = (req, res) => {

    Size.deleteSize(
        req.params.id,
        (err, result) => {

            if (err) {

                console.error(
                    "DELETE SIZE ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Size not found"
                });
            }

            res.status(200).json({
                message: "Size deleted successfully"
            });
        }
    );
};