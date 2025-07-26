require('dotenv').config({ path: './.env' });

console.log('Server starting...');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getPool, sql } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// API routes
app.use('/api/projects', require('./routes/projects'));
app.use('/api/stages', require('./routes/stages'));

// Test DB connection
app.get('/api/test-db', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query('SELECT 1 AS number');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// The "catchall" handler: for any request that doesn't
// match one of the API routes, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

try {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
}
