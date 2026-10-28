const XLSX = require("xlsx");
const crypto = require("crypto");

const ProductionReport = require("../models/productionReportModel");

// ======================================================
// MOSACH ERP - PRODUCTION REPORT CONTROLLER
// ======================================================

// ======================================================
// EXCEL HEADER -> DATABASE FIELD MAPPING
// ======================================================

const HEADER_MAP = {
sku: "sku",
packing: "packing",
date: "reportdate",
jobcard: "jobcard",
article: "article",
colour: "colour",
color: "colour",
size: "size",
pair: "pair",


cuttingreceiveddate: "cuttingreceiveddate",
cuttingcontractor: "cuttingcontractor",

uppercontractor: "uppercontractor",
upperissuedate: "upperissuedate",
upperreceiveddate: "upperreceiveddate",
receivedpair: "upperreceivedpair",

upperinsolecontractor: "upperinsolecontractor",
upperinsoleissuedate: "upperinsoleissuedate",
upperstorereceiveddate: "upperstorereceiveddate",
upperstorepairqty: "upperstorepairqty",

status: "upperstorestatus",
machineno: "machineno",
machineissuedate: "machineissuedate",
machinepairqty: "machinepairqty",

"1stpair": "firstpair",
"2ndpair": "secondpair",
rejection: "rejection",
totalpair: "totalpair"


};

const DATE_FIELDS = new Set([
"reportdate",
"cuttingreceiveddate",
"upperissuedate",
"upperreceiveddate",
"upperinsoleissuedate",
"upperstorereceiveddate",
"machineissuedate"
]);

const NUMERIC_FIELDS = new Set([
"packing",
"pair",
"upperreceivedpair",
"upperstorepairqty",
"machinepairqty",
"firstpair",
"secondpair",
"rejection",
"totalpair"
]);

// ======================================================
// NORMALIZE EXCEL HEADERS
// Examples:
// JOB CARD -> jobcard
// Cutting Received Date -> cuttingreceiveddate
// 1 st Pair -> 1stpair
// ======================================================

const normalizeHeader = (value) => {
return String(value ?? "")
.trim()
.toLowerCase()
.replace(/[^a-z0-9]/g, "");
};

// ======================================================
// BASIC HELPERS
// ======================================================

const isBlank = (value) => {
return (
value === undefined ||
value === null ||
String(value).trim() === ""
);
};

const normalizeText = (value) => {
if (isBlank(value)) return null;
return String(value).trim();
};

const normalizeNumber = (value, field, rowNumber) => {
if (isBlank(value)) return 0;


const cleaned = String(value)
    .replace(/,/g, "")
    .trim();

const number = Number(cleaned);

if (!Number.isFinite(number)) {
    throw new Error(
        `Excel row ${rowNumber}: Invalid number "${value}" in ${field}.`
    );
}

return number;


};

// ======================================================
// DATE HELPERS
// Supports Excel serial dates, JavaScript Date and text dates.
// ======================================================

const formatDateParts = (year, month, day, field, rowNumber) => {
const date = new Date(Date.UTC(year, month - 1, day));


if (
    year < 1901 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
) {
    throw new Error(
        `Excel row ${rowNumber}: Invalid date "${day}/${month}/${year}" in ${field}.`
    );
}

return (
    String(year).padStart(4, "0") +
    "-" +
    String(month).padStart(2, "0") +
    "-" +
    String(day).padStart(2, "0")
);


};

const convertDate = (value, field, rowNumber) => {
if (isBlank(value)) return null;


// JavaScript Date
if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
        throw new Error(
            `Excel row ${rowNumber}: Invalid date in ${field}.`
        );
    }

    return formatDateParts(
        value.getFullYear(),
        value.getMonth() + 1,
        value.getDate(),
        field,
        rowNumber
    );
}

// Excel serial date
if (typeof value === "number") {
    if (value < 2 || value > 2958465) {
        throw new Error(
            `Excel row ${rowNumber}: Invalid Excel date "${value}" in ${field}.`
        );
    }

    const parsed = XLSX.SSF.parse_date_code(value);

    if (!parsed) {
        throw new Error(
            `Excel row ${rowNumber}: Cannot convert date in ${field}.`
        );
    }

    return formatDateParts(
        parsed.y,
        parsed.m,
        parsed.d,
        field,
        rowNumber
    );
}

const text = String(value).trim();

// YYYY-MM-DD
let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

if (match) {
    return formatDateParts(
        Number(match[1]),
        Number(match[2]),
        Number(match[3]),
        field,
        rowNumber
    );
}

// DD/MM/YYYY or DD-MM-YYYY
match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

if (match) {
    return formatDateParts(
        Number(match[3]),
        Number(match[2]),
        Number(match[1]),
        field,
        rowNumber
    );
}

// Recognizable date strings, e.g. Wed Feb 04 2026...
const parsed = new Date(text);

if (!Number.isNaN(parsed.getTime())) {
    return formatDateParts(
        parsed.getFullYear(),
        parsed.getMonth() + 1,
        parsed.getDate(),
        field,
        rowNumber
    );
}

throw new Error(
    `Excel row ${rowNumber}: Unsupported date "${text}" in ${field}.`
);


};

// ======================================================
// FIND HEADER ROW
// ======================================================

const findHeaderRow = (matrix) => {
const maxRows = Math.min(matrix.length, 30);


for (let i = 0; i < maxRows; i++) {
    const headers = (matrix[i] || []).map(normalizeHeader);

    if (
        headers.includes("sku") &&
        headers.includes("jobcard") &&
        headers.includes("article")
    ) {
        return i;
    }
}

return -1;


};

