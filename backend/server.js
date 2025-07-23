const express = require('express');
const cors = require('cors');
const { connectDB, getPool, sql } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

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

// API routes (will be defined in separate files later)
app.use('/api/projects', require('./routes/projects'));
app.use('/api/stages', require('./routes/stages'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});