import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import Master from './pages/Master';
import ImportExport from './pages/ImportExport';
import LoginPage from './pages/LoginPage'; // Import the new LoginPage component

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is already logged in (e.g., from a previous session)
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    if (storedLoginStatus === 'true') {
      setLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  return (
    <Router>
      {!loggedIn ? (
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <>
          <Navbar onLogout={handleLogout} />
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/project-list" element={<ProjectList />} />
              <Route path="/master" element={<Master />} />
              <Route path="/import-export" element={<ImportExport />} />
              <Route path="*" element={<Navigate to="/" />} /> {/* Redirect any unknown paths to dashboard */}
            </Routes>
          </div>
        </>
      )}
    </Router>
  );
}

export default App;