const SizeGroup = require("../models/sizeGroupModel");


// GET ALL SIZE GROUP
exports.getAllSizeGroup = (req, res) => {

    SizeGroup.getAllSizeGroup((err, result) => {

        if (err) {
            console.error("GET ALL SIZE GROUP ERROR:", err);

            return res.status(500).json({
                message: err.message
            });
        }

        res.status(200).json(result);
    });
};


// GET SINGLE SIZE GROUP
exports.getSizeGroupById = (req, res) => {

    SizeGroup.getSizeGroupById(
        req.params.id,
        (err, result) => {

            if (err) {
                console.error("GET SIZE GROUP ERROR:", err);

                return res.status(500).json({
                    message: err.message
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Size group not found"
                });
            }

            res.status(200).json(result[0]);
        }
    );
};


// CREATE SIZE GROUP
exports.addSizeGroup = (req, res) => {

    console.log("REQ.SIZE GROUP:", req.user);

    const data = {
        ...req.body
    };

    SizeGroup.createSizeGroup(
        data,
        (err, result) => {

            if (err) {

                if (
                    err.message === "Size group already exists"
                ) {
                    return res.status(400).json({
                        message: err.message
                    });
                }

                console.error(
                    "CREATE SIZE GROUP ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            res.status(201).json({
                message: "Size group created successfully",
                id: result.insertId
            });
        }
    );
};

// UPDATE SIZE GROUP
exports.editSizeGroup = (req, res) => {

    const data = {
        ...req.body
    };

    console.log(
        "UPDATE SIZE GROUP DATA:",
        data
    );

    SizeGroup.updateSizeGroup(
        req.params.id,
        data,
        (err, result) => {

            if (err) {

                if (
                    err.message === "Size group already exists"
                ) {
                    return res.status(400).json({
                        message: err.message
                    });
                }

                console.error(
                    "UPDATE SIZE GROUP ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Size group not found"
                });
            }

            res.status(200).json({
                message: "Size group updated successfully"
            });
        }
    );
};


// DELETE SIZE GROUP
exports.deleteSizeGroup = (req, res) => {

    SizeGroup.deleteSizeGroup(
        req.params.id,
        (err, result) => {

            if (err) {
                console.error(
                    "DELETE SIZE GROUP ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Size group not found"
                });
            }

            res.status(200).json({
                message: "Size group deleted successfully"
            });
        }
    );
};