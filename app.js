require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
// const db = require("./config/db");
require("./config/connectdb");
const createCompanyTable = require("./config/companyCreateTable");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("MOSACH ERP Backend Running...");
});

createCompanyTable();
const PORT = process.env.PORT || 5000;


// COMPANY ROUTE
const companyRoutes=require("./routes/companyRoutes");
app.use("/api/company",companyRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});