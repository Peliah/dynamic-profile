"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("../../../lib/winston");
const user_1 = __importDefault(require("../../../models/user"));
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({
                code: "AuthenticationError",
                message: "Access denied, no user ID found"
            });
        }
        const user = await user_1.default.findById(userId).select('-__v').lean().exec();
        if (!user) {
            res.status(404).json({
                code: "UserNotFound",
                message: "User not found"
            });
        }
        res.status(200).json({ user });
        winston_1.logger.info('Current user details fetched successfully', { userId });
    }
    catch (error) {
        res.status(500).json({
            code: "ServerError",
            message: "Internal Server Error",
            error: error
        });
        winston_1.logger.error('Error while fetching current user', error);
    }
};
exports.default = getCurrentUser;
