"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localDb = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
exports.localDb = {
    readData(filename) {
        const filePath = path_1.default.join(db_1.DATA_DIR, filename);
        try {
            if (!fs_1.default.existsSync(filePath)) {
                fs_1.default.writeFileSync(filePath, JSON.stringify([], null, 2));
                return [];
            }
            const raw = fs_1.default.readFileSync(filePath, 'utf-8');
            return JSON.parse(raw);
        }
        catch (e) {
            console.error(`Error reading ${filename}:`, e);
            return [];
        }
    },
    writeData(filename, data) {
        const filePath = path_1.default.join(db_1.DATA_DIR, filename);
        try {
            fs_1.default.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        }
        catch (e) {
            console.error(`Error writing ${filename}:`, e);
        }
    },
    // Helper getters/setters for collections
    getCollection(name) {
        return this.readData(`${name}.json`);
    },
    saveCollection(name, data) {
        this.writeData(`${name}.json`, data);
    }
};
