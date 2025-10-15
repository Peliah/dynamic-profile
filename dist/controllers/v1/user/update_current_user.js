"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("../../../lib/winston");
const user_1 = __importDefault(require("../../../models/user"));
const updateCurrentUser = async (req, res) => {
    const userId = req.userId;
    const { username, email, password, firstName, lastName, phone, balance, profilePicture, bio, } = req.body;
    try {
        const user = await user_1.default.findById(userId).select('+password -__v').exec();
        if (!user) {
            res.status(404).json({
                code: "UserNotFound",
                message: "User not found"
            });
            return;
        }
        if (username)
            user.username = username;
        if (email)
            user.email = email;
        if (password)
            user.password = password;
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (phone)
            user.phone = phone;
        if (profilePicture)
            user.profilePicture = profilePicture;
        if (bio)
            user.bio = bio;
        await user.save();
        res.status(200).json({ user });
        winston_1.logger.info('Current user details updated successfully', { userId });
    }
    catch (error) {
        res.status(500).json({
            code: "ServerError",
            message: "Internal Server Error",
            error: error
        });
        winston_1.logger.error('Error while updating current user', error);
    }
};
exports.default = updateCurrentUser;
