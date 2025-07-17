import React, { useState, useEffect } from 'react';

const Master = ({ showAlert }) => {
  const [stages, setStages] = useState([]);
  const [stageName, setStageName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [editingId, setEditingId] = useState(null);

  // const API_BASE_URL = 'http://localhost:5000/api'; // Your backend API base URL

  useEffect(() => {
    const storedStages = JSON.parse(localStorage.getItem('stages'));
    if (storedStages && storedStages.length > 0) {
      setStages(storedStages);
    } else {
      const defaultStages = [
        { id: self.crypto.randomUUID(), name: 'HOLD from Team', remarks: '' },
        { id: self.crypto.randomUUID(), name: 'Under Manufacturing', remarks: '' },
        { id: self.crypto.randomUUID(), name: 'Ready for Internal FAT', remarks: '' },
        { id: self.crypto.randomUUID(), name: 'Ready for Client FAT', remarks: '' },
        { id: self.crypto.randomUUID(), name: 'Ready for Dispatch', remarks: '' },
        { id: self.crypto.randomUUID(), name: 'Dispatched', remarks: '' },
      ];
      setStages(defaultStages);
      localStorage.setItem('stages', JSON.stringify(defaultStages));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stageName) return;

    if (editingId) {
      // Update existing stage
      const updatedStages = stages.map((stage) =>
        stage.id === editingId ? { ...stage, name: stageName.trim(), remarks } : stage
      );
      setStages(updatedStages);
      localStorage.setItem('stages', JSON.stringify(updatedStages));
      setEditingId(null);
      showAlert('Stage updated successfully!', 'success');
    } else {
      // Add new stage
      const newStage = {
        id: self.crypto.randomUUID(),
        name: stageName.trim(),
        remarks,
      };
      const updatedStages = [...stages, newStage];
      setStages(updatedStages);
      localStorage.setItem('stages', JSON.stringify(updatedStages));
      showAlert('Stage created successfully!', 'success');
    }

    setStageName('');
    setRemarks('');
  };

  const handleEdit = (stage) => {
    setEditingId(stage.id);
    setStageName(stage.name);
    setRemarks(stage.remarks);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this stage?");
    if (confirmDelete) {
      const updatedStages = stages.filter((stage) => stage.id !== id);
      setStages(updatedStages);
      localStorage.setItem('stages', JSON.stringify(updatedStages));
      showAlert('Stage deleted successfully!', 'success');
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
