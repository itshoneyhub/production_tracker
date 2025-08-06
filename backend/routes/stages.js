
const { sql, poolPromise } = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET all stages
async function getStages(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Stages');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching stages:', err);
    res.status(500).send(err.message);
  }
}

// GET a single stage by ID
async function getStageById(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .query('SELECT * FROM Stages WHERE id = @id');
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Stage not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}

// POST a new stage
async function createStage(req, res) {
  const { name, remarks } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.UniqueIdentifier, req.body.id || uuidv4())
      .input('name', sql.NVarChar, name)
      .input('remarks', sql.NVarChar, remarks)
      .query('INSERT INTO Stages (id, name, remarks) VALUES (@id, @name, @remarks)');
    res.status(201).send('Stage created');
  } catch (err) {
    res.status(500).send(err.message);
  }
}

// PUT (update) a stage
async function updateStage(req, res) {
  const { name, remarks } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .input('name', sql.NVarChar, name)
      .input('remarks', sql.NVarChar, remarks)
      .query('UPDATE Stages SET name = @name, remarks = @remarks WHERE id = @id');
    if (result.rowsAffected[0] > 0) {
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
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .query('DELETE FROM Stages WHERE id = @id');
    if (result.rowsAffected[0] > 0) {
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