// ======================================================
// MAP EXCEL ROW TO DATABASE ROW
// ======================================================

const mapExcelRow = (excelRow, headerIndexes, rowNumber) => {
if (!excelRow || excelRow.every(isBlank)) {
return null;
}


const row = {};

for (const [header, columnIndex] of headerIndexes.entries()) {
    const field = HEADER_MAP[header];

    if (!field) continue;

    const value = excelRow[columnIndex];

    if (DATE_FIELDS.has(field)) {
        row[field] = convertDate(value, field, rowNumber);
    } else if (NUMERIC_FIELDS.has(field)) {
        row[field] = normalizeNumber(value, field, rowNumber);
    } else {
        row[field] = normalizeText(value);
    }
}

// Required fields
row.sku = normalizeText(row.sku);
row.jobcard = normalizeText(row.jobcard);

if (!row.sku) {
    throw new Error(
        `Excel row ${rowNumber}: SKU is missing.`
    );
}

if (!row.jobcard) {
    throw new Error(
        `Excel row ${rowNumber}: JOB CARD is missing.`
    );
}

// Default optional numeric fields
for (const field of NUMERIC_FIELDS) {
    if (row[field] === undefined || row[field] === null) {
        row[field] = 0;
    }
}

// Carton is an additional database field, not an Excel column.
row.carton = 0;

return row;


};

// ======================================================
// UPLOAD PRODUCTION EXCEL
// ======================================================

exports.uploadProductionExcel = async (req, res) => {
try {
if (!req.file) {
return res.status(400).json({
success: false,
message: "Excel file not received. Check the upload field name."
});
}


    const buffer = req.file.buffer;

    if (!buffer || buffer.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Uploaded Excel file is empty."
        });
    }

    const workbook = XLSX.read(buffer, {
        type: "buffer",
        cellDates: true
    });

    if (!workbook.SheetNames.length) {
        return res.status(400).json({
            success: false,
            message: "No worksheet found in the Excel file."
        });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const matrix = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
        raw: true,
        blankrows: false
    });

    if (!matrix.length) {
        return res.status(400).json({
            success: false,
            message: "The Excel worksheet is empty."
        });
    }

    const headerRowIndex = findHeaderRow(matrix);

    if (headerRowIndex === -1) {
        return res.status(400).json({
            success: false,
            message:
                "Could not find the header row. SKU, JOB CARD and Article headers are required."
        });
    }

    const originalHeaders = matrix[headerRowIndex] || [];
    const normalizedHeaders = originalHeaders.map(normalizeHeader);
    const headerIndexes = new Map();

    normalizedHeaders.forEach((header, index) => {
        if (header && HEADER_MAP[header]) {
            headerIndexes.set(header, index);
        }
    });

    // Validate required headers
    const requiredHeaders = [
        "sku",
        "date",
        "jobcard",
        "article",
        "colour",
        "size",
        "pair"
    ];

    const missingHeaders = requiredHeaders.filter(
        (header) => !headerIndexes.has(header)
    );

    if (missingHeaders.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Required Excel headers are missing.",
            missingHeaders,
            receivedHeaders: originalHeaders
        });
    }

    const batchId = crypto.randomUUID();
    const rows = [];
    const errors = [];

    for (
        let index = headerRowIndex + 1;
        index < matrix.length;
        index++
    ) {
        try {
            const mappedRow = mapExcelRow(
                matrix[index],
                headerIndexes,
                index + 1
            );

            if (!mappedRow) continue;

            mappedRow.uploadbatchid = batchId;
            rows.push(mappedRow);
        } catch (error) {
            errors.push({
                row: index + 1,
                message: error.message
            });
        }
    }

    // Do not import partial data if any row is invalid.
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message:
                "Excel validation failed. Correct the listed rows and upload again.",
            totalInvalidRows: errors.length,
            errors: errors.slice(0, 50)
        });
    }

    if (rows.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No production data rows found."
        });
    }

    const result = await ProductionReport.insertProductionRows(rows);

    return res.status(200).json({
        success: true,
        message: "Production Excel processed successfully.",
        batchId,
        totalRows: rows.length,
        ...result
    });
} catch (error) {
    console.error("Production Excel Upload Error:", error);

    return res.status(500).json({
        success: false,
        message: "Failed to upload production Excel.",
        error: error.message
    });
}


};

// ======================================================
// GET PRODUCTION REPORT
// ======================================================

exports.getProductionReport = async (req, res) => {
try {
const filters = {
fromDate: req.query.fromdate || req.query.fromDate,
toDate: req.query.todate || req.query.toDate,
article: req.query.article,
jobcard: req.query.jobcard,
sku: req.query.sku
};


    const rows = await ProductionReport.getProductionReport(filters);

    return res.status(200).json({
        success: true,
        total: rows.length,
        data: rows
    });
} catch (error) {
    console.error("Get Production Report Error:", error);

    return res.status(500).json({
        success: false,
        message: "Failed to fetch production report.",
        error: error.message
    });
}


};

// ======================================================
// GET PRODUCTION SUMMARY
// ======================================================

exports.getProductionSummary = async (req, res) => {
try {
const filters = {
fromDate: req.query.fromdate || req.query.fromDate,
toDate: req.query.todate || req.query.toDate
};


    const summary = await ProductionReport.getProductionSummary(filters);

    return res.status(200).json({
        success: true,
        data: summary
    });
} catch (error) {
    console.error("Production Summary Error:", error);

    return res.status(500).json({
        success: false,
        message: "Failed to fetch production summary.",
        error: error.message
    });
}


};
