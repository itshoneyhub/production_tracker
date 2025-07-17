import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const API_BASE_URL = 'http://localhost:5000/api'; // Your backend API base URL

const ProjectList = ({ showAlert }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [stages, setStages] = useState([]);
  const [formData, setFormData] = useState({
    projectNo: '',
    customerName: '',
    projectDate: new Date(),
    targetDate: new Date(),
    productionStage: '',
    remarks: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [editedStage, setEditedStage] = useState('');
  const [filter, setFilter] = useState('All');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProjects(data);
        setFilteredProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        showAlert('Error fetching projects.', 'error');
      }
    };

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

    fetchProjects();
    fetchStages();
  }, [showAlert]); // Depend on showAlert to avoid lint warnings

  useEffect(() => {
    let filtered = projects;
    if (filter !== 'All') {
      filtered = filtered.filter((project) => project.productionStage === filter);
    }
    if (startDate && endDate) {
      filtered = filtered.filter((project) => {
        const projectDate = new Date(project.projectDate);
        return projectDate >= startDate && projectDate <= endDate;
      });
    }
    setFilteredProjects(filtered);
  }, [filter, startDate, endDate, projects]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date, name) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        const confirmUpdate = window.confirm("Are you sure you want to update this project's production stage?");
        if (confirmUpdate) {
          const response = await fetch(`${API_BASE_URL}/projects/${editingId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...projects.find(p => p.id === editingId), productionStage: editedStage }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const updatedProjects = projects.map((project) =>
            project.id === editingId ? { ...project, productionStage: editedStage } : project
          );
          setProjects(updatedProjects);
          setFilteredProjects(updatedProjects);
          setEditingId(null);
          setEditedStage('');
          showAlert('Project updated successfully!', 'success');
        }
      } else {
        const newProject = { ...formData, id: self.crypto.randomUUID() };
        const response = await fetch(`${API_BASE_URL}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProject),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const updatedProjects = [...projects, newProject];
        setProjects(updatedProjects);
        setFilteredProjects(updatedProjects);
        showAlert('Project created successfully!', 'success');
      }

      setFormData({
        projectNo: '',
        customerName: '',
        projectDate: new Date(),
        targetDate: new Date(),
        productionStage: '',
        remarks: '',
      });
    } catch (error) {
      console.error("Error saving project:", error);
      showAlert('Error saving project.', 'error');
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setEditedStage(project.productionStage); // Set the stage for editing
    setFormData({
        ...project,
        projectDate: new Date(project.projectDate),
        targetDate: new Date(project.targetDate),
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this project?");
    if (confirmDelete) {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const updatedProjects = projects.filter((project) => project.id !== id);
        setProjects(updatedProjects);
        setFilteredProjects(updatedProjects);
        showAlert('Project deleted successfully!', 'success');
      } catch (error) {
        console.error("Error deleting project:", error);
        showAlert('Error deleting project.', 'error');
      }
    }
  };
  
  const handleCancel = () => {
    setEditingId(null);
    setEditedStage(''); // Reset edited stage
    setFormData({
        projectNo: '',
        customerName: '',
        projectDate: new Date(),
        targetDate: new Date(),
        productionStage: '',
        remarks: '',
      });
  }

  return (
    <div className="page-container">
      <h2>Project List</h2>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
            <div className="form-grid">
                <div className="form-group">
                    <label>Project No</label>
                    <input
                    type="text"
                    name="projectNo"
                    value={formData.projectNo}
                    onChange={handleInputChange}
                    placeholder="Enter project number"
                    required
                    />
                </div>
                <div className="form-group">
                    <label>Customer Name</label>
                    <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter customer name"
                    required
                    />
                </div>
                <div className="form-group">
                    <label>Project Date</label>
                    <DatePicker
                    selected={formData.projectDate}
                    onChange={(date) => handleDateChange(date, 'projectDate')}
                    />
                </div>
                <div className="form-group">
                    <label>Target Date</label>
                    <DatePicker
                    selected={formData.targetDate}
                    onChange={(date) => handleDateChange(date, 'targetDate')}
                    />
                </div>
                <div className="form-group">
                    <label>Production Stage</label>
                    <select
                    name="productionStage"
                    value={formData.productionStage}
                    onChange={handleInputChange}
                    required
                    >
                    <option value="">Select Stage</option>
                    {stages.map((stage) => (
                        <option key={stage.id} value={stage.name}>
                        {stage.name}
                        </option>
                    ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Remarks</label>
                    <input
                    type="text"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    placeholder="Enter remarks"
                    />
                </div>
            </div>
          <div className="form-actions">
            <button type="submit">{editingId ? 'Update' : 'Save'}</button>
            {editingId && <button type="button" className='cancel' onClick={handleCancel}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="filter-container">
        <div className="filter-buttons">
            <button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All</button>
            {stages.map((stage) => (
            <button key={stage.id} className={filter === stage.name ? 'active' : ''} onClick={() => setFilter(stage.name)}>
                {stage.name}
            </button>
            ))}
        </div>
        <div className="date-filters">
            <div className="date-filter-group">
                <label htmlFor="startDate">From:</label>
                <DatePicker
                    id="startDate"
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    placeholderText="Start Date"
                    className="date-picker-input"
                />
            </div>
            <div className="date-filter-group">
                <label htmlFor="endDate">To:</label>
                <DatePicker
                    id="endDate"
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    placeholderText="End Date"
                    className="date-picker-input"
                />
            </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Project No</th>
              <th className="customer-name-column">Customer Name</th>
              <th>Project Date</th>
              <th>Target Date</th>
              <th>Production Stage</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project, index) => (
              <tr key={project.id}>
                <td data-label="Sr. No">{index + 1}</td>
                <td data-label="Project No">{project.projectNo}</td>
                <td data-label="Customer Name">{project.customerName}</td>
                <td data-label="Project Date">{new Date(project.projectDate).toLocaleDateString()}</td>
                <td data-label="Target Date">{new Date(project.targetDate).toLocaleDateString()}</td>
                <td data-label="Production Stage">
                  {editingId === project.id ? (
                    <select
                      value={editedStage}
                      onChange={(e) => setEditedStage(e.target.value)}
                    >
                      {stages.map((stage) => (
                        <option key={stage.id} value={stage.name}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    project.productionStage
                  )}
                </td>
                <td data-label="Remarks">{project.remarks}</td>
                <td data-label="Actions" className="actions">
                  {editingId === project.id ? (
                    <>
                      <button onClick={handleSubmit}>Save</button>
                      <button className="cancel" onClick={handleCancel}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(project)}>Edit</button>
                      <button className="delete" onClick={() => handleDelete(project.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectList;
