"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("../../../lib/winston");
const config_1 = __importDefault(require("../../../config"));
const user_1 = __importDefault(require("../../../models/user"));
const utils_1 = require("../../../utils");
const jwt_1 = require("../../../lib/jwt");
const token_1 = __importDefault(require("../../../models/token"));
const register = async (req, res) => {
    const { email, password, phone, role } = req.body;
    try {
        const username = (0, utils_1.generateUserName)();
        const newUser = await user_1.default.create({
            username,
            email,
            password,
            phone,
            role,
        });
        const accessToken = (0, jwt_1.generateAccessToken)(newUser._id, newUser.role);
        const refreshToken = (0, jwt_1.generateRefreshToken)(newUser._id, newUser.role);
        await token_1.default.create({
            token: refreshToken,
            userId: newUser._id,
        });
        winston_1.logger.info(`Refresh token created for user ${newUser._id}`, { refreshToken });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: config_1.default.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.status(201).json({
            user: {
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                userId: newUser._id.toString(),
            },
            accessToken,
        });
        winston_1.logger.info(`User registered successfully`, newUser);
    }
    catch (error) {
        res.status(500).json({ code: "Server error", message: "Internal server error: " + error });
        winston_1.logger.error("Error during registration: ", error);
    }
};
exports.default = register;
