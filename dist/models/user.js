"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: [true, 'Username must be unique'],
        maxlength: [20, 'Username must be less than 20 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email must be unique']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'admin'],
            message: '{VALUE} is not a valid role'
        },
        default: 'user',
        required: [true, 'Role is required']
    },
    isDriver: { type: Boolean, default: false },
    car: {
        model: { type: String },
        color: { type: String },
        licensePlate: { type: String },
    },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    phone: { type: String, required: [true, 'Phone number is required'], unique: true },
    profilePicture: { type: String, default: '' },
    bio: { type: String, default: '' },
    rating: { type: Number, default: 0 },
}, {
    timestamps: true,
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
        return;
    }
    this.password = await bcrypt_1.default.hash(this.password, 10);
    next();
});
exports.default = (0, mongoose_1.model)('User', userSchema);
