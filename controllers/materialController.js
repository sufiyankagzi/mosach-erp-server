const Material = require("../models/materialModel");


// GET ALL MATERIAL
exports.getAllMaterial = (req, res) => {

    Material.getAllMaterial((err, result) => {

        if (err) {
            console.error("GET ALL MATERIAL ERROR:", err);

            return res.status(500).json({
                message: err.message
            });
        }

        res.status(200).json(result);
    });
};


// GET SINGLE MATERIAL
exports.getMaterialById = (req, res) => {

    Material.getMaterialById(
        req.params.id,
        (err, result) => {

            if (err) {
                console.error("GET MATERIAL ERROR:", err);

                return res.status(500).json({
                    message: err.message
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Material not found"
                });
            }

            res.status(200).json(result[0]);
        }
    );
};


// CREATE MATERIAL
exports.addMaterial = (req, res) => {

    console.log("REQ.MATERIAL:", req.user);

    const data = {
        ...req.body
    };

    Material.createMaterial(
        data,
        (err, result) => {

            if (err) {

                if (
                    err.message === "Material already exists"
                ) {
                    return res.status(400).json({
                        message: err.message
                    });
                }

                console.error(
                    "CREATE MATERIAL ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            res.status(201).json({
                message: "Material created successfully",
                id: result.insertId
            });
        }
    );
};

// UPDATE MATERIAL
exports.editMaterial = (req, res) => {

    const data = {
        ...req.body
    };

    console.log(
        "UPDATE MATERIAL DATA:",
        data
    );

    Material.updateMaterial(
        req.params.id,
        data,
        (err, result) => {

            if (err) {

                if (
                    err.message === "Material already exists"
                ) {
                    return res.status(400).json({
                        message: err.message
                    });
                }

                console.error(
                    "UPDATE MATERIAL ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Material not found"
                });
            }

            res.status(200).json({
                message: "Material updated successfully"
            });
        }
    );
};


// DELETE MATERIAL
exports.deleteMaterial = (req, res) => {

    Material.deleteMaterial(
        req.params.id,
        (err, result) => {

            if (err) {
                console.error(
                    "DELETE MATERIAL ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Material not found"
                });
            }

            res.status(200).json({
                message: "Material deleted successfully"
            });
        }
    );
};