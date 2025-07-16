import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import Master from './pages/Master';
import ImportExport from './pages/ImportExport';

// This is a test comment to trigger a new build
function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project-list" element={<ProjectList />} />
          <Route path="/master" element={<Master />} />
          <Route path="/import-export" element={<ImportExport />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;