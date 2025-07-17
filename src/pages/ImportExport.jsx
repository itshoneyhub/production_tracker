import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../authConfig';
import { Client } from '@microsoft/microsoft-graph-client';

const ImportExport = () => {
  const [message, setMessage] = useState(null);
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
      setMessage({ type: 'success', text: 'Logged in successfully!' });
    } catch (error) {
      console.error("Login Error:", error);
      setMessage({ type: 'error', text: 'Login failed. Please try again. Check the console for details.' });
    }
  };

  const handleFileLinkChange = (e) => {
    setFileLink(e.target.value);
  };

  const handleImportFromTeams = async () => {
    if (!graphClient) {
      setMessage({ type: 'error', text: 'Please log in first.' });
      return;
    }
    if (!fileLink) {
      setMessage({ type: 'error', text: 'Please provide a file link.' });
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
        setMessage({ type: 'error', text: 'The file is empty.' });
        return;
      }

      const headers = jsonData[0];
      const importedProjects = jsonData.slice(1).map((row) => {
        const project = {};
        headers.forEach((header, index) => {
          project[header] = row[index];
        });
        return project;
      });

      const existingProjects = JSON.parse(localStorage.getItem('projects')) || [];
      const mergedProjects = [...existingProjects, ...importedProjects.map(p => ({...p, id: self.crypto.randomUUID()}))];
      localStorage.setItem('projects', JSON.stringify(mergedProjects));

      setMessage({ type: 'success', text: 'Projects imported successfully!' });
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error("Import from Teams Error:", error);
      setMessage({ type: 'error', text: 'Error importing file from Teams. Check console for details.' });
    }
  };

  const handleExport = () => {
    const headers = [
      'Project No',
      'Customer Name',
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

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { cellDates: true });

        if (jsonData.length === 0) {
          setMessage({ type: 'error', text: 'The file is empty or has no data.' });
          return;
        }

        const importedProjects = jsonData.map(row => ({
            id: self.crypto.randomUUID(),
            projectNo: row['Project No'] || '',
            customerName: row['Customer Name'] || '',
            projectDate: row['Project Date'] instanceof Date ? row['Project Date'] : new Date(),
            targetDate: row['Target Date'] instanceof Date ? row['Target Date'] : new Date(),
            productionStage: row['Production Stage'] || '',
            remarks: row['Remarks'] || '',
        }));

        const existingProjects = JSON.parse(localStorage.getItem('projects')) || [];
        const mergedProjects = [...existingProjects, ...importedProjects];
        localStorage.setItem('projects', JSON.stringify(mergedProjects));

        setMessage({ type: 'success', text: 'Projects imported successfully!' });
        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        console.error("Import Error:", error);
        setMessage({ type: 'error', text: 'Error importing file. Please check the file format and data.' });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="page-container">
      <h2>Import/Export</h2>
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
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
