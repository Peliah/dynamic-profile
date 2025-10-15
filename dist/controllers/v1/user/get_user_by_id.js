"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("../../../lib/winston");
const user_1 = __importDefault(require("../../../models/user"));
const getUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await user_1.default.findById(userId).select('-__v').lean().exec();
        if (!user) {
            res.status(404).json({
                code: "UserNotFound",
                message: "User not found"
            });
            return;
        }
        res.status(200).json(user);
        winston_1.logger.info(`User with ID ${userId} fetched successfully`);
    }
    catch (error) {
        res.status(500).json({
            code: "ServerError",
            message: "Internal Server Error",
            error: error
        });
        winston_1.logger.error('Error while fetching users', error);
    }
};
exports.default = getUser;
