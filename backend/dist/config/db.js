"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATA_DIR = exports.useLocalDB = void 0;
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.useLocalDB = false;
exports.DATA_DIR = path_1.default.join(__dirname, '../../data');
async function connectDB() {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
        console.log('⚠️  No MONGO_URI found in environment config.');
        enableLocalDB();
        return;
    }
    try {
        await mongoose_1.default.connect(mongoURI);
        console.log('✅ Connected to MongoDB successfully.');
    }
    catch (error) {
        console.error('❌ MongoDB Connection failed:', error);
        console.log('⚠️ Switching to Local JSON Database fallback...');
        enableLocalDB();
    }
}
function enableLocalDB() {
    exports.useLocalDB = true;
    console.log('📂 Local JSON Database Fallback Enabled.');
    // Ensure data folder exists
    if (!fs_1.default.existsSync(exports.DATA_DIR)) {
        fs_1.default.mkdirSync(exports.DATA_DIR, { recursive: true });
        console.log(`📁 Created local data directory at: ${exports.DATA_DIR}`);
    }
    // Initialize JSON files if they don't exist
    const files = ['users.json', 'vocabs.json', 'lessons.json', 'progress.json'];
    files.forEach(file => {
        const filePath = path_1.default.join(exports.DATA_DIR, file);
        if (!fs_1.default.existsSync(filePath)) {
            fs_1.default.writeFileSync(filePath, JSON.stringify([], null, 2));
            console.log(`📄 Created initial data file: ${file}`);
        }
    });
}
