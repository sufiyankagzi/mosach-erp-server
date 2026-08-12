const db = require("../config/connectdb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


// ==============================
// LOGIN
// ==============================
exports.login = async (req, res) => {

    const { username, password } = req.body;

    const sql = `
        SELECT * FROM users 
        WHERE username = ?
    `;

    db.query(sql, [username], async (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        const user = result[0];

        // PASSWORD CHECK
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Password"
            });
        }

        // CREATE TOKEN
        const token = jwt.sign(
            {
                userid: user.userid,
                companyid: user.companyid,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login Successful",
            token,
            user: {
                userid: user.userid,
                username: user.username,
                role: user.role,
                companyid: user.companyid
            }
        });

    });
};


// ==============================
// SETUP ADMIN
// ==============================
exports.setupAdmin = async (req, res) => {

    try {

        // Get first company
        const [companies] = await db.promise().query(
            "SELECT companyid FROM company ORDER BY companyid LIMIT 1"
        );

        if (companies.length === 0) {
            return res.status(400).json({
                message: "Please create a company first"
            });
        }

        const companyid = companies[0].companyid;


        // Check existing users
        const [users] = await db.promise().query(
            "SELECT COUNT(*) AS count FROM users"
        );

        if (users[0].count > 0) {
            return res.status(403).json({
                message: "Admin already initialized"
            });
        }


        // Hash password
        const hashedPassword = await bcrypt.hash(
            "admin123",
            10
        );


        // Create Admin
        await db.promise().query(
            `INSERT INTO users
            (companyid, username, fullname, mobileno, password, role, isactive)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                companyid,
                "admin",
                "Administrator",
                "9999999999",
                hashedPassword,
                "ADMIN",
                1
            ]
        );


        res.status(201).json({
            message: "Admin created successfully",
            username: "admin",
            companyid: companyid
        });

    } catch (error) {

        console.error("Setup Admin Error:", error);

        res.status(500).json({
            message: "Failed to create admin"
        });
    }
};