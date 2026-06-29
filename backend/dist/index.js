"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const seed_1 = require("./config/seed");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const vocab_1 = __importDefault(require("./routes/vocab"));
const learning_1 = __importDefault(require("./routes/learning"));
const gamification_1 = __importDefault(require("./routes/gamification"));
const admin_1 = __importDefault(require("./routes/admin"));
// 1. Load Environment Variables first
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Allowed Origins for CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://speak-flow-ai-89xe.vercel.app',
    'https://speakflow-ai.vercel.app',
    /^https:\/\/speak-flow-ai.*\.vercel\.app$/, // matches Vercel preview deploys for speak-flow-ai
    /^https:\/\/speakflow.*\.vercel\.app$/, // matches Vercel preview deploys for speakflow
    /^https:\/\/.*\.vercel\.app$/ // fallback to allow any vercel.app subdomain
];
// CORS Options
const corsOptions = {
    origin: (origin, callback) => {
        // Print incoming origin as required by Task 8
        console.log(`[CORS Audit] Incoming Origin: ${origin || 'No Origin (Direct/Local)'}`);
        // Allow requests with no origin (like curl, mobile apps, local testing, Render health checks)
        if (!origin) {
            return callback(null, true);
        }
        const isAllowed = allowedOrigins.some(pattern => {
            if (typeof pattern === 'string') {
                return pattern === origin;
            }
            return pattern.test(origin);
        });
        if (isAllowed) {
            return callback(null, true);
        }
        // Also support FRONTEND_URL env var if set
        if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
            return callback(null, true);
        }
        callback(new Error(`CORS Error: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
};
// 2. CORS Middleware
app.use((0, cors_1.default)(corsOptions));
// 3. Handle OPTIONS preflight requests globally
app.options('*', (0, cors_1.default)(corsOptions));
// 4. Request Logging Middleware (logs incoming requests and origin)
app.use((req, res, next) => {
    console.log(`[HTTP Request] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'None'}`);
    next();
});
// 5. Body Parser Middleware
app.use(express_1.default.json());
// 6. Mount Routes (prefixed with /api as configured in frontend stores)
app.use('/api/auth', auth_1.default);
app.use('/api/vocab', vocab_1.default);
app.use('/api/learning', learning_1.default);
app.use('/api/gamification', gamification_1.default);
app.use('/api/admin', admin_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 7. Global 404 Route handler
app.use((req, res) => {
    res.status(404).json({
        error: 'NotFound',
        message: `API Route ${req.method} ${req.url} not found`
    });
});
// 8. Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error('[Error Middleware] Catastrophic request error:', err);
    res.status(err.status || 500).json({
        error: err.name || 'InternalServerError',
        message: err.message || 'An unexpected error occurred on the server'
    });
});
function printRoutes(app) {
    console.log("=== REGISTERED ROUTE MAP ===");
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) { // routes registered directly on the app
            const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
            routes.push(`${methods} ${middleware.route.path}`);
        }
        else if (middleware.name === 'router') { // router middleware
            const baseUrl = middleware.regexp.source
                .replace('\\/?', '')
                .replace('(?=\\/|$)', '')
                .replace('^\\', '')
                .replace('\\', '');
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
                    routes.push(`${methods} ${baseUrl}${handler.route.path}`);
                }
            });
        }
    });
    routes.forEach(r => console.log(`👉 ${r}`));
    console.log("============================");
}
// Start Server
async function startServer() {
    // Connect to Database
    await (0, db_1.connectDB)();
    // Seed Database with initial mock content
    await (0, seed_1.seedInitialData)();
    app.listen(PORT, () => {
        console.log(`🚀 SpeakFlow AI Server is running on http://localhost:${PORT}`);
        printRoutes(app);
    });
}
startServer();
