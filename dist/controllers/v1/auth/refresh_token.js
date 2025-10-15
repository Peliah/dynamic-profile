"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const jwt_1 = require("../../../lib/jwt");
const winston_1 = require("../../../lib/winston");
const token_1 = __importDefault(require("../../../models/token"));
const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    try {
        const tokenExists = await token_1.default.exists({ token: refreshToken });
        if (!tokenExists) {
            res.status(401).json({
                code: "AuthorizationError",
                message: "Invalid refresh token"
            });
            return;
        }
        const jwtPayload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const accessToken = (0, jwt_1.generateAccessToken)(jwtPayload.userId, jwtPayload.role);
        res.status(200).json({ accessToken });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            res.status(401).json({
                code: "AuthenticationError",
                message: "Refresh token expired, please login again"
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            res.status(401).json({
                code: "AuthenticationError",
                message: "Invalid refresh token"
            });
            return;
        }
        res.status(500).json({
            code: "InternalServerError",
            message: "Internal Server Error",
            error: error
        });
        winston_1.logger.error("An error occurred while refreshing the token.");
    }
};
exports.default = refreshToken;
