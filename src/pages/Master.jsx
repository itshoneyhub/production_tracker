import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios

const API_BASE_URL = '/api';

const Master = ({ showAlert }) => {
  const [stages, setStages] = useState([]);
  const [stageName, setStageName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Function to fetch stages from the backend
  const fetchStages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stages`);
      setStages(response.data);
    } catch (error) {
      console.error('Error fetching stages:', error);
      showAlert('Error fetching stages.', 'error');
    }
  };

  useEffect(() => {
    fetchStages();
  }, []); // Fetch stages on component mount

  const handleSubmit = async (e) => { // Made async
    e.preventDefault();
    if (!stageName) return;

    if (editingId) {
      // Update existing stage
      try {
        await axios.put(`${API_BASE_URL}/stages/${editingId}`, { name: stageName.trim(), remarks });
        showAlert('Stage updated successfully!', 'success');
        fetchStages(); // Re-fetch stages to update the list
      } catch (error) {
        console.error('Error updating stage:', error);
        showAlert('Error updating stage.', 'error');
      } finally {
        setEditingId(null);
      }
    } else {
      // Add new stage
      try {
        await axios.post(`${API_BASE_URL}/stages`, { name: stageName.trim(), remarks });
        showAlert('Stage created successfully!', 'success');
        fetchStages(); // Re-fetch stages to update the list
      } catch (error) {
        console.error('Error creating stage:', error);
        showAlert('Error creating stage.', 'error');
      }
    }

    setStageName('');
    setRemarks('');
  };

  const handleEdit = (stage) => {
    setEditingId(stage.id);
    setStageName(stage.name);
    setRemarks(stage.remarks);
  };

  const handleDelete = async (id) => { // Made async
    const confirmDelete = window.confirm("Are you sure you want to delete this stage?");
    if (confirmDelete) {
      try {
        await axios.delete(`${API_BASE_URL}/stages/${id}`);
        showAlert('Stage deleted successfully!', 'success');
        fetchStages(); // Re-fetch stages to update the list
      } catch (error) {
        console.error('Error deleting stage:', error);
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
            <button type="submit">{editingId ? 'Update' : '+ Add'}</button>
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