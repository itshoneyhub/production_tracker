import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../authConfig';
import { Client } from '@microsoft/microsoft-graph-client';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4
import axios from 'axios'; // Import axios

const API_BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || '/api';

import { useNavigate } from 'react-router-dom';

const ImportExport = ({ showAlert }) => {
  const navigate = useNavigate();
  
  const [msalInstance] = useState(new PublicClientApplication(msalConfig));
  const [graphClient, setGraphClient] = useState(null);
  const [fileLink, setFileLink] = useState('');

  useEffect(() => {
    msalInstance.initialize();
  }, [msalInstance]);

  const handleLogin = async () => {
    try {
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      const accessToken = loginResponse.accessToken;
      const client = Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        },
      });
      setGraphClient(client);
      showAlert('Logged in successfully!', 'success');
    } catch (error) {
      console.error("Login Error:", error);
      showAlert('Login failed. Please try again. Check the console for details.', 'error');
    }
  };

  const handleFileLinkChange = (e) => {
    setFileLink(e.target.value);
  };

  const handleImportFromTeams = async () => {
    if (!graphClient) {
      showAlert('Please log in first.', 'error');
      return;
    }
    if (!fileLink) {
      showAlert('Please provide a file link.', 'error');
      return;
    }

    try {
        let cleanLink = fileLink;
        if (cleanLink.includes('?')) {
            cleanLink = cleanLink.split('?')[0];
        }
        // URL-safe base64 encoding
        const base64Value = btoa(cleanLink);
        const safeBase64Value = base64Value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const encodedUrl = safeBase64Value;

        const driveItem = await graphClient.api(`/shares/${encodedUrl}/driveItem`).get();
        const workbook = await graphClient.api(`/drives/${driveItem.parentReference.driveId}/items/${driveItem.id}/workbook/worksheets('Sheet1')/usedRange`).get();
        const jsonData = workbook.values;

      if (jsonData.length < 2) {
        showAlert('The file is empty.', 'error');
        return;
      }

      const headers = jsonData[0];
      const importedProjects = jsonData.slice(1).map((row) => {
        const project = {};
        headers.forEach((header, index) => {
          if (header === 'Project Date' || header === 'Target Date') {
            project[header] = row[index] ? new Date(row[index]) : null;
          } else {
            project[header] = row[index];
          }
        });
        return project;
      });

      // Send each imported project to the backend
      for (const project of importedProjects) {
        try {
          await axios.post(`${API_BASE_URL}/projects`, { ...project, id: uuidv4() });
          showAlert(`Project ${project.projectNo} imported successfully!`, 'success');
        } catch (error) {
          console.error(`Error importing project ${project.projectNo}:`, error);
          showAlert(`Error importing project ${project.projectNo}. Check console for details.`, 'error');
        }
      }
      navigate('/');

    } catch (error) {
      console.error("Import from Teams Error:", error);
      showAlert('Error importing file from Teams. Check console for details.', 'error');
    }
  };

  const handleExport = () => {
    const headers = [
      'Project No',
      'Customer Name',
      'Owner',
      'Project Date',
      'Target Date',
      'Production Stage',
      'Remarks',
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projects');
    XLSX.writeFile(wb, 'Project_Template.xlsx');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      showAlert('No file selected.', 'info');
      return;
    }

    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
      });

      const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { cellDates: true });

      if (jsonData.length === 0) {
        showAlert('The file is empty or has no data.', 'error');
        return;
      }

      const importedProjects = jsonData.map(row => ({
          id: uuidv4(),
          projectNo: row['Project No'] || '',
          customerName: row['Customer Name'] || '',
          owner: row['Owner'] || '',
          projectDate: row['Project Date'] ? new Date(row['Project Date']) : null,
          targetDate: row['Target Date'] ? new Date(row['Target Date']) : null,
          productionStage: row['Production Stage'] || '',
          remarks: row['Remarks'] || '',
      }));

      // Send each imported project to the backend
      for (const project of importedProjects) {
        try {
          await axios.post(`${API_BASE_URL}/projects`, project);
          showAlert(`Project ${project.projectNo} imported successfully!`, 'success');
        } catch (error) {
          console.error(`Error importing project ${project.projectNo}:`, error);
          showAlert('Error importing project ' + (project.projectNo || 'unknown') + '. Check console for details.', 'error');
        }
      }
      navigate('/');

    } catch (error) {
      console.error("Import Error:", error);
      showAlert('Error importing file. Please check the file format and data.', 'error');
    }
  };

  return (
    <div className="page-container">
      <h2>Import/Export</h2>
      <div className="import-export-container">
        <div className="export-section">
          <h3>Export Template</h3>
          <p>Download the Excel template to import projects.</p>
          <button onClick={handleExport}>Download Template</button>
        </div>
        <div className="import-section">
          <h3>Import Projects from your computer</h3>
          <p>Upload an Excel file to import projects.</p>
          <input type="file" accept=".xlsx, .xls" onChange={handleImport} />
        </div>
        <div className="import-section">
          <h3>Import Projects from Teams/SharePoint</h3>
          <p>Log in to Microsoft 365 to import an Excel file from a shared link.</p>
          {!graphClient ? (
            <button onClick={handleLogin}>Login to Microsoft 365</button>
          ) : (
            <div>
              <input
                type="text"
                placeholder="Paste the SharePoint/Teams file link here"
                value={fileLink}
                onChange={handleFileLinkChange}
              />
              <button onClick={handleImportFromTeams}>Import from Link</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExport;