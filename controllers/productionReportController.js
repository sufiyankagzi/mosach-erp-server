const XLSX = require("xlsx");
const crypto = require("crypto");

const {
    insertProductionRows,
    getProductionReport,
    getProductionSummary
} = require("../models/productionReportModel");


// ======================================================
// HELPER: CONVERT EXCEL DATE TO MYSQL DATE
// ======================================================

const convertExcelDate = (value) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    let date;

    if (value instanceof Date) {
        date = value;
    } else if (typeof value === "number") {

        // Excel serial date
        const parsed = XLSX.SSF.parse_date_code(value);

        if (!parsed) {
            return null;
        }

        date = new Date(
            Date.UTC(
                parsed.y,
                parsed.m - 1,
                parsed.d
            )
        );

    } else if (typeof value === "string") {

        const text = value.trim();

        if (!text) {
            return null;
        }

        // YYYY-MM-DD
        let match = text.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );

        if (match) {

            const year = Number(match[1]);
            const month = Number(match[2]);
            const day = Number(match[3]);

            if (
                month < 1 ||
                month > 12 ||
                day < 1 ||
                day > 31
            ) {
                return null;
            }

            return [
                year,
                String(month).padStart(2, "0"),
                String(day).padStart(2, "0")
            ].join("-");
        }

        // DD/MM/YYYY or DD-MM-YYYY
        match = text.match(
            /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
        );

        if (match) {

            const day = Number(match[1]);
            const month = Number(match[2]);
            const year = Number(match[3]);

            if (
                month < 1 ||
                month > 12 ||
                day < 1 ||
                day > 31
            ) {
                return null;
            }

            return [
                year,
                String(month).padStart(2, "0"),
                String(day).padStart(2, "0")
            ].join("-");
        }

        return null;

    } else {
        return null;
    }

    if (isNaN(date.getTime())) {
        return null;
    }

    return [
        date.getUTCFullYear(),
        String(date.getUTCMonth() + 1).padStart(2, "0"),
        String(date.getUTCDate()).padStart(2, "0")
    ].join("-");
};


// ======================================================
// HELPER: CONVERT TEXT VALUES
// ======================================================

const textValue = (value) => {

    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    const text = String(value).trim();

    return text === "" ? null : text;
};


// ======================================================
// HELPER: CONVERT NUMERIC VALUES
// ======================================================

const numberValue = (value) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.trunc(number);
};


// ======================================================
// 1. UPLOAD PRODUCTION EXCEL
// POST /api/production-report/upload
// ======================================================

