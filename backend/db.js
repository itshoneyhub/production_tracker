const { Pool } = require('pg');

console.log('--- Environment Variables from process.env ---');
console.log('process.env.DATABASE_URL:', process.env.DATABASE_URL ? '********' : 'undefined'); // Mask URL
console.log('----------------------------------------------');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const connectDB = async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL');
  } catch (err) {
    console.error('Database Connection Failed! Bad Config: ', err);
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
  pool,
  connectDB,
  getPool,
  query: (text, params) => pool.query(text, params),
};