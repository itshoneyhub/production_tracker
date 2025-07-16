import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState(null);

  useEffect(() => {
    const storedProjects = JSON.parse(localStorage.getItem('projects')) || [];
    setProjects(storedProjects);
    const storedStages = JSON.parse(localStorage.getItem('stages')) || [];
    setStages(storedStages.map(s => ({...s, name: s.name.trim()})));

    const handleStorageChange = () => {
        const storedProjects = JSON.parse(localStorage.getItem('projects')) || [];
        setProjects(storedProjects);
        const storedStages = JSON.parse(localStorage.getItem('stages')) || [];
        setStages(storedStages.map(s => ({...s, name: s.name.trim()})));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
          <table>
            <thead>
              <tr>
                <th>Project No</th>
                <th>Customer Name</th>
                <th>Project Date</th>
              </tr>
            </thead>
            <tbody>
              {projectsToShow.map((project) => (
                <tr key={project.id}>
                  <td>{project.projectNo}</td>
                  <td>{project.customerName}</td>
                  <td>{new Date(project.projectDate).toLocaleDateString()}</td>
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
            <Bar dataKey="count" fill="#8884d8" onClick={(data) => handleCardClick(data.name)} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
