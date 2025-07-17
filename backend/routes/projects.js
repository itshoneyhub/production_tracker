const express = require('express');
const router = express.Router();
const sql = require('mssql');

// GET all projects
router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query('SELECT * FROM Projects');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET a single project by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query('SELECT * FROM Projects WHERE id = @id');
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Project not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST a new project
router.post('/', async (req, res) => {
  const { projectNo, customerName, projectDate, targetDate, productionStage, remarks } = req.body;
  try {
    const pool = await sql.connect();
    await pool.request()
      .input('id', sql.NVarChar, req.body.id || self.crypto.randomUUID()) // Use provided ID or generate new
      .input('projectNo', sql.NVarChar, projectNo)
      .input('customerName', sql.NVarChar, customerName)
      .input('projectDate', sql.Date, projectDate)
      .input('targetDate', sql.Date, targetDate)
      .input('productionStage', sql.NVarChar, productionStage)
      .input('remarks', sql.NVarChar, remarks)
      .query('INSERT INTO Projects (id, projectNo, customerName, projectDate, targetDate, productionStage, remarks) VALUES (@id, @projectNo, @customerName, @projectDate, @targetDate, @productionStage, @remarks)');
    res.status(201).send('Project created');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// PUT (update) a project
router.put('/:id', async (req, res) => {
  const { projectNo, customerName, projectDate, targetDate, productionStage, remarks } = req.body;
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .input('projectNo', sql.NVarChar, projectNo)
      .input('customerName', sql.NVarChar, customerName)
      .input('projectDate', sql.Date, projectDate)
      .input('targetDate', sql.Date, targetDate)
      .input('productionStage', sql.NVarChar, productionStage)
      .input('remarks', sql.NVarChar, remarks)
      .query('UPDATE Projects SET projectNo = @projectNo, customerName = @customerName, projectDate = @projectDate, targetDate = @targetDate, productionStage = @productionStage, remarks = @remarks WHERE id = @id');
    if (result.rowsAffected[0] > 0) {
      res.send('Project updated');
    } else {
      res.status(404).send('Project not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// DELETE a project
router.delete('/:id', async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query('DELETE FROM Projects WHERE id = @id');
    if (result.rowsAffected[0] > 0) {
      res.send('Project deleted');
    } else {
      res.status(404).send('Project not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
