const mysql = require('mysql2');

const pool = mysql.createPool({
  user: 'ovaphlow',
  password: 'ovaph@HD.1123',
  host: '127.0.0.1',
  port: 3306,
  database: 'billboard',
  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 2,
});

module.exports = pool;
