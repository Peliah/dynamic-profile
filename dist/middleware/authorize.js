"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("../lib/winston");
const user_1 = __importDefault(require("../models/user"));
const authorize = (roles) => {
    return async (req, res, next) => {
        const userId = req.userId;
        try {
            if (!userId) {
                return res.status(401).json({
                    code: "AuthenticationError",
                    message: "Access denied, no user ID found"
                });
            }
            const user = await user_1.default.findById(userId).select('role').lean().exec();
            if (!user) {
                return res.status(404).json({
                    code: "UserNotFound",
                    message: "User not found"
                });
            }
            if (!roles.includes(user.role)) {
                return res.status(403).json({
                    code: "AuthorizationError",
                    message: "Access denied, insufficient permissions"
                });
            }
            return next();
        }
        catch (error) {
            winston_1.logger.error('Error during authorization', error);
            res.status(500).json({
                code: "ServerError",
                message: "Internal Server Error",
                error: error
            });
            winston_1.logger.error('Error while authorizating user', error);
        }
    };
};
exports.default = authorize;
