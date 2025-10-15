"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const generateAccessToken = (userId, role) => {
    if (!config_1.default.JWT_ACCESS_SECRET) {
        throw new Error("JWT_ACCESS_SECRET is not defined in the environment variables");
    }
    return jsonwebtoken_1.default.sign({ userId, role }, config_1.default.JWT_ACCESS_SECRET, { expiresIn: config_1.default.ACCESS_TOKEN_EXPIRY, subject: "accessApi" });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId, role) => {
    if (!config_1.default.JWT_REFRESH_SECRET) {
        throw new Error("JWT_REFRESH_SECRET is not defined in the environment variables");
    }
    return jsonwebtoken_1.default.sign({ userId, role }, config_1.default.JWT_REFRESH_SECRET, { expiresIn: config_1.default.REFRESH_TOKEN_EXPIRY, subject: "refreshToken " });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.default.JWT_ACCESS_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.default.JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
