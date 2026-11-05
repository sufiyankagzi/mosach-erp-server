const db = require('./connectdb');

// To Cut report: one database row per SKU.
const createToCutReportTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS tocutreport (
      tocutreportid BIGINT AUTO_INCREMENT PRIMARY KEY,
      sku VARCHAR(150) NOT NULL,
      tocut INT NOT NULL DEFAULT 0,
      article VARCHAR(100) NULL,
      colour VARCHAR(100) NULL,
      size VARCHAR(50) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_tocutreport_sku (sku),
      INDEX idx_tocutreport_article (article)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  db.query(sql, (error) => {
    if (error) {
      console.error('To Cut Report table creation error:', error);
      return;
    }
    ensureToCutReportColumns();
  });
};

const ensureToCutReportColumns = () => {
  const columns = [
    ['sku', 'VARCHAR(150) NULL'],
    ['tocut', 'INT NOT NULL DEFAULT 0'],
    ['article', 'VARCHAR(100) NULL'],
    ['colour', 'VARCHAR(100) NULL'],
    ['size', 'VARCHAR(50) NULL'],
    ['created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'],
    ['updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
  ];

  const ensureColumn = (index) => {
    if (index >= columns.length) return ensureUniqueSku();
    const [name, definition] = columns[index];
    const checkSql = `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tocutreport' AND COLUMN_NAME = ?`;
    db.query(checkSql, [name], (checkError, rows) => {
      if (checkError) return console.error(`To Cut column check failed (${name}):`, checkError);
      if (rows.length) return ensureColumn(index + 1);
      db.query(`ALTER TABLE tocutreport ADD COLUMN ${name} ${definition}`, (alterError) => {
        if (alterError) return console.error(`To Cut column add failed (${name}):`, alterError);
        ensureColumn(index + 1);
      });
    });
  };
  ensureColumn(0);
};

// Existing installations may already contain repeated SKUs. Keep the latest
// row (highest primary key), then enforce the unique key for future uploads.
const ensureUniqueSku = () => {
  db.query(
    `DELETE FROM tocutreport WHERE sku IS NULL OR TRIM(sku) = ''`,
    (blankError) => {
      if (blankError) return console.error('To Cut blank SKU cleanup failed:', blankError);
      db.query('ALTER TABLE tocutreport MODIFY COLUMN sku VARCHAR(150) NOT NULL', (notNullError) => {
        if (notNullError) return console.error('To Cut SKU NOT NULL migration failed:', notNullError);
        removeDuplicateSkus();
      });
    }
  );
};

const removeDuplicateSkus = () => {
  db.query(
    `DELETE old_row FROM tocutreport old_row
     INNER JOIN tocutreport newer_row
       ON old_row.sku = newer_row.sku
      AND old_row.tocutreportid < newer_row.tocutreportid`,
    (deleteError) => {
      if (deleteError) return console.error('To Cut duplicate SKU cleanup failed:', deleteError);
      const checkSql = `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tocutreport'
          AND INDEX_NAME = 'uq_tocutreport_sku'`;
      db.query(checkSql, (checkError, indexes) => {
        if (checkError) return console.error('To Cut unique index check failed:', checkError);
        if (indexes.length) return console.log('To Cut Report table ready (unique SKU).');
        db.query('ALTER TABLE tocutreport ADD UNIQUE KEY uq_tocutreport_sku (sku)', (indexError) => {
          if (indexError) return console.error('To Cut unique SKU index creation failed:', indexError);
          console.log('To Cut Report table ready (unique SKU).');
        });
      });
    }
  );
};

module.exports = { createToCutReportTable, ensureToCutReportColumns };
