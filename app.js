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
const createColorTable = require("./config/colorTable")
const createSizeGroupTable = require("./config/sizeGroupTable")
const createSizeTable = require("./config/sizeTable")
const {createArticleMasterTable, createArticleVariantTable, createArticleImagesTable} = require("./config/articleTable");
const createOrderTables = require("./config/orderTable");
// ROUTES

const loginRoutes = require("./routes/loginRoutes");
const companyRoutes = require("./routes/companyRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const salespersonRoutes = require("./routes/salespersonRoutes");
const genderRoutes = require("./routes/genderRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const colorRoutes = require("./routes/colorRoutes")
const sizeGroupRoutes = require("./routes/sizeGroupRoutes")
const sizeRoutes = require("./routes/sizeRoutes")
const articleRoutes = require("./routes/articleRoutes")
const orderRoutes = require("./routes/orderRoutes")
const orderReportRoutes = require("./routes/orderReportRoutes");


// CORS

const allowedOrigins = [
    "http://localhost:5173",
    "https://mosach-erp.netlify.app"
];

const path = require("path");


app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);
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
app.use("/api/color",colorRoutes)
app.use("/api/sizegroup",sizeGroupRoutes)
app.use("/api/size",sizeRoutes)
app.use("/api/article",articleRoutes)
app.use("/api/order",orderRoutes)
// REPORTS API
app.use("/api/order/report", orderReportRoutes);

// ========================================
// TABLE CREATION
// ========================================

createCompanyTable();
createUserTable();
createSalesPersonTable();
createGenderTable();
createGroupTable();
createCategoryTable();
createColorTable();
createSizeGroupTable();
createSizeTable();
createArticleMasterTable();
createArticleImagesTable();
createArticleVariantTable();
createOrderTables();

// ERROR HANDLER  abc

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