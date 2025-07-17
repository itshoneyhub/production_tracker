import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import Master from './pages/Master';
import ImportExport from './pages/ImportExport';
import LoginPage from './pages/LoginPage';
import AlertMessage from './components/AlertMessage'; // Import AlertMessage

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((message, type) => {
    setAlert({ message, type });
    // Alert will auto-dismiss via its internal timer
  }, []);

  useEffect(() => {
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    if (storedLoginStatus === 'true') {
      setLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    showAlert('Login Successful!', 'success');
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    showAlert('You have been logged out.', 'info');
  };

  return (
    <Router>
      <AlertMessage message={alert?.message} type={alert?.type} onDismiss={() => setAlert(null)} />
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
              <Route path="/project-list" element={<ProjectList showAlert={showAlert} />} />
              <Route path="/master" element={<Master showAlert={showAlert} />} />
              <Route path="/import-export" element={<ImportExport showAlert={showAlert} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </>
      )}
    </Router>
  );
}

export default App;