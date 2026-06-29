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
const ChallengeDaySchema = new mongoose_1.Schema({
    dayNumber: { type: Number, required: true, unique: true, index: true },
    vocabulary: { type: [mongoose_1.Schema.Types.Mixed], default: [] },
    grammar: {
        conceptName: { type: String, required: true },
        explanation: { type: String, required: true },
        examples: { type: [String], default: [] },
        interactiveQuiz: { type: [mongoose_1.Schema.Types.Mixed], default: [] }
    },
    speaking: {
        prompt: { type: String, required: true },
        sentencesToRead: { type: [String], default: [] },
        helperVocabulary: { type: [String], default: [] }
    },
    listening: {
        audioPrompt: { type: String, required: true },
        transcript: { type: String, required: true },
        fillInBlanks: { type: [mongoose_1.Schema.Types.Mixed], default: [] },
        multipleChoice: { type: [mongoose_1.Schema.Types.Mixed], default: [] }
    },
    writing: {
        prompt: { type: String, required: true },
        placeholder: { type: String, required: true },
        suggestedVocabulary: { type: [String], default: [] }
    },
    quiz: { type: [mongoose_1.Schema.Types.Mixed], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false });
exports.default = mongoose_1.default.models.ChallengeDay || mongoose_1.default.model('ChallengeDay', ChallengeDaySchema);
