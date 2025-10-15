"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("../../../lib/winston");
const user_1 = __importDefault(require("../../../models/user"));
const config_1 = __importDefault(require("../../../config"));
const getAllUsers = async (req, res) => {
    const userId = req.userId;
    try {
        const limit = parseInt(req.query.limit) ?? config_1.default.defaultResLimit;
        const offset = parseInt(req.query.offset) ?? config_1.default.defaultResOffset;
        const total = await user_1.default.countDocuments();
        const users = await user_1.default.find({ _id: { $ne: userId } })
            .select('-__v')
            .limit(limit)
            .skip(offset)
            .lean()
            .exec();
        res.status(200).json({
            total,
            limit,
            offset,
            users
        });
        winston_1.logger.info('Users fetched successfully');
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
exports.default = getAllUsers;
