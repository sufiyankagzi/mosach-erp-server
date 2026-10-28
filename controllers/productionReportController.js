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

            const dateCheck = new Date(
                Date.UTC(year, month - 1, day)
            );

            if (
                dateCheck.getUTCFullYear() !== year ||
                dateCheck.getUTCMonth() !== month - 1 ||
                dateCheck.getUTCDate() !== day
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

            const dateCheck = new Date(
                Date.UTC(year, month - 1, day)
            );

            if (
                dateCheck.getUTCFullYear() !== year ||
                dateCheck.getUTCMonth() !== month - 1 ||
                dateCheck.getUTCDate() !== day
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
    if (value === null || value === undefined) {
        return null;
    }

    const text = String(value).trim();

    return text === "" ? null : text;
};

// ======================================================
// HELPER: CONVERT INTEGER VALUES
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
// HELPER: CONVERT DECIMAL VALUES
// ======================================================

const decimalValue = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    const number = Number(value);

    return Number.isFinite(number) && number >= 0
        ? number
        : 0;
};

// ======================================================
// HELPER: CALCULATE CARTONS
// Carton = Pair / Packing
// ======================================================

const calculateCarton = (pair, packing) => {
    if (packing <= 0 || pair <= 0) {
        return 0;
    }

    return Number((pair / packing).toFixed(2));
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

        // CHECK FILE EXTENSION
        const originalName = req.file.originalname || "";

        if (!/\.(xlsx|xls)$/i.test(originalName)) {
            return res.status(400).json({
                success: false,
                message: "Only .xlsx and .xls files are allowed."
            });
        }

        // READ EXCEL
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

        const worksheet =
            workbook.Sheets[workbook.SheetNames[0]];

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

            ASSUMED COLUMN INDEXES:

            0  = SKU
            1  = Date
            2  = JOB CARD
            3  = Article
            4  = COLOUR
            5  = Size
            6  = Pair
            7  = Packing             NEW
            8  = Cutting Received Date
            9  = Cutting Contractor
            10 = Upper Contractor
            11 = Upper Issue Date
            12 = Upper Received Date
            13 = Upper Received Pair
            14 = Upper/Insole Contractor
            15 = Upper/Insole Issued Date
            16 = Upper Store Received Date
            17 = Upper Store Pair Qty
            18 = Upper Store Status
            19 = Machine No.
            20 = Machine Issue Date
            21 = Machine Pair Qty
            22 = 1st Pair
            23 = 2nd Pair
            24 = Rejection
            25 = Total Pair
        */

        if (excelRows.length < 3) {
            return res.status(400).json({
                success: false,
                message:
                    "Excel file does not contain production records."
            });
        }

        const dataRows = excelRows.slice(2);

        const uploadBatchId = crypto.randomUUID();

        const productionRows = [];

        let skippedRows = 0;
        let invalidJobCardRows = 0;

        // MAP EXCEL COLUMNS TO DATABASE FIELDS
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

            // PAIR
            const pair = numberValue(row[6]);

            // PACKING
            const packing = numberValue(row[7]);

            // CARTON CALCULATION
            const carton = calculateCarton(pair, packing);

            const production = {
                sku: textValue(row[0]),

                reportdate:
                    convertExcelDate(row[1]),

                jobcard:
                    textValue(row[2]),

                article:
                    textValue(row[3]),

                colour:
                    textValue(row[4]),

                size:
                    textValue(row[5]),

                pair,

                // NEW FIELDS
                packing,
                carton,

                cuttingreceiveddate:
                    convertExcelDate(row[8]),

                cuttingcontractor:
                    textValue(row[9]),

                uppercontractor:
                    textValue(row[10]),

                upperissuedate:
                    convertExcelDate(row[11]),

                upperreceiveddate:
                    convertExcelDate(row[12]),

                upperreceivedpair:
                    numberValue(row[13]),

                upperinsolecontractor:
                    textValue(row[14]),

                upperinsoleissueddate:
                    convertExcelDate(row[15]),

                upperstorereceiveddate:
                    convertExcelDate(row[16]),

                upperstorepairqty:
                    numberValue(row[17]),

                upperstorestatus:
                    textValue(row[18]),

                machineno:
                    textValue(row[19]),

                machineissuedate:
                    convertExcelDate(row[20]),

                machinepairqty:
                    numberValue(row[21]),

                firstpair:
                    numberValue(row[22]),

                secondpair:
                    numberValue(row[23]),

                rejection:
                    numberValue(row[24]),

                totalpair:
                    numberValue(row[25]),

                uploadbatchid: uploadBatchId
            };

            // JOB CARD IS REQUIRED
            if (!production.jobcard) {
                invalidJobCardRows++;
                continue;
            }

            // Warn if Pair is present but Packing is missing
            if (pair > 0 && packing <= 0) {
                console.warn(
                    `Packing is missing or invalid for Job Card: ${production.jobcard}`
                );
            }

            productionRows.push(production);
        }

        // CHECK VALID RECORDS
        if (!productionRows.length) {
            return res.status(400).json({
                success: false,
                message:
                    "No valid production rows found. Please check Job Card No. in Excel.",
                data: {
                    totalRowsRead: dataRows.length,
                    skippedRows,
                    invalidJobCardRows
                }
            });
        }

        // INSERT / UPDATE DATABASE
        const result = await insertProductionRows(
            productionRows
        );

        // RESPONSE
        return res.status(200).json({
            success: true,

            message:
                "Production Excel uploaded successfully.",

            data: {
                fileName: originalName,
                uploadBatchId,
                totalRowsRead: dataRows.length,

                insertedRows: result.insertedRows ?? 0,
                updatedRows: result.updatedRows ?? 0,
                unchangedRows: result.unchangedRows ?? 0,

                skippedRows,
                invalidJobCardRows,

                uploadedRows: productionRows.map(
                    ({ uploadbatchid, ...row }) => row
                )
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