const { query } = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET all projects
async function getProjects(req, res) {
  try {
    const result = await query('SELECT id, projectNo, projectName, customerName, owner, projectDate, targetDate, dispatchMonth, productionStage, remarks FROM Projects');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).send(err.message);
  }
}

// GET a single project by ID
async function getProjectById(req, res) {
  try {
    const result = await query('SELECT * FROM Projects WHERE id = $1', [req.params.id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Project not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}

// POST a new project
async function createProject(req, res) {
  if (!req.body) {
    return res.status(400).send('Request body is missing.');
  }
  const { projectNo, projectName, customerName, owner, projectDate, targetDate, dispatchMonth, productionStage, remarks } = req.body;
  try {
    const parsedProjectDate = projectDate ? new Date(projectDate) : null;
    const parsedTargetDate = targetDate ? new Date(targetDate) : null;
    const id = req.body.id || uuidv4();
    await query(
      'INSERT INTO Projects (id, projectNo, projectName, customerName, owner, projectDate, targetDate, dispatchMonth, productionStage, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [id, projectNo, projectName, customerName, owner, parsedProjectDate, parsedTargetDate, dispatchMonth, productionStage, remarks]
    );
    res.status(201).send('Project created');
  } catch (err) {
    res.status(500).send(err.message);
  }
}

// PUT (update) a project
async function updateProject(req, res) {
  if (!req.body) {
    return res.status(400).send('Request body is missing.');
  }
  const { projectNo, projectName, customerName, owner, projectDate, targetDate, dispatchMonth, productionStage, remarks } = req.body;
  try {
    const parsedProjectDate = projectDate ? new Date(projectDate) : null;
    const parsedTargetDate = targetDate ? new Date(targetDate) : null;
    const result = await query(
      'UPDATE Projects SET projectNo = $1, projectName = $2, customerName = $3, owner = $4, projectDate = $5, targetDate = $6, dispatchMonth = $7, productionStage = $8, remarks = $9 WHERE id = $10',
      [projectNo, projectName, customerName, owner, parsedProjectDate, parsedTargetDate, dispatchMonth, productionStage, remarks, req.params.id]
    );
    if (result.rowCount > 0) {
      res.send('Project updated');
    } else {
      res.status(404).send('Project not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}

// DELETE a project
async function deleteProject(req, res) {
  try {
    const result = await query('DELETE FROM Projects WHERE id = $1', [req.params.id]);
    if (result.rowCount > 0) {
      res.send('Project deleted');
    } else {
      res.status(404).send('Project not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};