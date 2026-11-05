const db = require('../models/connectdb');
const XLSX = require('xlsx');

const clean = (value) => String(value ?? '').trim();
const normalizeHeader = (value) => clean(value).toLowerCase().replace(/[^a-z0-9]/g, '');
const asInteger = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const n = Number(String(value).replace(/,/g, '').trim());
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
};

const getRowsFromExcel = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('Excel workbook mein koi sheet nahi mili.');
  const sheet = workbook.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!raw.length) throw new Error('Excel sheet blank hai.');

  // Expected headings: SKU | tocut | Article | COLOUR | Size
  const headerIndex = raw.findIndex((row) => {
    const headers = row.map(normalizeHeader);
    return headers.includes('sku') && headers.includes('tocut') && headers.includes('article') &&
      headers.includes('colour') && headers.includes('size');
  });
  if (headerIndex < 0) {
    throw new Error('Excel headings match nahi hui. Required: SKU, tocut, Article, COLOUR, Size.');
  }

  const headers = raw[headerIndex].map(normalizeHeader);
  const positions = {
    sku: headers.indexOf('sku'),
    tocut: headers.indexOf('tocut'),
    article: headers.indexOf('article'),
    colour: headers.indexOf('colour'),
    size: headers.indexOf('size'),
  };

  const rows = [];
  let skippedRows = 0;
  for (const cells of raw.slice(headerIndex + 1)) {
    const sku = clean(cells[positions.sku]);
    if (!sku) {
      if (cells.some((v) => clean(v))) skippedRows += 1;
      continue;
    }
    const tocut = asInteger(cells[positions.tocut]);
    if (tocut === null) {
      skippedRows += 1;
      continue;
    }
    rows.push({
      sku,
      tocut,
      article: clean(cells[positions.article]) || null,
      colour: clean(cells[positions.colour]) || null,
      size: clean(cells[positions.size]) || null,
    });
  }
  return { rows, skippedRows, totalExcelRows: raw.length - headerIndex - 1 };
};

const getToCutReport = (req, res) => {
  db.query('SELECT tocutreportid, sku, tocut, article, colour, size, created_at, updated_at FROM tocutreport ORDER BY sku ASC', (error, rows) => {
    if (error) return res.status(500).json({ success: false, message: 'To Cut report load nahi hua.', error: error.message });
    return res.json({ success: true, data: rows });
  });
};

const uploadToCutReport = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Pehle Excel file select karein.' });

  let parsed;
  try {
    parsed = getRowsFromExcel(req.file.buffer);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
  if (!parsed.rows.length) {
    return res.status(400).json({ success: false, message: 'Excel mein valid SKU records nahi mile.' });
  }

  const connection = db.promise ? await db.promise().getConnection() : null;
  if (!connection) return res.status(500).json({ success: false, message: 'Database transaction connection unavailable.' });

  let insertedRows = 0;
  let updatedRows = 0;
  let unchangedRows = 0;
  try {
    await connection.beginTransaction();
    const [existingRows] = await connection.query('SELECT sku FROM tocutreport');
    const existing = new Set(existingRows.map((r) => String(r.sku).toLowerCase()));
    const seenInFile = new Set();

    const upsertSql = `INSERT INTO tocutreport (sku, tocut, article, colour, size)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        tocut = VALUES(tocut), article = VALUES(article),
        colour = VALUES(colour), size = VALUES(size), updated_at = CURRENT_TIMESTAMP`;

    for (const row of parsed.rows) {
      const key = row.sku.toLowerCase();
      const existedBeforeUpload = existing.has(key) || seenInFile.has(key);
      const [result] = await connection.query(upsertSql, [row.sku, row.tocut, row.article, row.colour, row.size]);
      if (!existedBeforeUpload) insertedRows += 1;
      else if (result.affectedRows === 0) unchangedRows += 1;
      else updatedRows += 1;
      seenInFile.add(key);
      existing.add(key);
    }

    await connection.commit();
    return res.json({
      success: true,
      message: 'To Cut Excel successfully upload ho gayi.',
      fileName: req.file.originalname,
      totalExcelRows: parsed.totalExcelRows,
      validRows: parsed.rows.length,
      insertedRows,
      updatedRows,
      unchangedRows,
      skippedRows: parsed.skippedRows,
      uniqueSkuCount: seenInFile.size,
    });
  } catch (error) {
    try { await connection.rollback(); } catch (_) {}
    return res.status(500).json({ success: false, message: 'To Cut Excel upload failed.', error: error.message });
  } finally {
    connection.release();
  }
};

module.exports = { getToCutReport, uploadToCutReport };
