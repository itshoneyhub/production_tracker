const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST, // Changed from DB_SERVER
  database: process.env.DB_NAME, // Changed from DB_DATABASE
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Error connecting to PostgreSQL database:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};