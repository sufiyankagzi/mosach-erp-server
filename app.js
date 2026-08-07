require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

require("./config/connectdb");

const createCompanyTable = require("./config/companyCreateTable");
const createUserTable = require("./config/userTable");

// Routes
const loginRoutes = require("./routes/loginRoutes");
const companyRoutes = require("./routes/companyRoutes");
const usersRoutes = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes");


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("MOSACH ERP Backend Running...");
});

// Routes
app.use("/api/login", loginRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/auth",authRoutes);

// Table Creation
createCompanyTable();
createUserTable();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});