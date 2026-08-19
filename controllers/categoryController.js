const Category = require("../models/categoryModel");


// GET ALL CATEGORY
exports.getAllCategory = (req, res) => {

    Category.getAllCategory((err, result) => {

        if (err) {
            console.error("GET ALL CATEGORY ERROR:", err);

            return res.status(500).json({
                message: err.message
            });
        }

        res.status(200).json(result);
    });
};


// GET SINGLE CATEGORY
exports.getCategoryById = (req, res) => {

    Category.getCategoryById(
        req.params.id,
        (err, result) => {

            if (err) {
                console.error("GET CATEGORY ERROR:", err);

                return res.status(500).json({
                    message: err.message
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Category not found"
                });
            }

            res.status(200).json(result[0]);
        }
    );
};


// CREATE CATEGORY
exports.addCategory = (req, res) => {

    console.log("REQ.CATEGORY:", req.user);

    const data = {
        ...req.body
    };

    Category.createCategory(
        data,
        (err, result) => {

            if (err) {

                if (
                    err.message === "Category already exists"
                ) {
                    return res.status(400).json({
                        message: err.message
                    });
                }

                console.error(
                    "CREATE CATEGORY ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            res.status(201).json({
                message: "Category created successfully",
                id: result.insertId
            });
        }
    );
};

// UPDATE CATEGORY
exports.editCategory = (req, res) => {

    const data = {
        ...req.body
    };

    console.log(
        "UPDATE CATEGORY DATA:",
        data
    );

    Category.updateCategory(
        req.params.id,
        data,
        (err, result) => {

            if (err) {

                if (
                    err.message === "Category already exists"
                ) {
                    return res.status(400).json({
                        message: err.message
                    });
                }

                console.error(
                    "UPDATE CATEGORY ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Category not found"
                });
            }

            res.status(200).json({
                message: "Category updated successfully"
            });
        }
    );
};


// DELETE CATEGORY
exports.deleteCategory = (req, res) => {

    Category.deleteCategory(
        req.params.id,
        (err, result) => {

            if (err) {
                console.error(
                    "DELETE CATEGORY ERROR:",
                    err
                );

                return res.status(500).json({
                    message: err.message,
                    code: err.code
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Category not found"
                });
            }

            res.status(200).json({
                message: "Category deleted successfully"
            });
        }
    );
};