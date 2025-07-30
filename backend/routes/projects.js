const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET all projects
router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM Projects');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).send(err.message);
  }
});

// GET a single project by ID
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM Projects WHERE id = $1', [req.params.id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Project not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST a new project
router.post('/', async (req, res) => {
  const { projectNo, customerName, owner, projectDate, targetDate, productionStage, remarks } = req.body;
  try {
    await query('INSERT INTO Projects (id, projectNo, customerName, owner, projectDate, targetDate, productionStage, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', 
      [req.body.id || uuidv4(), projectNo, customerName, owner, projectDate, targetDate, productionStage, remarks]);
    res.status(201).send('Project created');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// PUT (update) a project
router.put('/:id', async (req, res) => {
  const { projectNo, customerName, owner, projectDate, targetDate, productionStage, remarks } = req.body;
  try {
    const { rowCount } = await query('UPDATE Projects SET projectNo = $2, customerName = $3, owner = $4, projectDate = $5, targetDate = $6, productionStage = $7, remarks = $8 WHERE id = $1', 
      [req.params.id, projectNo, customerName, owner, projectDate, targetDate, productionStage, remarks]);
    if (rowCount > 0) {
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
    const { rowCount } = await query('DELETE FROM Projects WHERE id = $1', [req.params.id]);
    if (rowCount > 0) {
      res.send('Project deleted');
    } else {
      res.status(404).send('Project not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
