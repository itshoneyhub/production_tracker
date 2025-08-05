
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { poolPromise } = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/projects', require('./routes/projects'));
app.use('/api/stages', require('./routes/stages'));

// Test DB connection
app.get('/api/test-db', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT 1 AS number');
    res.json(result.recordset);
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).send({ message: err.message });
  }
});

// Serve frontend
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Unhandled backend error:', err);
  res.status(500).send({ message: 'An unexpected error occurred on the server.' });
});

app.listen(PORT, () => {
  console.log(`Server starting on port ${PORT}`);
});
