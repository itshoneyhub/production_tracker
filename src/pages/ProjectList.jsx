import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios'; // Import axios

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
    owner: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [editedStage, setEditedStage] = useState('');
  const [projectNoError, setProjectNoError] = useState('');
  const [filter, setFilter] = useState('All');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 25;

  // Function to fetch projects from the backend
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      setProjects(response.data);
      setFilteredProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      showAlert('Error fetching projects.', 'error');
    }
  };

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
    fetchProjects();
    fetchStages();
  }, []); // Fetch data on component mount

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
    setCurrentPage(1); // Reset to first page on filter change
  }, [filter, startDate, endDate, projects]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'projectNo') {
      const isDuplicate = projects.some(p => p.projectNo.trim() === value.trim() && p.id !== editingId);
      if (isDuplicate) {
        setProjectNoError('Project is already available in the List.');
      } else {
        setProjectNoError('');
      }
    }
  };

  const handleDateChange = (date, name) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleSubmit = async (e) => { // Made async
    e.preventDefault();

    const projectNoTrimmed = formData.projectNo.trim();
    if (!projectNoTrimmed) {
        showAlert('Project No cannot be empty.', 'error');
        return;
    }

    if (editingId) {
      // When editing, check for duplicates excluding the current project
      const isDuplicate = projects.some(p => p.id !== editingId && p.projectNo.trim() === projectNoTrimmed);
      if (isDuplicate) {
        showAlert('Project is already available in the List.', 'error');
        return;
      }

      const confirmUpdate = window.confirm("Are you sure you want to update this project?");
      if (confirmUpdate) {
        try {
          await axios.put(`${API_BASE_URL}/projects/${editingId}`, { 
            ...formData, 
            projectNo: projectNoTrimmed, 
            productionStage: editedStage // Use editedStage for update
          });
          showAlert('Project updated successfully!', 'success');
          fetchProjects(); // Re-fetch projects to update the list
        } catch (error) {
          console.error('Error updating project:', error);
          showAlert('Error updating project.', 'error');
        } finally {
          setEditingId(null);
          setEditedStage('');
        }
      }
    } else {
      // When adding, check all projects for duplicates
      const isDuplicate = projects.some(project => project.projectNo.trim() === projectNoTrimmed);
      if (isDuplicate) {
        showAlert('Project is already available in the List.', 'error');
        return;
      }
      try {
        await axios.post(`${API_BASE_URL}/projects`, { ...formData, projectNo: projectNoTrimmed });
        showAlert('Project created successfully!', 'success');
        fetchProjects(); // Re-fetch projects to update the list
      } catch (error) {
        console.error('Error creating project:', error);
        showAlert('Error creating project.', 'error');
      }
    }

    setFormData({
      projectNo: '',
      customerName: '',
      projectDate: new Date(),
      targetDate: new Date(),
      productionStage: '',
      remarks: '',
      owner: '',
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

  const handleDelete = async (id) => { // Made async
    const confirmDelete = window.confirm("Are you sure you want to delete this project?");
    if (confirmDelete) {
      try {
        await axios.delete(`${API_BASE_URL}/projects/${id}`);
        showAlert('Project deleted successfully!', 'success');
        fetchProjects(); // Re-fetch projects to update the list
      } catch (error) {
        console.error('Error deleting project:', error);
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
        owner: '',
      });
  }

  const lastRecordIndex = currentPage * recordsPerPage;
  const firstRecordIndex = lastRecordIndex - recordsPerPage;
  const currentRecords = filteredProjects.slice(firstRecordIndex, lastRecordIndex);

  const nPages = Math.ceil(filteredProjects.length / recordsPerPage);

  const changePage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= nPages) {
      setCurrentPage(pageNumber);
    }
  };

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
                    {projectNoError && <p style={{ color: 'red' }}>{projectNoError}</p>}
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
                    <label>Owner</label>
                    <input
                    type="text"
                    name="owner"
                    value={formData.owner}
                    onChange={handleInputChange}
                    placeholder="Enter owner name"
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
          <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
            {editingId ? (
              <>
                <button type="submit">Save</button>
                <button type="button" className='cancel' onClick={handleCancel}>Cancel</button>
              </>
            ) : (
              <button type="submit" className="add-button">+ Add</button>
            )}
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
                />
            </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="sr-no-column">Sr. No</th>
              <th className="project-no-column">Project No</th>
              <th className="customer-name-column">Customer Name</th>
              <th className="owner-column">Owner</th>
              <th className="project-date-column">Project Date</th>
              <th className="target-date-column">Target Date</th>
              <th className="production-stage-column">Production Stage</th>
              <th className="remarks-column">Remarks</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((project, index) => (
              <tr key={project.id}>
                <td data-label="Sr. No" className="text-center">{firstRecordIndex + index + 1}</td>
                <td data-label="Project No">{project.projectNo}</td>
                <td data-label="Customer Name">{project.customerName}</td>
                <td data-label="Owner">{project.owner}</td>
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

      {nPages > 1 && (
        <div className="pagination">
          <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          {[...Array(nPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => changePage(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </button>
          ))}
          <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === nPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
