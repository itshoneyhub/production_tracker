import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ProjectList = () => {
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
    const storedProjects = JSON.parse(localStorage.getItem('projects')) || [];
    setProjects(storedProjects);
    setFilteredProjects(storedProjects);
    const storedStages = JSON.parse(localStorage.getItem('stages')) || [];
    setStages(storedStages);
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      const confirmUpdate = window.confirm("Are you sure you want to update this project's production stage?");
      if (confirmUpdate) {
        const updatedProjects = projects.map((project) =>
          project.id === editingId ? { ...project, productionStage: editedStage } : project
        );
        setProjects(updatedProjects);
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        setEditingId(null);
        setEditedStage('');
      }
    } else {
      const newProject = { ...formData, id: self.crypto.randomUUID() };
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }

    setFormData({
      projectNo: '',
      customerName: '',
      projectDate: new Date(),
      targetDate: new Date(),
      productionStage: '',
      remarks: '',
    });
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

  const handleDelete = (id) => {
    const updatedProjects = projects.filter((project) => project.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
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
