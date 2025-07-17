const sql = require('mssql');
const config = {
  user: process.env.DB_USER || 'HANUMANT',
  password: process.env.DB_PASSWORD || 'Pravin@123',
  server: process.env.DB_SERVER || 'DESKTOP-AMHGFBV\\SQLEXPRESS', // You may need to escape backslashes
  database: process.env.DB_DATABASE || 'productionTrackerdb',
  options: {
    encrypt: false, // Use true for Azure SQL Database, false for local SQL Server
    trustServerCertificate: true // Change to true for local dev / self-signed certs
  }
};

async function migrateData() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to SQL Server for migration.');

        // --- Migrate Projects ---
        const projectsData = JSON.parse(localStorage.getItem('projects')) || [];
        if (projectsData.length > 0) {
            const transaction = new sql.Transaction(pool);
            await transaction.begin();
            try {
                for (const project of projectsData) {
                    await transaction.request()
                        .input('id', sql.NVarChar, project.id || self.crypto.randomUUID())
                        .input('projectNo', sql.NVarChar, project.projectNo)
                        .input('customerName', sql.NVarChar, project.customerName)
                        .input('projectDate', sql.Date, new Date(project.projectDate))
                        .input('targetDate', sql.Date, new Date(project.targetDate))
                        .input('productionStage', sql.NVarChar, project.productionStage)
                        .input('remarks', sql.NVarChar, project.remarks)
                        .query('INSERT INTO Projects (id, projectNo, customerName, projectDate, targetDate, productionStage, remarks) VALUES (@id, @projectNo, @customerName, @projectDate, @targetDate, @productionStage, @remarks)');
                }
                await transaction.commit();
                console.log(`Migrated ${projectsData.length} projects.`);
            } catch (err) {
                await transaction.rollback();
                console.error('Project migration failed:', err);
            }
        } else {
            console.log('No projects found in localStorage to migrate.');
        }

        // --- Migrate Stages ---
        const stagesData = JSON.parse(localStorage.getItem('stages')) || [];
        if (stagesData.length > 0) {
            const transaction = new sql.Transaction(pool);
            await transaction.begin();
            try {
                for (const stage of stagesData) {
                    await transaction.request()
                        .input('id', sql.NVarChar, stage.id || self.crypto.randomUUID())
                        .input('name', sql.NVarChar, stage.name)
                        .input('remarks', sql.NVarChar, stage.remarks)
                        .query('INSERT INTO Stages (id, name, remarks) VALUES (@id, @name, @remarks)');
                }
                await transaction.commit();
                console.log(`Migrated ${stagesData.length} stages.`);
            } catch (err) {
                await transaction.rollback();
                console.error('Stage migration failed:', err);
            }
        } else {
            console.log('No stages found in localStorage to migrate.');
        }

    } catch (err) {
        console.error('Database connection for migration failed:', err);
    } finally {
        sql.close();
    }
}

migrateData();
