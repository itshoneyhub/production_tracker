const { poolPromise } = require('./db');
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('./routes/projects');
const { getStages, getStageById, createStage, updateStage, deleteStage } = require('./routes/stages');

module.exports = async function (context, req) {
    context.log('HTTP trigger function processed a request.');

    const urlPath = req.url.replace(/\/api\//, ''); // Remove /api/ prefix

    try {
        // Initialize poolPromise if not already initialized
        await poolPromise;

        const method = req.method.toLowerCase();
        const idMatch = urlPath.match(/\/([a-f0-9-]+)$/i); // Matches /<uuid>
        const id = idMatch ? idMatch[1] : null;

        const mockReq = {
            body: req.body,
            params: { id: id },
            query: req.query,
            url: urlPath,
            method: req.method
        };

        const mockRes = {
            status: function (statusCode) {
                this.statusCode = statusCode;
                return this;
            },
            send: function (body) {
                this.body = body;
                context.res = {
                    status: this.statusCode || 200,
                    body: this.body
                };
            },
            json: function (body) {
                this.body = body;
                context.res = {
                    status: this.statusCode || 200,
                    body: this.body
                };
            }
        };

        if (urlPath.startsWith('projects')) {
            if (id) {
                if (method === 'get') {
                    await getProjectById(mockReq, mockRes);
                } else if (method === 'put') {
                    await updateProject(mockReq, mockRes);
                } else if (method === 'delete') {
                    await deleteProject(mockReq, mockRes);
                } else {
                    mockRes.status(404).send('Not Found');
                }
            } else {
                if (method === 'get') {
                    await getProjects(mockReq, mockRes);
                } else if (method === 'post') {
                    await createProject(mockReq, mockRes);
                } else {
                    mockRes.status(404).send('Not Found');
                }
            }
        } else if (urlPath.startsWith('stages')) {
            if (id) {
                if (method === 'get') {
                    await getStageById(mockReq, mockRes);
                } else if (method === 'put') {
                    await updateStage(mockReq, mockRes);
                } else if (method === 'delete') {
                    await deleteStage(mockReq, mockRes);
                } else {
                    mockRes.status(404).send('Not Found');
                }
            } else {
                if (method === 'get') {
                    await getStages(mockReq, mockRes);
                } else if (method === 'post') {
                    await createStage(mockReq, mockRes);
                } else {
                    mockRes.status(404).send('Not Found');
                }
            }
        } else if (urlPath.startsWith('test-db')) {
        } else if (urlPath.startsWith('test-db')) {
            // Handle test-db endpoint
            try {
                const pool = await poolPromise;
                const result = await pool.request().query('SELECT 1 AS number');
                context.res = {
                    status: 200,
                    body: result.recordset
                };
            } catch (err) {
                context.log.error('Database connection error:', err);
                context.res = {
                    status: 500,
                    body: { message: err.message }
                };
            }
        } else {
            context.res = {
                status: 404,
                body: "Not Found"
            };
        }
    } catch (error) {
        context.log.error('Error processing request:', error);
        context.res = {
            status: 500,
            body: { message: 'An unexpected error occurred on the server.' }
        };
    }
};


