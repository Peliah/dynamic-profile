"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateSocket = authenticateSocket;
const jsonwebtoken_1 = require("jsonwebtoken");
const jwt_1 = require("../lib/jwt");
const winston_1 = require("../lib/winston");
const user_1 = __importDefault(require("../models/user"));
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({
            code: "AuthenticationError",
            message: "Access denied, no token provided"
        });
        return;
    }
    const [_, token] = authHeader.split(' ');
    try {
        const jwtPayload = (0, jwt_1.verifyAccessToken)(token);
        if (!jwtPayload || !jwtPayload.userId || !jwtPayload.role) {
            res.status(401).json({
                code: "AuthenticationError",
                message: "Access denied, invalid token payload"
            });
            return;
        }
        req.userId = jwtPayload.userId;
        return next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            res.status(401).json({
                code: "AuthenticationError",
                message: "Access denied, expired token"
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            res.status(401).json({
                code: "AuthenticationError",
                message: "Access denied, invalid token"
            });
            return;
        }
        res.status(500).json({
            code: "ServerError",
            message: "Internal Server Error",
            error: error
        });
        winston_1.logger.error('Error during authentication ', error);
    }
};
async function authenticateSocket(socket, next) {
    const token = socket.handshake.auth?.token;
    if (!token)
        return next(new Error('No token'));
    try {
        const jwtPayload = (0, jwt_1.verifyAccessToken)(token);
        socket.user = await user_1.default.findById(jwtPayload.userId);
        if (!socket.user)
            throw new Error('User not found');
        next();
    }
    catch (error) {
        winston_1.logger.error('Error during authentication ', error);
        next(error);
    }
}
exports.default = authenticate;
