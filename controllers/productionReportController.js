const XLSX = require("xlsx");
const { randomUUID } = require("crypto");

const {
insertProductionRows,
getProductionReport,
getProductionSummary
} = require("../models/productionReportModel");

// ======================================================
// EXCEL HEADER NORMALIZATION
// ======================================================

const normalizeHeader = (value) =>
String(value ?? "")
.toLowerCase()
.replace(/[^a-z0-9]/g, "");

const HEADER_MAP = {
sku: "sku",
packing: "packing",

 
date: "reportdate",
reportdate: "reportdate",

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
upperreceivedpair: "upperreceivedpair",

upperinsolecontractor: "upperinsolecontractor",
upperinsoleissueddate: "upperinsoleissueddate",

upperstorereceiveddate: "upperstorereceiveddate",
upperstorepairqty: "upperstorepairqty",
status: "upperstorestatus",
upperstorestatus: "upperstorestatus",

machineno: "machineno",
machineissuedate: "machineissuedate",
machinepairqty: "machinepairqty",

firstpair: "firstpair",
stpair: "firstpair",
secondpair: "secondpair",
rejection: "rejection",
totalpair: "totalpair"
 

};

const findHeaderRow = (matrix) => {
const maxRows = Math.min(matrix.length, 40);

 
for (let i = 0; i < maxRows; i++) {
    const headers = (matrix[i] || []).map(normalizeHeader);

    if (
        headers.includes("sku") &&
        headers.includes("packing") &&
        headers.includes("jobcard") &&
        headers.includes("article")
    ) {
        return i;
    }
}

return -1;
 

};

const parseExcelDate = (value) => {
if (value === undefined || value === null || value === "") {
return null;
}

 
if (value instanceof Date) {
    return value;
}

if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);

    if (!parsed) {
        throw new Error(`Invalid Excel date serial: ${value}`);
    }

    const year = String(parsed.y).padStart(4, "0");
    const month = String(parsed.m).padStart(2, "0");
    const day = String(parsed.d).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const text = String(value).trim();

const dmy = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);

    const check = new Date(Date.UTC(year, month - 1, day));

    if (
        check.getUTCFullYear() !== year ||
        check.getUTCMonth() !== month - 1 ||
        check.getUTCDate() !== day
    ) {
        throw new Error(`Invalid Excel date: ${text}`);
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);

if (iso) {
    return `${iso[1]}-${String(iso[2]).padStart(2, "0")}-${String(iso[3]).padStart(2, "0")}`;
}

throw new Error(`Unsupported Excel date format: ${text}`);
 

};

// ======================================================
// UPLOAD PRODUCTION EXCEL
// ======================================================

exports.uploadProductionExcel = async (req, res) => {
try {
if (!req.file) {
return res.status(400).json({
success: false,
message: "Please select an Excel file."
});
}

 
    const workbook = XLSX.read(req.file.buffer, {
        type: "buffer",
        cellDates: true
    });

    if (!workbook.SheetNames.length) {
        return res.status(400).json({
            success: false,
            message: "The Excel workbook has no sheets."
        });
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const matrix = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: null,
        raw: true,
        blankrows: false
    });

    const headerIndex = findHeaderRow(matrix);

    if (headerIndex === -1) {
        return res.status(400).json({
            success: false,
            message: "Excel header row not found. Check SKU, Packing, Job Card and Article headings."
        });
    }

    const rawHeaders = matrix[headerIndex] || [];
    const mappedHeaders = rawHeaders.map((header) => {
        const normalized = normalizeHeader(header);
        return HEADER_MAP[normalized] || null;
    });

    const requiredHeaders = [
        "sku",
        "jobcard",
        "article",
        "colour",
        "size",
        "pair"
    ];

    const missingHeaders = requiredHeaders.filter(
        (field) => !mappedHeaders.includes(field)
    );

    if (missingHeaders.length) {
        return res.status(400).json({
            success: false,
            message: `Missing required Excel columns: ${missingHeaders.join(", ")}`
        });
    }

    const uploadbatchid = randomUUID();
    const rows = [];
    const rowErrors = [];

    for (let i = headerIndex + 1; i < matrix.length; i++) {
        const cells = matrix[i] || [];

        if (cells.every((cell) => cell === null || String(cell).trim() === "")) {
            continue;
        }

        const row = {
            uploadbatchid
        };

        for (let j = 0; j < mappedHeaders.length; j++) {
            const field = mappedHeaders[j];

            if (!field) continue;

            const value = cells[j];

            if (
                [
                    "reportdate",
                    "cuttingreceiveddate",
                    "upperissuedate",
                    "upperreceiveddate",
                    "upperinsoleissueddate",
                    "upperstorereceiveddate",
                    "machineissuedate"
                ].includes(field)
            ) {
                row[field] = value === null || value === ""
                    ? null
                    : parseExcelDate(value);
            } else {
                row[field] = value;
            }
        }

        // Ignore report title/summary rows that do not contain a SKU.
        if (!row.sku && !row.jobcard) {
            continue;
        }

        if (!row.sku || !row.jobcard) {
            rowErrors.push({
                excelRow: i + 1,
                message: "SKU or Job Card is missing."
            });
            continue;
        }

        rows.push(row);
    }

    if (rowErrors.length) {
        return res.status(400).json({
            success: false,
            message: "Some Excel rows have missing required values. No records were imported.",
            errors: rowErrors.slice(0, 30),
            totalErrors: rowErrors.length
        });
    }

    if (!rows.length) {
        return res.status(400).json({
            success: false,
            message: "No production data rows found below the header."
        });
    }

    const result = await insertProductionRows(rows);

    return res.status(200).json({
        success: true,
        message: "Production Excel processed successfully.",
        uploadbatchid,
        totalExcelRows: rows.length,
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
const rows = await getProductionReport({
fromDate: req.query.fromdate,
toDate: req.query.todate,
article: req.query.article,
jobcard: req.query.jobcard,
sku: req.query.sku
});

 
    return res.status(200).json({
        success: true,
        count: rows.length,
        data: rows
    });
} catch (error) {
    console.error("Get Production Report Controller Error:", error);

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
const summary = await getProductionSummary({
fromDate: req.query.fromdate,
toDate: req.query.todate
});

 
    return res.status(200).json({
        success: true,
        data: summary
    });
} catch (error) {
    console.error("Get Production Summary Controller Error:", error);

    return res.status(500).json({
        success: false,
        message: "Failed to fetch production summary.",
        error: error.message
    });
}
 

};
