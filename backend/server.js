
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
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('./routes/projects');
const { getStages, getStageById, createStage, updateStage, deleteStage } = require('./routes/stages');

// API routes
app.all('/api/projects*', async (req, res) => {
  const urlPath = req.path.replace('/api/', '');
  const method = req.method.toLowerCase();
  const idMatch = urlPath.match(/\/([a-f0-9-]+)$/i);
  const id = idMatch ? idMatch[1] : null;

  const mockReq = {
    body: req.body,
    params: { id: id },
    query: req.query,
    url: urlPath,
    method: req.method
  };

  const mockRes = {
    status: function (statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    send: function (body) {
      res.status(this.statusCode || 200).send(body);
    },
    json: function (body) {
      res.status(this.statusCode || 200).json(body);
    }
  };

  if (id) {
    if (method === 'get') {
      await getProjectById(mockReq, mockRes);
    } else if (method === 'put') {
      await updateProject(mockReq, mockRes);
    } else if (method === 'delete') {
      await deleteProject(mockReq, mockRes);
    } else {
      mockRes.status(404).send('Not Found');
    }
  } else {
    if (method === 'get') {
      await getProjects(mockReq, mockRes);
    } else if (method === 'post') {
      await createProject(mockReq, mockRes);
    } else {
      mockRes.status(404).send('Not Found');
    }
  }
});

app.all('/api/stages*', async (req, res) => {
  const urlPath = req.path.replace('/api/', '');
  const method = req.method.toLowerCase();
  const idMatch = urlPath.match(/\/([a-f0-9-]+)$/i);
  const id = idMatch ? idMatch[1] : null;

  const mockReq = {
    body: req.body,
    params: { id: id },
    query: req.query,
    url: urlPath,
    method: req.method
  };

  const mockRes = {
    status: function (statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    send: function (body) {
      res.status(this.statusCode || 200).send(body);
    },
    json: function (body) {
      res.status(this.statusCode || 200).json(body);
    }
  };

  if (id) {
    if (method === 'get') {
      await getStageById(mockReq, mockRes);
    } else if (method === 'put') {
      await updateStage(mockReq, mockRes);
    } else if (method === 'delete') {
      await deleteStage(mockReq, mockRes);
    } else {
      mockRes.status(404).send('Not Found');
    }
  } else {
    if (method === 'get') {
      await getStages(mockReq, mockRes);
    } else if (method === 'post') {
      await createStage(mockReq, mockRes);
    } else {
      mockRes.status(404).send('Not Found');
    }
  }
});

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
