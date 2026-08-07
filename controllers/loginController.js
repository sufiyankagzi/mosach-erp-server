const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Login = require("../models/loginModel");

exports.loginUser = (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and Password are required"
        });
    }

    Login.getUserByUsername(username, async (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(401).json({
                message: "Invalid Username or Password"
            });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Username or Password"
            });
        }

        const token = jwt.sign(
            {
                userid: user.userid,
                companyid: user.companyid,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        res.json({
            message: "Login Successful",
            token,
            user: {
                userid: user.userid,
                companyid: user.companyid,
                username: user.username,
                fullname: user.fullname,
                role: user.role
            }
        });

    });

};