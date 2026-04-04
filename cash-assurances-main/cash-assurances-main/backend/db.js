const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cash_assurances',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool
  .getConnection()
  .then((conn) => {
    console.log('[DB] Connected');
    conn.release();
  })
  .catch((err) => {
    console.error('[DB] Connection failed:', err.message);
    console.error('[DB] API will continue running, but DB endpoints may fail until database is available.');
  });

module.exports = pool;
