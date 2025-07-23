import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios'; // Import axios

const API_BASE_URL = 'http://localhost:5000/api'; // Your backend API base URL

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState(null);

  // Function to fetch projects from the backend
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Function to fetch stages from the backend
  const fetchStages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stages`);
      setStages(response.data.map(s => ({...s, name: s.name.trim()})));
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchStages();
  }, []); // Fetch data on component mount

  const getStageCount = (stageName) => {
    return projects.filter((project) => project.productionStage.trim() === stageName).length;
  };

  const handleCardClick = (stageName) => {
    setSelectedStage(prev => (prev === stageName ? null : stageName));
  };

  const projectsToShow = 
    selectedStage === 'All'
    ? projects
    : selectedStage
    ? projects.filter((project) => project.productionStage === selectedStage)
    : [];

  const chartData = stages.map((stage) => ({
    name: stage.name,
    count: getStageCount(stage.name),
  }));

  return (
    <div className="page-container">
      <h2>Dashboard</h2>
      <div className="dashboard-metrics">
        <div className="metric-card" onClick={() => handleCardClick('All')}>
          <h3>Total Projects</h3>
          <p>{projects.length}</p>
        </div>
        {stages.map((stage) => (
          <div key={stage.id} className="metric-card" onClick={() => handleCardClick(stage.name)}>
            <h3>{stage.name}</h3>
            <p>{getStageCount(stage.name)}</p>
          </div>
        ))}
      </div>

      {selectedStage && (
        <div className="table-container">
            <h3>{selectedStage === 'All' ? 'All Projects' : `${selectedStage} Projects`}</h3>
          <table className="dashboard-details-table">
            <thead>
              <tr>
                <th>Project No</th>
                <th>Customer Name</th>
                <th>Owner</th>
                <th>Project Date</th>
                <th>Target Date</th>
              </tr>
            </thead>
            <tbody>
              {projectsToShow.map((project) => (
                <tr key={project.id}>
                  <td>{project.projectNo}</td>
                  <td>{project.customerName}</td>
                  <td>{project.owner}</td>
                  <td>{new Date(project.projectDate).toLocaleDateString()}</td>
                  <td>{new Date(project.targetDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="chart-container">
        <h3>Monthly Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" barSize={40} onClick={(data) => handleCardClick(data.name)} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;