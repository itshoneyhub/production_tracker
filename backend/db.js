const sql = require('mssql');

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('DB_PORT:', process.env.DB_PORT);

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10),
  options: {
    encrypt: false, // Use this if you're on Azure
    trustServerCertificate: true, // Change to true for local dev / self-signed certs
  },
};

let pool;

const connectDB = async () => {
  console.log('Database Configuration:', dbConfig);
  try {
    pool = await new sql.ConnectionPool(dbConfig).connect();
    console.log('Connected to MSSQL');
  } catch (err) {
    console.error('Database Connection Failed! Bad Config: ', err);
    // Exit process with failure
    process.exit(1);
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Connection pool is not initialized');
  }
  return pool;
};

module.exports = {
  sql,
  connectDB,
  getPool,
};