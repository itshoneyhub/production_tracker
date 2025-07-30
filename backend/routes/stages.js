const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET all stages
router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM "Stages"');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching stages:', err);
    res.status(500).send(err.message);
  }
});

// GET a single stage by ID
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM "Stages" WHERE "id" = $1', [req.params.id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Stage not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST a new stage
router.post('/', async (req, res) => {
  const { name, remarks } = req.body;
  try {
    await query('INSERT INTO "Stages" ("id", "name", "remarks") VALUES ($1, $2, $3)', 
      [req.body.id || uuidv4(), name, remarks]);
    res.status(201).send('Stage created');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// PUT (update) a stage
router.put('/:id', async (req, res) => {
  const { name, remarks } = req.body;
  try {
    const { rowCount } = await query('UPDATE "Stages" SET "name" = $2, "remarks" = $3 WHERE "id" = $1', 
      [req.params.id, name, remarks]);
    if (rowCount > 0) {
      res.send('Stage updated');
    } else {
      res.status(404).send('Stage not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// DELETE a stage
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM "Stages" WHERE "id" = $1', [req.params.id]);
    if (rowCount > 0) {
      res.send('Stage deleted');
    }
    else {
      res.status(404).send('Stage not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
