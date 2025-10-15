"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = require("../../../lib/jwt");
const winston_1 = require("../../../lib/winston");
const config_1 = __importDefault(require("../../../config"));
const user_1 = __importDefault(require("../../../models/user"));
const token_1 = __importDefault(require("../../../models/token"));
const login = async (req, res) => {
    console.log(req.body);
    try {
        const { email } = req.body;
        const user = await user_1.default.findOne({ email })
            .select("username email password role")
            .lean()
            .exec();
        if (!user) {
            res.status(404).json({
                code: "UserNotFoundError",
                message: "User not found with the provided email.",
            });
            winston_1.logger.warn(`Login attempt with non-existing email: ${email}`);
            return;
        }
        const accessToken = (0, jwt_1.generateAccessToken)(user._id, user.role);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user._id, user.role);
        await token_1.default.create({ token: refreshToken, userId: user._id });
        winston_1.logger.info(`Refresh token created for user ${user._id}`, { refreshToken });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: config_1.default.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.status(201).json({
            user: user,
            accessToken,
        });
        winston_1.logger.info(`User logged in successfully`, user);
    }
    catch (error) {
        res.status(500).json({ code: "Server error", message: "Internal server error: " + error });
        winston_1.logger.error("Error during user login:", error);
    }
};
exports.default = login;
