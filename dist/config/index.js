"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    PORT: process.env.PORT || 3030,
    NODE_ENV: process.env.NODE_ENV,
    WHITELIST_ORIGINS: [
        'http://localhost:3030'
    ],
    MONGO_URI: process.env.MONGO_URI,
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    ACCESS_TOKEN_EXPIRY: (process.env.ACCESS_TOKEN_EXPIRY || '10d'),
    REFRESH_TOKEN_EXPIRY: (process.env.REFRESH_TOKEN_EXPIRY || '10d'),
    WHITELIST_ADMINS_EMAIL: ['pelepoupa@gmail.com', 'mrbuzzlightyear001@gmail.com'],
    defaultResLimit: 20,
    defaultResOffset: 0,
    CAT_FACT_API_URL: process.env.CAT_FACT_API_URL || 'https://catfact.ninja/',
};
exports.default = config;