const uploadProductionExcel = async (req, res) => {

    try {

        // CHECK FILE
        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "Please select an Excel file."
            });

        }

        // CHECK EXTENSION
        const originalName = req.file.originalname || "";

        if (!/\.(xlsx|xls)$/i.test(originalName)) {

            return res.status(400).json({
                success: false,
                message: "Only .xlsx and .xls files are allowed."
            });

        }

        // READ EXCEL FROM MEMORY BUFFER
        const workbook = XLSX.read(
            req.file.buffer,
            {
                type: "buffer",
                cellDates: true
            }
        );

        if (!workbook.SheetNames.length) {

            return res.status(400).json({
                success: false,
                message: "Excel file has no worksheet."
            });

        }

        // FIRST WORKSHEET
        const worksheet =
            workbook.Sheets[workbook.SheetNames[0]];

        // READ ROWS AS ARRAYS
        const excelRows = XLSX.utils.sheet_to_json(
            worksheet,
            {
                header: 1,
                defval: null,
                raw: true,
                blankrows: false
            }
        );

        /*
            ROW 1: SUMMARY
            ROW 2: COLUMN HEADINGS
            ROW 3 ONWARDS: PRODUCTION DATA
        */

        if (excelRows.length < 3) {

            return res.status(400).json({
                success: false,
                message: "Excel file does not contain production records."
            });

        }

        const dataRows = excelRows.slice(2);

        const uploadBatchId = crypto.randomUUID();

        const productionRows = [];

        let skippedRows = 0;

        // ==================================================
        // MAP EXCEL COLUMNS TO DATABASE FIELDS
        // ==================================================

        for (const row of dataRows) {

            // Skip completely empty rows
            if (
                !row ||
                row.every(
                    value =>
                        value === null ||
                        value === undefined ||
                        String(value).trim() === ""
                )
            ) {
                skippedRows++;
                continue;
            }

            /*
                EXCEL COLUMN INDEXES

                0  = SKU
                1  = Date
                2  = JOB CARD
                3  = Article
                4  = COLOUR
                5  = Size
                6  = Pair
                7  = Cutting Received Date
                8  = Cutting Contractor
                9  = Upper Contractor
                10 = Upper Issue Date
                11 = Upper Received Date
                12 = Upper Received Pair
                13 = Upper/Insole Contractor
                14 = Upper/Insole Issued Date
                15 = Upper Store Received Date
                16 = Upper Store Pair Qty
                17 = Upper Store Status
                18 = Machine No.
                19 = Machine Issue Date
                20 = Machine Pair Qty
                21 = 1st Pair
                22 = 2nd Pair
                23 = Rejection
                24 = Total Pair
            */

            const production = {

                sku: textValue(row[0]),

                reportdate: convertExcelDate(row[1]),

                jobcard: textValue(row[2]),

                article: textValue(row[3]),

                colour: textValue(row[4]),

                size: textValue(row[5]),

                pair: numberValue(row[6]),

                cuttingreceiveddate:
                    convertExcelDate(row[7]),

                cuttingcontractor:
                    textValue(row[8]),

                uppercontractor:
                    textValue(row[9]),

                upperissuedate:
                    convertExcelDate(row[10]),

                upperreceiveddate:
                    convertExcelDate(row[11]),

                upperreceivedpair:
                    numberValue(row[12]),

                upperinsolecontractor:
                    textValue(row[13]),

                upperinsoleissueddate:
                    convertExcelDate(row[14]),

                upperstorereceiveddate:
                    convertExcelDate(row[15]),

                upperstorepairqty:
                    numberValue(row[16]),

                upperstorestatus:
                    textValue(row[17]),

                machineno:
                    textValue(row[18]),

                machineissuedate:
                    convertExcelDate(row[19]),

                machinepairqty:
                    numberValue(row[20]),

                firstpair:
                    numberValue(row[21]),

                secondpair:
                    numberValue(row[22]),

                rejection:
                    numberValue(row[23]),

                totalpair:
                    numberValue(row[24]),

                uploadbatchid: uploadBatchId

            };

            productionRows.push(production);

        }

        // CHECK PRODUCTION RECORDS
        if (!productionRows.length) {

            return res.status(400).json({
                success: false,
                message: "No valid production rows found in Excel."
            });

        }

        // INSERT INTO DATABASE
        const result = await insertProductionRows(
            productionRows
        );

        return res.status(200).json({

            success: true,

            message: "Production Excel uploaded successfully.",

            data: {

                fileName: originalName,

                uploadBatchId,

                totalRowsRead: dataRows.length,

                insertedRows: result.insertedRows,
updatedRows: result.updatedRows,

                skippedRows

            }

        });

    } catch (error) {

        console.error(
            "Upload Production Excel Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to upload production Excel.",

            error: error.message

        });

    }

};


// ======================================================
// 2. GET PRODUCTION REPORT
// GET /api/production-report
// ======================================================

const fetchProductionReport = async (req, res) => {

    try {

        const filters = {

            fromDate: req.query.fromDate,

            toDate: req.query.toDate,

            article: req.query.article,

            jobcard: req.query.jobcard,

            sku: req.query.sku

        };

        const data = await getProductionReport(filters);

        return res.status(200).json({

            success: true,

            count: data.length,

            data

        });

    } catch (error) {

        console.error(
            "Fetch Production Report Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to fetch production report."

        });

    }

};


// ======================================================
// 3. GET PRODUCTION DASHBOARD SUMMARY
// GET /api/production-report/summary
// ======================================================

const fetchProductionSummary = async (req, res) => {

    try {

        const filters = {

            fromDate: req.query.fromDate,

            toDate: req.query.toDate

        };

        const data = await getProductionSummary(filters);

        return res.status(200).json({

            success: true,

            data

        });

    } catch (error) {

        console.error(
            "Fetch Production Summary Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to fetch production summary."

        });

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    uploadProductionExcel,

    fetchProductionReport,

    fetchProductionSummary

};