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
    productionStart: new Date(),
    productionStage: '',
    productionComplete: new Date(),
    remarks: '',
  });
  const [editingId, setEditingId] = useState(null);
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
      const updatedProjects = projects.map((project) =>
        project.id === editingId ? { ...formData, id: editingId } : project
      );
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      setEditingId(null);
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
      productionStart: new Date(),
      productionStage: '',
      productionComplete: new Date(),
      remarks: '',
    });
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({
        ...project,
        projectDate: new Date(project.projectDate),
        targetDate: new Date(project.targetDate),
        productionStart: new Date(project.productionStart),
        productionComplete: new Date(project.productionComplete),
    });
  };

  const handleDelete = (id) => {
    const updatedProjects = projects.filter((project) => project.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };
  
  const handleCancel = () => {
    setEditingId(null);
    setFormData({
        projectNo: '',
        customerName: '',
        projectDate: new Date(),
        targetDate: new Date(),
        productionStart: new Date(),
        productionStage: '',
        productionComplete: new Date(),
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
                    <label>Production Start</label>
                    <DatePicker
                    selected={formData.productionStart}
                    onChange={(date) => handleDateChange(date, 'productionStart')}
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
                    <label>Production Complete</label>
                    <DatePicker
                    selected={formData.productionComplete}
                    onChange={(date) => handleDateChange(date, 'productionComplete')}
                    />
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
            <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
            />
            <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                placeholderText="End Date"
            />
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
              <th>Production Start</th>
              <th>Production Stage</th>
              <th>Production Complete</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project, index) => (
              <tr key={project.id}>
                <td>{index + 1}</td>
                <td>{project.projectNo}</td>
                <td>{project.customerName}</td>
                <td>{new Date(project.projectDate).toLocaleDateString()}</td>
                <td>{new Date(project.targetDate).toLocaleDateString()}</td>
                <td>{new Date(project.productionStart).toLocaleDateString()}</td>
                <td>{project.productionStage}</td>
                <td>{new Date(project.productionComplete).toLocaleDateString()}</td>
                <td>{project.remarks}</td>
                <td className="actions">
                  <button onClick={() => handleEdit(project)}>Edit</button>
                  <button className="delete" onClick={() => handleDelete(project.id)}>Delete</button>
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
