
const XLSX = require("xlsx");
const crypto = require("crypto");

const {
    insertProductionRows,
    getProductionReport,
    getProductionSummary,
} = require("../models/productionReportModel");

// ======================================================
// HELPER: NORMALIZE COLUMN HEADINGS
// ======================================================

const normalizeHeader = (value) => {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[\r\n]+/g, " ")
        .replace(/[^a-z0-9]/g, "");
};

// ======================================================
// HELPER: GET VALUE USING MULTIPLE POSSIBLE HEADINGS
// ======================================================

const getColumnValue = (row, headerMap, aliases) => {
    for (const alias of aliases) {
        const key = normalizeHeader(alias);

        if (headerMap.has(key)) {
            const index = headerMap.get(key);
            return row[index];
        }
    }

    return null;
};

// ======================================================
// HELPER: CONVERT TEXT
// ======================================================

const textValue = (value) => {
    if (value === null || value === undefined) {
        return null;
    }

    const text = String(value).trim();

    return text === "" ? null : text;
};

// ======================================================
// HELPER: CONVERT NUMBER
// ======================================================

const numberValue = (value) => {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return 0;
    }

    if (typeof value === "string") {
        value = value.replace(/,/g, "").trim();
    }

    const number = Number(value);

    return Number.isFinite(number) ? Math.trunc(number) : 0;
};

// ======================================================
// HELPER: CONVERT DECIMAL
// ======================================================

const decimalValue = (value) => {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return 0;
    }

    if (typeof value === "string") {
        value = value.replace(/,/g, "").trim();
    }

    const number = Number(value);

    return Number.isFinite(number) && number >= 0
        ? number
        : 0;
};

// ======================================================
// HELPER: CONVERT EXCEL DATE TO MYSQL DATE
// Output: YYYY-MM-DD
// ======================================================

const convertExcelDate = (value) => {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return null;
    }

    // Excel cell may already be a JavaScript Date.
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            return null;
        }

        return [
            value.getFullYear(),
            String(value.getMonth() + 1).padStart(2, "0"),
            String(value.getDate()).padStart(2, "0"),
        ].join("-");
    }

    // Excel serial date.
    if (typeof value === "number") {
        const parsed = XLSX.SSF.parse_date_code(value);

        if (!parsed) {
            return null;
        }

        return [
            parsed.y,
            String(parsed.m).padStart(2, "0"),
            String(parsed.d).padStart(2, "0"),
        ].join("-");
    }

    if (typeof value !== "string") {
        return null;
    }

    const text = value.trim();

    // YYYY-MM-DD or YYYY-MM-DD HH:mm:ss
    let match = text.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s.*)?$/
    );

    if (match) {
        return validateDate(
            Number(match[1]),
            Number(match[2]),
            Number(match[3])
        );
    }

    // DD/MM/YYYY or DD-MM-YYYY
    match = text.match(
        /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
    );

    if (match) {
        return validateDate(
            Number(match[3]),
            Number(match[2]),
            Number(match[1])
        );
    }

    return null;
};

// ======================================================
// HELPER: VALIDATE DATE
// ======================================================

const validateDate = (year, month, day) => {
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return [
        year,
        String(month).padStart(2, "0"),
        String(day).padStart(2, "0"),
    ].join("-");
};

// ======================================================
// HELPER: CALCULATE CARTON
// Carton = Pair / Packing
// ======================================================

const calculateCarton = (pair, packing) => {
    if (pair <= 0 || packing <= 0) {
        return 0;
    }

    return Number((pair / packing).toFixed(2));
};

// ======================================================
// HELPER: FIND HEADER ROW
// Searches the first 20 rows.
// ======================================================

