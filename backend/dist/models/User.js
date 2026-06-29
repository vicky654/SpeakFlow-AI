"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const LevelProgressSchema = new mongoose_1.Schema({
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    favorites: { type: [String], default: [] },
    completedLessons: { type: [String], default: [] }
}, { _id: false });
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'job_seeker', 'professional', 'admin'], default: 'student' },
    coins: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActive: { type: String },
    badges: { type: [String], default: [] },
    currentLevelMode: { type: String, enum: ['beginner', 'intermediate', 'professional'], default: 'beginner' },
    levelProgress: {
        beginner: { type: LevelProgressSchema, default: () => ({}) },
        intermediate: { type: LevelProgressSchema, default: () => ({}) },
        professional: { type: LevelProgressSchema, default: () => ({}) }
    },
    createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false, toObject: { virtuals: true }, toJSON: { virtuals: true } });
// Virtuals for legacy fields
UserSchema.virtual('xp').get(function () {
    return this.levelProgress[this.currentLevelMode]?.xp ?? 0;
});
UserSchema.virtual('level').get(function () {
    return this.levelProgress[this.currentLevelMode]?.level ?? 1;
});
UserSchema.virtual('favorites').get(function () {
    return this.levelProgress[this.currentLevelMode]?.favorites ?? [];
});
UserSchema.virtual('completedLessons').get(function () {
    return this.levelProgress[this.currentLevelMode]?.completedLessons ?? [];
});
exports.default = mongoose_1.default.models.User || mongoose_1.default.model('User', UserSchema);
