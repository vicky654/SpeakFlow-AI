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
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite development ports
    credentials: true
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/vocab', vocab_1.default);
app.use('/api/learning', learning_1.default);
app.use('/api/gamification', gamification_1.default);
app.use('/api/admin', admin_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Start Server
async function startServer() {
    // Connect to Database
    await (0, db_1.connectDB)();
    // Seed Database with initial mock content
    await (0, seed_1.seedInitialData)();
    app.listen(PORT, () => {
        console.log(`🚀 SpeakFlow AI Server is running on http://localhost:${PORT}`);
    });
}
startServer();