const findHeaderRow = (excelRows) => {
    const jobCardAliases = [
        "jobcard",
        "job card",
        "job card no",
        "jobcard no",
        "job card number",
    ];

    const articleAliases = [
        "article",
        "article name",
        "article no",
        "articleno",
    ];

    for (
        let rowIndex = 0;
        rowIndex < Math.min(excelRows.length, 20);
        rowIndex++
    ) {
        const row = excelRows[rowIndex] || [];

        const headers = row.map(normalizeHeader);

        const hasJobCard = jobCardAliases.some((alias) =>
            headers.includes(normalizeHeader(alias))
        );

        const hasArticle = articleAliases.some((alias) =>
            headers.includes(normalizeHeader(alias))
        );

        if (hasJobCard && hasArticle) {
            const headerMap = new Map();

            headers.forEach((header, index) => {
                if (header && !headerMap.has(header)) {
                    headerMap.set(header, index);
                }
            });

            return {
                headerRowIndex: rowIndex,
                headerMap,
            };
        }
    }

    return null;
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
                message: "Please select an Excel file.",
            });
        }

        // CHECK EXTENSION
        const originalName = req.file.originalname || "";

        if (!/\.(xlsx|xls)$/i.test(originalName)) {
            return res.status(400).json({
                success: false,
                message: "Only .xlsx and .xls files are allowed.",
            });
        }

        // READ EXCEL
        const workbook = XLSX.read(req.file.buffer, {
            type: "buffer",
            cellDates: true,
        });

        if (!workbook.SheetNames.length) {
            return res.status(400).json({
                success: false,
                message: "Excel file has no worksheet.",
            });
        }

        const worksheet =
            workbook.Sheets[workbook.SheetNames[0]];

        const excelRows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,
            raw: true,
            blankrows: false,
        });

        if (!excelRows.length) {
            return res.status(400).json({
                success: false,
                message: "Excel worksheet is empty.",
            });
        }

        // FIND HEADERS
        const headerResult = findHeaderRow(excelRows);

        if (!headerResult) {
            return res.status(400).json({
                success: false,
                message:
                    "Job Card and Article headings were not found in the first 20 rows.",
            });
        }

        const { headerRowIndex, headerMap } = headerResult;

        const dataRows = excelRows.slice(headerRowIndex + 1);

        const uploadBatchId = crypto.randomUUID();

        const productionRows = [];

        let skippedRows = 0;
        let invalidJobCardRows = 0;

        // ==================================================
        // PROCESS EXCEL ROWS
        // ==================================================

        for (const row of dataRows) {
            if (!row || !row.some(
                (value) =>
                    value !== null &&
                    value !== undefined &&
                    String(value).trim() !== ""
            )) {
                skippedRows++;
                continue;
            }

            const read = (...aliases) =>
                getColumnValue(row, headerMap, aliases);

            const pair = numberValue(
                read("Pair", "Pairs", "Pair Qty", "Pair Quantity")
            );

            const packing = numberValue(
                read("Packing", "Packing Qty", "Pairs Per Carton")
            );

            const excelCarton = read(
                "Carton",
                "Cartons",
                "Carton Qty",
                "Carton Quantity"
            );

            // Use Excel Carton if provided; otherwise calculate.
            const carton =
                excelCarton !== null &&
                excelCarton !== undefined &&
                String(excelCarton).trim() !== ""
                    ? decimalValue(excelCarton)
                    : calculateCarton(pair, packing);

            const production = {
                sku: textValue(read("SKU", "SKU No", "Sku Number")),

                reportdate: convertExcelDate(
                    read("Date", "Report Date", "Production Date")
                ),

                jobcard: textValue(
                    read(
                        "JOB CARD",
                        "Job Card",
                        "Job Card No",
                        "Job Card Number",
                        "Jobcard No"
                    )
                ),

                article: textValue(
                    read("Article", "Article Name", "Article No")
                ),

                colour: textValue(
                    read("COLOUR", "Color", "Colour Name")
                ),

                size: textValue(
                    read("Size", "Size Name")
                ),

                pair,

                packing,
                carton,

                cuttingreceiveddate: convertExcelDate(
                    read(
                        "Cutting Received Date",
                        "Cutting Receive Date"
                    )
                ),

                cuttingcontractor: textValue(
                    read("Cutting Contractor", "Cutting Contractor Name")
                ),

                uppercontractor: textValue(
                    read("Upper Contractor", "Upper Contractor Name")
                ),

                upperissuedate: convertExcelDate(
                    read("Upper Issue Date", "Upper Issued Date")
                ),

                upperreceiveddate: convertExcelDate(
                    read("Upper Received Date", "Upper Receive Date")
                ),

                upperreceivedpair: numberValue(
                    read(
                        "Upper Received Pair",
                        "Upper Received Pairs",
                        "Upper Receive Pair"
                    )
                ),

                upperinsolecontractor: textValue(
                    read(
                        "Upper/Insole Contractor",
                        "Upper Insole Contractor",
                        "Upper Insole Contractor Name"
                    )
                ),

                upperinsoleissuedate: convertExcelDate(
                    read(
                        "Upper/Insole Issued Date",
                        "Upper Insole Issued Date",
                        "Upper Insole Issue Date"
                    )
                ),

                upperstorereceiveddate: convertExcelDate(
                    read(
                        "Upper Store Received Date",
                        "Upper Store Receive Date"
                    )
                ),

                upperstorepairqty: numberValue(
                    read(
                        "Upper Store Pair Qty",
                        "Upper Store Pair",
                        "Upper Store Quantity"
                    )
                ),

                upperstorestatus: textValue(
                    read("Upper Store Status", "Store Status")
                ),

                machineno: textValue(
                    read("Machine No", "Machine Number", "Machine")
                ),

                machineissuedate: convertExcelDate(
                    read("Machine Issue Date", "Machine Issued Date")
                ),

                machinepairqty: numberValue(
                    read(
                        "Machine Pair Qty",
                        "Machine Pair",
                        "Machine Quantity"
                    )
                ),

                firstpair: numberValue(
                    read("1st Pair", "First Pair", "1st Pairs")
                ),

                secondpair: numberValue(
                    read("2nd Pair", "Second Pair", "2nd Pairs")
                ),

                rejection: numberValue(
                    read("Rejection", "Rejected Pair", "Rejected Pairs")
                ),

                totalpair: numberValue(
                    read("Total Pair", "Total Pairs", "Total Production Pair")
                ),

                uploadbatchid: uploadBatchId,
            };

            // JOB CARD REQUIRED
            if (!production.jobcard) {
                invalidJobCardRows++;
                continue;
            }

            productionRows.push(production);
        }

        // NO VALID ROWS
        if (!productionRows.length) {
            return res.status(400).json({
                success: false,
                message:
                    "No valid production rows found. Please check the Job Card column and Excel data.",
                data: {
                    totalRowsRead: dataRows.length,
                    skippedRows,
                    invalidJobCardRows,
                },
            });
        }

        // SAVE TO DATABASE
        const result = await insertProductionRows(productionRows);

        // RETURN IMPORTED ROWS
        return res.status(200).json({
            success: true,
            message: "Production Excel uploaded successfully.",
            data: {
                fileName: originalName,
                uploadBatchId,
                totalRowsRead: dataRows.length,
                validRows: productionRows.length,
                insertedRows: result.insertedRows ?? 0,
                updatedRows: result.updatedRows ?? 0,
                unchangedRows: result.unchangedRows ?? 0,
                skippedRows,
                invalidJobCardRows,
                uploadedRows: productionRows.map(
                    ({ uploadbatchid, ...row }) => row
                ),
            },
        });
    } catch (error) {
        console.error("========== PRODUCTION EXCEL UPLOAD ERROR ==========");
        console.error("Message:", error.message);
        console.error("Code:", error.code);
        console.error("SQL Message:", error.sqlMessage);
        console.error("Stack:", error.stack);
        console.error("====================================================");

        return res.status(500).json({
            success: false,
            message: "Failed to upload production Excel.",
            error: error.sqlMessage || error.message,
            code: error.code || null,
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
            fromDate: req.query.fromDate || req.query.fromdate,
            toDate: req.query.toDate || req.query.todate,
            article: req.query.article,
            jobcard: req.query.jobcard,
            sku: req.query.sku,
        };

        const data = await getProductionReport(filters);

        return res.status(200).json({
            success: true,
            count: data.length,
            data,
        });
    } catch (error) {
        console.error("Fetch Production Report Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch production report.",
            error: error.message,
        });
    }
};

// ======================================================
// 3. GET PRODUCTION SUMMARY
// GET /api/production-report/summary
// ======================================================

const fetchProductionSummary = async (req, res) => {
    try {
        const filters = {
            fromDate: req.query.fromDate || req.query.fromdate,
            toDate: req.query.toDate || req.query.todate,
        };

        const data = await getProductionSummary(filters);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Fetch Production Summary Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch production summary.",
            error: error.message,
        });
    }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    uploadProductionExcel,
    fetchProductionReport,
    fetchProductionSummary,
};

