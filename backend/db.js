const sql = require('mssql');
require('dotenv').config();

console.log('db.js is being loaded');

const config = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER,
  port: parseInt(process.env.AZURE_SQL_PORT),
  database: process.env.AZURE_SQL_DATABASE,
  authentication: {
    type: 'default'
  },
  options: {
    encrypt: true, // Use this if you're on Azure
    trustServerCertificate: false, // Change to true for local dev / self-signed certs
    connectionTimeout: 30000
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => console.error('Database Connection Failed! Bad Config: ', err));

module.exports = {
  sql,
  poolPromise
};