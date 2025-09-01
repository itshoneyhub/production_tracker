const { query } = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET all stages
async function getStages(req, res) {
  try {
    const result = await query('SELECT * FROM "stages"');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching stages:', err);
    res.status(500).send(err.message);
  }
}

// GET a single stage by ID
async function getStageById(req, res) {
  try {
    const result = await query('SELECT * FROM "stages" WHERE id = $1', [req.params.id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Stage not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}

// POST a new stage
async function createStage(req, res) {
  if (!req.body) {
    return res.status(400).send('Request body is missing.');
  }
  const { name, remarks } = req.body;
  try {
    const id = req.body.id || uuidv4();
    await query('INSERT INTO "stages" (id, name, remarks) VALUES ($1, $2, $3)', [id, name, remarks]);
    res.status(201).send('Stage created');
  } catch (err) {
    res.status(500).send(err.message);
  }
}

// PUT (update) a stage
async function updateStage(req, res) {
  if (!req.body) {
    return res.status(400).send('Request body is missing.');
  }
  const { name, remarks } = req.body;
  try {
    const result = await query('UPDATE "stages" SET name = $1, remarks = $2 WHERE id = $3', [name, remarks, req.params.id]);
    if (result.rowCount > 0) {
      res.send('Stage updated');
    } else {
      res.status(404).send('Stage not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}

// DELETE a stage
async function deleteStage(req, res) {
  try {
    const result = await query('DELETE FROM "stages" WHERE id = $1', [req.params.id]);
    if (result.rowCount > 0) {
      res.send('Stage deleted');
    }
    else {
      res.status(404).send('Stage not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}

module.exports = {
  getStages,
  getStageById,
  createStage,
  updateStage,
  deleteStage
};