import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: '192.168.0.3',
  user: 'root',
  password: 'qweqweqwe1!',
  database: 'aa',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;