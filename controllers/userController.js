const User = require("../models/userModel");

// GET ALL USERS
exports.getUsers = (req, res) => {
    User.getAllUsers((err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);
    });
};

// GET SINGLE USER
exports.getUser = (req, res) => {
    User.getUserById(req.params.id, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(result[0]);
    });
};

// CREATE USER
// CREATE USER
exports.addUser = (req, res) => {

    console.log("REQ.USER:", req.user);
    console.log("COMPANY ID:", req.user?.companyid);

    const data = {
        ...req.body,
        companyid: req.user?.companyid
    };

    console.log("CREATE USER DATA:", data);

    User.createUser(data, (err, result) => {

        if (err) {

            if (
                err.message === "Username already exists" ||
                err.message === "Mobile No. already exists"
            ) {
                return res.status(400).json({
                    message: err.message
                });
            }

            console.error("CREATE USER ERROR:", err);

            return res.status(500).json({
                message: err.message,
                code: err.code
            });
        }

        res.status(201).json({
            message: "User created successfully",
            id: result.insertId
        });
    });
};
// UPDATE USER
exports.editUser = (req, res) => {
    User.updateUser(req.params.id, req.body, (err, result) => {

        if (err) {

            if (
                err.message === "Username already exists" ||
                err.message === "Mobile No. already exists"
            ) {
                return res.status(400).json({
                    message: err.message
                });
            }

            return res.status(500).json(err);
        }

        res.json({
            message: "User updated successfully"
        });
    });
};

// DELETE USER
exports.deleteUser = (req, res) => {
    User.deleteUser(req.params.id, (err) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            message: "User deleted successfully"
        });
    });
};