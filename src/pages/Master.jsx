import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api'; // Your backend API base URL

const Master = ({ showAlert }) => {
  const [stages, setStages] = useState([]);
  const [stageName, setStageName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/stages`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStages(data);
      } catch (error) {
        console.error("Error fetching stages:", error);
        showAlert('Error fetching stages.', 'error');
      }
    };

    fetchStages();
  }, [showAlert]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stageName) return;

    try {
      if (editingId) {
        // Update existing stage
        const response = await fetch(`${API_BASE_URL}/stages/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: stageName.trim(), remarks }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setStages(stages.map((stage) =>
          stage.id === editingId ? { ...stage, name: stageName.trim(), remarks } : stage
        ));
        setEditingId(null);
        showAlert('Stage updated successfully!', 'success');
      } else {
        // Add new stage
        const newStage = {
          id: self.crypto.randomUUID(),
          name: stageName.trim(),
          remarks,
        };
        const response = await fetch(`${API_BASE_URL}/stages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newStage),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setStages([...stages, newStage]);
        showAlert('Stage created successfully!', 'success');
      }

      setStageName('');
      setRemarks('');
    } catch (error) {
      console.error("Error saving stage:", error);
      showAlert('Error saving stage.', 'error');
    }
  };

  const handleEdit = (stage) => {
    setEditingId(stage.id);
    setStageName(stage.name);
    setRemarks(stage.remarks);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this stage?");
    if (confirmDelete) {
      try {
        const response = await fetch(`${API_BASE_URL}/stages/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setStages(stages.filter((stage) => stage.id !== id));
        showAlert('Stage deleted successfully!', 'success');
      } catch (error) {
        console.error("Error deleting stage:", error);
        showAlert('Error deleting stage.', 'error');
      }
    }
  };
  
  const handleCancel = () => {
    setEditingId(null);
    setStageName('');
    setRemarks('');
  }

  return (
    <div className="page-container">
      <h2>Master (Production Stages)</h2>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Stage Name</label>
            <input
              type="text"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="Enter stage name"
              required
            />
          </div>
          <div className="form-group">
            <label>Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks"
            />
          </div>
          <div className="form-actions">
            <button type="submit">{editingId ? 'Update' : 'Save'}</button>
            {editingId && <button type="button" className="cancel" onClick={handleCancel}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Stage Name</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage, index) => (
              <tr key={stage.id}>
                <td data-label="Sr. No">{index + 1}</td>
                <td data-label="Stage Name">{stage.name}</td>
                <td data-label="Remarks">{stage.remarks}</td>
                <td data-label="Actions" className="actions">
                  <button onClick={() => handleEdit(stage)}>Edit</button>
                  <button className="delete" onClick={() => handleDelete(stage.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Master;
