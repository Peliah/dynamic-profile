"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("../../../lib/winston");
const user_1 = __importDefault(require("../../../models/user"));
const deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await user_1.default.findById(userId).select('-__v').exec();
        if (!user) {
            res.status(404).json({
                code: "UserNotFound",
                message: "User not found"
            });
            return;
        }
        await user_1.default.deleteOne({ _id: userId });
        res.status(204).json({
            code: "UserDeleted",
            message: "User account deleted successfully"
        });
        winston_1.logger.info(`User with ID ${userId} deleted successfully`);
    }
    catch (error) {
        winston_1.logger.error(`Error deleting user: ${error}`);
        res.status(500).json({
            code: "InternalServerError",
            message: "An error occurred while deleting the user account"
        });
    }
};
exports.default = deleteUser;
