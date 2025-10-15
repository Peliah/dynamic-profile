"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const winston_1 = require("../../../lib/winston");
const user_1 = __importDefault(require("../../../models/user"));
const createUser = async (req, res) => {
    try {
        const user = await user_1.default.create(req.body);
        res.status(201).json(user);
        winston_1.logger.info("User created successfully", { user });
    }
    catch (error) {
        winston_1.logger.error(error);
        res.status(500).json({ code: "ServerError", error: "Failed to create user" });
    }
};
exports.createUser = createUser;
