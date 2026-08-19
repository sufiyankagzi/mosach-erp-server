require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

// DATABASE
require("./config/connectdb");

const createCompanyTable = require("./config/companyCreateTable");
const createUserTable = require("./config/userTable");
const createSalesPersonTable = require("./config/salesPersonTable");
const createGenderTable = require("./config/genderTable")
const createGroupTable = require("./config/groupTable")
const createCategoryTable = require("./config/categoryTable")

// ROUTES

const loginRoutes = require("./routes/loginRoutes");
const companyRoutes = require("./routes/companyRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const salespersonRoutes = require("./routes/salespersonRoutes");
const genderRoutes = require("./routes/genderRoutes")
const categoryRoutes = require("./routes/categoryRoutes")

// CORS

const allowedOrigins = [
    "http://localhost:5173",
    "https://mosach-erp.netlify.app"
];

app.use(
    cors({
        origin: function (origin, callback) {

            // Thunder Client / Postman / server requests
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log("Blocked CORS Origin:", origin);

            return callback(
                new Error("Not allowed by CORS")
            );
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);

// BODY PARSER

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true
    })
);

// ROOT

app.get("/", (req, res) => {
    res.status(200).send(
        "MOSACH ERP Backend Running..."
    );
});

// API ROUTES

app.use("/api/login", loginRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/salesperson", salespersonRoutes )
app.use("/api/gender",genderRoutes);
app.use("/api/category",categoryRoutes)


// ========================================
// TABLE CREATION
// ========================================

createCompanyTable();
createUserTable();
createSalesPersonTable();
createGenderTable();
createGroupTable();
createCategoryTable();

// ERROR HANDLER

app.use((err, req, res, next) => {
    console.error("Server Error:", err.message);
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

// PORT

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(
        `MOSACH ERP Server running on port ${PORT}`
    );
});