"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const tokenSchema = new mongoose_1.Schema({
    token: {
        type: String,
        require: [true, 'Token is required'],
        unique: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        require: [true, 'User ID is required'],
        ref: 'User',
    },
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)('Token', tokenSchema);
