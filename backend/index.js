const { poolPromise } = require('./db');
const projectsRouter = require('./routes/projects');
const stagesRouter = require('./routes/stages');

module.exports = async function (context, req) {
    context.log('HTTP trigger function processed a request.');

    const urlPath = req.url.replace(/\/api\//, ''); // Remove /api/ prefix

    try {
        // Initialize poolPromise if not already initialized
        await poolPromise;

        if (urlPath.startsWith('projects')) {
            // Simulate Express-like routing for projects
            await handleExpressRoute(projectsRouter, context, req, urlPath.substring('projects'.length));
        } else if (urlPath.startsWith('stages')) {
            // Simulate Express-like routing for stages
            await handleExpressRoute(stagesRouter, context, req, urlPath.substring('stages'.length));
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

async function handleExpressRoute(router, context, req, subPath) {
    // This is a simplified simulation. A full Express-like routing in Azure Functions
    // would be more complex, potentially involving a custom Express app instance
    // or a more robust routing library.
    // For now, we'll manually match common HTTP methods and pass relevant data.

    const method = req.method.toLowerCase();
    const idMatch = subPath.match(/\/([a-f0-9-]+)$/i); // Matches /<uuid>
    const id = idMatch ? idMatch[1] : null;

    // Mock Express req and res objects
    const mockReq = {
        body: req.body,
        params: { id: id },
        query: req.query,
        url: subPath, // Use subPath for internal routing
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

    // Manually call the appropriate route handler based on method and path
    if (id) {
        // Routes with ID (e.g., GET /projects/{id}, PUT /projects/{id}, DELETE /projects/{id})
        if (method === 'get' && router.get) {
            await router.get(mockReq, mockRes);
        } else if (method === 'put' && router.put) {
            await router.put(mockReq, mockRes);
        } else if (method === 'delete' && router.delete) {
            await router.delete(mockReq, mockRes);
        } else {
            mockRes.status(404).send('Not Found');
        }
    } else {
        // Routes without ID (e.g., GET /projects, POST /projects)
        if (method === 'get' && router.get) {
            await router.get(mockReq, mockRes);
        } else if (method === 'post' && router.post) {
            await router.post(mockReq, mockRes);
        } else {
            mockRes.status(404).send('Not Found');
        }
    }
}
