const mysql = require('mysql2');

const pool = mysql.createPool({
  user: 'ovaphlow',
  password: 'ovaph@QH.1123',
  host: '82.156.226.151',
  port: 3306,
  database: 'billboard',
  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 4,
});

module.exports = pool;
