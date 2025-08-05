const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET all projects
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT id, projectNo, projectName, customerName, owner, projectDate, targetDate, dispatchMonth, productionStage, remarks FROM Projects');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).send(err.message);
  }
});

// GET a single project by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
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
  const { projectNo, projectName, customerName, owner, projectDate, targetDate, dispatchMonth, productionStage, remarks } = req.body;
  try {
    const parsedProjectDate = projectDate ? new Date(projectDate) : null;
    const parsedTargetDate = targetDate ? new Date(targetDate) : null;
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.UniqueIdentifier, req.body.id || uuidv4())
      .input('projectNo', sql.NVarChar, projectNo)
      .input('projectName', sql.NVarChar, projectName)
      .input('customerName', sql.NVarChar, customerName)
      .input('owner', sql.NVarChar, owner)
      .input('projectDate', sql.Date, parsedProjectDate)
      .input('targetDate', sql.Date, parsedTargetDate)
      .input('dispatchMonth', sql.NVarChar, dispatchMonth)
      .input('productionStage', sql.NVarChar, productionStage)
      .input('remarks', sql.NVarChar, remarks)
      .query('INSERT INTO Projects (id, projectNo, projectName, customerName, owner, projectDate, targetDate, dispatchMonth, productionStage, remarks) VALUES (@id, @projectNo, @projectName, @customerName, @owner, @projectDate, @targetDate, @dispatchMonth, @productionStage, @remarks)');
    res.status(201).send('Project created');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// PUT (update) a project
router.put('/:id', async (req, res) => {
  const { projectNo, projectName, customerName, owner, projectDate, targetDate, dispatchMonth, productionStage, remarks } = req.body;
  try {
    const parsedProjectDate = projectDate ? new Date(projectDate) : null;
    const parsedTargetDate = targetDate ? new Date(targetDate) : null;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .input('projectNo', sql.NVarChar, projectNo)
      .input('projectName', sql.NVarChar, projectName)
      .input('customerName', sql.NVarChar, customerName)
      .input('owner', sql.NVarChar, owner)
      .input('projectDate', sql.Date, parsedProjectDate)
      .input('targetDate', sql.Date, parsedTargetDate)
      .input('dispatchMonth', sql.NVarChar, dispatchMonth)
      .input('productionStage', sql.NVarChar, productionStage)
      .input('remarks', sql.NVarChar, remarks)
      .query('UPDATE Projects SET projectNo = @projectNo, projectName = @projectName, customerName = @customerName, owner = @owner, projectDate = @projectDate, targetDate = @targetDate, dispatchMonth = @dispatchMonth, productionStage = @productionStage, remarks = @remarks WHERE id = @id');
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
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
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