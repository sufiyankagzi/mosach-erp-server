
const db = require("./connectdb");

// ========================================
// ORDERS TABLE
// ========================================

const createOrdersTable = () => {

  const sql = `
    CREATE TABLE IF NOT EXISTS orders (
      orderid INT AUTO_INCREMENT PRIMARY KEY,

      orderno VARCHAR(50) NOT NULL UNIQUE,

      orderdate DATE NOT NULL,

      salespersonid INT NOT NULL,

      totalqty DECIMAL(12,2) NOT NULL DEFAULT 0,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(sql, (err) => {

    if (err) {
      console.error(
        "Orders table error:",
        err.message
      );
      return;
    }

    console.log(
      "Orders table ready."
    );

  });

};


// ========================================
// ORDER DETAILS TABLE
// ========================================

const createOrderDetailsTable = () => {

  const sql = `
    CREATE TABLE IF NOT EXISTS orderdetails (
      orderdetailid INT AUTO_INCREMENT PRIMARY KEY,

      orderid INT NOT NULL,

      articleid INT NOT NULL,

      sizegroupid INT NOT NULL,

      sizeid INT NOT NULL,

      colorid INT NOT NULL,

      qty DECIMAL(12,2) NOT NULL DEFAULT 0,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT fk_orderdetails_order
        FOREIGN KEY (orderid)
        REFERENCES orders(orderid)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;

  db.query(sql, (err) => {

    if (err) {
      console.error(
        "Order Details table error:",
        err.message
      );
      return;
    }

    console.log(
      "Order Details table ready."
    );

  });

};


// ========================================
// CREATE BOTH TABLES
// ========================================

const createOrderTables = () => {

  createOrdersTable();

  // Wait for orders table before creating
  // orderdetails because of foreign key

  setTimeout(() => {
    createOrderDetailsTable();
  }, 500);

};


// ========================================
// EXPORT
// ========================================

module.exports = createOrderTables;

