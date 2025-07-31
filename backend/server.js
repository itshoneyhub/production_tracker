require('dotenv').config({ path: './.env' });


const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, query } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// API routes
app.use('/api/projects', require('./routes/projects'));
app.use('/api/stages', require('./routes/stages'));

// Test DB connection
app.get('/api/test-db', async (req, res) => {
  try {
    const { rows } = await query('SELECT 1 AS number');
    res.json(rows);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Serve frontend
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});