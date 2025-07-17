require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// SQL Server configuration
const config = {
  user: process.env.DB_USER || 'HANUMANT',
  password: process.env.DB_PASSWORD || 'Pravin@123',
  server: process.env.DB_SERVER || 'DESKTOP-AMHGFBV\\SQLEXPRESS', // You may need to escape backslashes
  database: process.env.DB_DATABASE || 'productionTrackerdb',
  options: {
    encrypt: false, // Use true for Azure SQL Database, false for local SQL Server
    trustServerCertificate: true // Change to true for local dev / self-signed certs
  }
};

// Connect to SQL Server
sql.connect(config).then(pool => {
  if (pool.connected) {
    console.log('Connected to SQL Server');
  }
  return pool;
}).catch(err => console.error('Database Connection Failed:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// API routes (will be defined in separate files later)
app.use('/api/projects', require('./routes/projects'));
app.use('/api/stages', require('./routes/stages'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
