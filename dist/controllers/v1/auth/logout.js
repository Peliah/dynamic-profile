"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("../../../lib/winston");
const config_1 = __importDefault(require("../../../config"));
const token_1 = __importDefault(require("../../../models/token"));
const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await token_1.default.deleteOne({ token: refreshToken });
            winston_1.logger.info('User refresh Token deleted Successfully', {
                userId: req.userId,
                token: refreshToken
            });
        }
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: config_1.default.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.sendStatus(204);
        winston_1.logger.info('User logged out Successfully', {
            userId: req.userId
        });
    }
    catch (error) {
        res.status(500).json({ code: "Server error", message: "Internal server error: " + error });
        winston_1.logger.error("Error during user logout:", error);
    }
};
exports.default = logout;
