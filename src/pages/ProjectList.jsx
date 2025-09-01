import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios'; // Import axios
import * as XLSX from 'xlsx'; // Import xlsx

const API_BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || '/api';

import Modal from '../components/Modal';

const ProjectList = ({ showAlert }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [stages, setStages] = useState([]);
  const [formData, setFormData] = useState({
    projectNo: '',
    projectName: '',
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
  const [projectNoFilter, setProjectNoFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [dispatchMonthFilter, setDispatchMonthFilter] = useState('');

  // Calculate current fiscal year start and end dates
  const getFiscalYearDates = () => {
    const today = new Date();
    let fiscalYearStart = new Date(today.getFullYear(), 3, 1); // April 1st
    let fiscalYearEnd = new Date(today.getFullYear() + 1, 2, 31); // March 31st of next year

    if (today.getMonth() < 3) { // If current month is Jan, Feb, or Mar
      fiscalYearStart = new Date(today.getFullYear() - 1, 3, 1);
      fiscalYearEnd = new Date(today.getFullYear(), 2, 31);
    }
    return { fiscalYearStart, fiscalYearEnd };
  };

  const { fiscalYearStart, fiscalYearEnd } = getFiscalYearDates();
  const [startDate, setStartDate] = useState(fiscalYearStart);
  const [endDate, setEndDate] = useState(fiscalYearEnd);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 25;

  // Function to fetch projects from the backend
  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      setProjects(response.data);
      setFilteredProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      showAlert('Error fetching projects.', 'error');
    }
  }, [showAlert]);

  const fetchStages = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stages`);
      setStages(response.data);
    } catch (error) {
      console.error("Error fetching stages:", error);
      showAlert('Error fetching stages.', 'error');
    }
  }, [showAlert]);

  useEffect(() => {
    fetchProjects();
    fetchStages();
  }, [fetchProjects, fetchStages]); // Fetch data on component mount

  useEffect(() => {
    let filtered = projects;
    if (filter !== 'All') {
      filtered = filtered.filter((project) => project.productionstage === filter);
    }
    if (startDate && endDate) {
      filtered = filtered.filter((project) => {
        const projectDate = new Date(project.projectdate);
        return projectDate >= startDate && projectDate <= endDate;
      });
    }
    if (projectNoFilter) {
      filtered = filtered.filter((project) =>
        project.projectno.toLowerCase().includes(projectNoFilter.toLowerCase())
      );
    }
    if (customerFilter) {
      filtered = filtered.filter((project) =>
        project.customername.toLowerCase().includes(customerFilter.toLowerCase())
      );
    }
    if (ownerFilter) {
      filtered = filtered.filter((project) =>
        project.owner.toLowerCase().includes(ownerFilter.toLowerCase())
      );
    }
    if (dispatchMonthFilter) {
      filtered = filtered.filter((project) =>
        project.dispatchmonth.toLowerCase().includes(dispatchMonthFilter.toLowerCase())
      );
    }
    setFilteredProjects(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [filter, startDate, endDate, projects, projectNoFilter, customerFilter, ownerFilter, dispatchMonthFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'projectNo') {
      const isDuplicate = projects.some(p => p.projectno.trim() === value.trim() && p.id !== editingId);
      if (isDuplicate) {
        setProjectNoError('Project is already available in the List.');
      } else {
        setProjectNoError('');
      }
    }
  };

  const handleDateChange = (date, name) => {
    const newFormData = { ...formData, [name]: date };

    if (name === 'targetDate') {
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      newFormData.dispatchMonth = `${month} ${year}`;
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const projectNoTrimmed = formData.projectno.trim();
    if (!projectNoTrimmed) {
        showAlert('Project No cannot be empty.', 'error');
        return;
    }

    if (editingId) {
      const isDuplicate = projects.some(p => p.id !== editingId && p.projectno.trim() === projectNoTrimmed);
      if (isDuplicate) {
        showAlert('Project is already available in the List.', 'error');
        return;
      }

      const confirmUpdate = window.confirm("Are you sure you want to update this project?");
      if (confirmUpdate) {
        try {
          const response = await axios.put(`${API_BASE_URL}/projects/${editingId}`, { ...formData, projectNo: projectNoTrimmed });
          setProjects(projects.map((p) =>
            p.id === editingId ? response.data : p
          ));
          showAlert('Project updated successfully!', 'success');
          setEditingId(null);
          setEditedStage('');
        } catch (error) {
          console.error("Error updating project:", error);
          showAlert('Error updating project.', 'error');
        }
      }
    } else {
      const isDuplicate = projects.some(project => project.projectno.trim() === projectNoTrimmed);
      if (isDuplicate) {
        showAlert('Project is already available in the List.', 'error');
        return;
      }
      try {
        const response = await axios.post(`${API_BASE_URL}/projects`, { ...formData, projectNo: projectNoTrimmed });
        setProjects([...projects, response.data]);
        showAlert('Project created successfully!', 'success');
      } catch (error) {
        console.error("Error creating project:", error);
        showAlert('Error creating project.', 'error');
      }
    }

    setFormData({
      projectNo: '',
      projectName: '',
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
    const projectDate = new Date(project.projectdate);
    const targetDate = new Date(project.targetdate);
    let dispatchMonth = project.dispatchmonth;

    // Recalculate dispatchMonth if targetDate exists
    if (targetDate && !isNaN(targetDate.getTime())) {
      const month = targetDate.toLocaleString('default', { month: 'long' });
      const year = targetDate.getFullYear();
      dispatchMonth = `${month} ${year}`;
    }

    setFormData({
        ...project,
        projectDate: projectDate,
        targetDate: targetDate,
        dispatchMonth: dispatchMonth,
    });
    setEditedStage(project.productionstage);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this project?");
    if (confirmDelete) {
      try {
        await axios.delete(`${API_BASE_URL}/projects/${id}`);
        setProjects(projects.filter((project) => project.id !== id));
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
        projectName: '',
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

  const handleDownloadExcel = () => {
    const data = filteredProjects.map(project => ({
      "Sr. No": filteredProjects.indexOf(project) + 1,
      "Project No": project.projectno,
      "Project Name": project.projectname,
      "Customer Name": project.customername,
      "Owner": project.owner,
      "Project Date": new Date(project.projectdate).toLocaleDateString(navigator.language),
      "Target Date": new Date(project.targetdate).toLocaleDateString(navigator.language),
      "Dispatch Month": project.dispatchmonth,
      "Production Stage": project.productionstage,
      "Remarks": project.remarks,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ProjectList");
    XLSX.writeFile(wb, "ProjectList.xlsx");
  };

  return (
    <div className="page-container">
      <h2>Project List</h2>
      <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => setIsModalOpen(true)} className="add-button">+ Add</button>
        <button type="button" onClick={handleDownloadExcel}>Download Excel</button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="form-container">
          <form onSubmit={handleSubmit}>
              <div className="form-grid">
                  <div className="form-group">
                      <label>Project No</label>
                      <input
                      type="text"
                      name="projectNo"
                      value={formData.projectno}
                      onChange={handleInputChange}
                      placeholder="Enter project number"
                      required
                      />
                      {projectNoError && <p style={{ color: 'red' }}>{projectNoError}</p>}
                  </div>
                  <div className="form-group">
                      <label>Project Name</label>
                      <input
                      type="text"
                      name="projectName"
                      value={formData.projectname}
                      onChange={handleInputChange}
                      placeholder="Enter project name"
                      />
                  </div>
                  <div className="form-group">
                      <label>Customer Name</label>
                      <input
                      type="text"
                      name="customerName"
                      value={formData.customername}
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
                      selected={formData.projectdate}
                      onChange={(date) => handleDateChange(date, 'projectDate')}
                      />
                  </div>
                  <div className="form-group">
                      <label>Target Date</label>
                      <DatePicker
                      selected={formData.targetdate}
                      onChange={(date) => handleDateChange(date, 'targetDate')}
                      />
                  </div>
                  <div className="form-group">
                      <label>Dispatch Month</label>
                      <input
                      type="text"
                      name="dispatchMonth"
                      value={formData.dispatchmonth}
                      readOnly
                      />
                  </div>
                  <div className="form-group">
                      <label>Production Stage</label>
                      <select
                      name="productionStage"
                      value={formData.productionstage}
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
                  <button type="submit" style={{ backgroundColor: 'green', color: 'white' }}>Save</button>
                  <button type="button" className='cancel' onClick={handleCancel}>Cancel</button>
                </>
              ) : (
                <>
                  <button type="submit" className="add-button">+ Add</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className='cancel'>Cancel</button>
                </>
              )}
            </div>
          </form>
        </div>
      </Modal>

      <div className="filter-container">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="projectNoFilter">Project No</label>
            <input
              type="text"
              id="projectNoFilter"
              value={projectNoFilter}
              onChange={(e) => setProjectNoFilter(e.target.value)}
              placeholder="Filter by Project No"
              list="projectNoOptions"
            />
            <datalist id="projectNoOptions">
              {[...new Set(projects.map((p) => p.projectno))].map((projectNo) => (
                <option key={projectNo} value={projectNo} />
              ))}
            </datalist>
          </div>
          <div className="filter-group">
            <label htmlFor="customerFilter">Customer</label>
            <input
              type="text"
              id="customerFilter"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              placeholder="Filter by Customer"
              list="customerOptions"
            />
            <datalist id="customerOptions">
              {[...new Set(projects.map((p) => p.customername))].map((customerName) => (
                <option key={customerName} value={customerName} />
              ))}
            </datalist>
          </div>
          <div className="filter-group">
            <label htmlFor="ownerFilter">Owner</label>
            <input
              type="text"
              id="ownerFilter"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              placeholder="Filter by Owner"
              list="ownerOptions"
            />
            <datalist id="ownerOptions">
              {[...new Set(projects.map((p) => p.owner))].map((owner) => (
                <option key={owner} value={owner} />
              ))}
            </datalist>
          </div>
          <div className="filter-group">
            <label htmlFor="dispatchMonthFilter">Dispatch Month</label>
            <select
              id="dispatchMonthFilter"
              value={dispatchMonthFilter}
              onChange={(e) => setDispatchMonthFilter(e.target.value)}
            >
              <option value="">All</option>
              {[...new Set(projects.map((p) => p.dispatchmonth))].map((dispatchMonth) => (
                <option key={dispatchMonth} value={dispatchMonth}>
                  {dispatchMonth}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
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
          <div className="filter-group">
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
        <div className="filter-row">
          <div className="filter-group">
            <label>Production Stage</label>
            <div className="filter-buttons">
              <button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All</button>
              {stages.map((stage) => (
                <button key={stage.id} className={filter === stage.name ? 'active' : ''} onClick={() => setFilter(stage.name)}>
                  {stage.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="sr-no-column">Sr. No</th>
              <th className="project-no-column">Project No</th>
              <th className="project-name-column">Project Name</th>
              <th className="customer-name-column">Customer Name</th>
              <th className="owner-column">Owner</th>
              <th className="project-date-column">Project Date</th>
              <th className="target-date-column">Target Date</th>
              <th className="dispatch-month-column">Dispatch Month</th>
              <th className="production-stage-column">Production Stage</th>
              <th className="remarks-column">Remarks</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((project, index) => (
              <tr key={project.id}>
                <td data-label="Sr. No" className="text-center">{firstRecordIndex + index + 1}</td>
                <td data-label="Project No">{project.projectno}</td>
                <td data-label="Project Name">{project.projectname}</td>
                <td data-label="Customer Name">{project.customername}</td>
                <td data-label="Owner">{project.owner}</td>
                <td data-label="Project Date">{project.projectdate ? new Date(project.projectdate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</td>
                <td data-label="Target Date">{project.targetdate ? new Date(project.targetdate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</td>
                <td data-label="Dispatch Month">{project.dispatchmonth}</td>
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
                    project.productionstage
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