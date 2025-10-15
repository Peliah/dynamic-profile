"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const user_1 = __importDefault(require("../../models/user"));
const register_1 = __importDefault(require("../../controllers/v1/auth/register"));
const refresh_token_1 = __importDefault(require("../../controllers/v1/auth/refresh_token"));
const login_1 = __importDefault(require("../../controllers/v1/auth/login"));
const logout_1 = __importDefault(require("../../controllers/v1/auth/logout"));
const authenticate_1 = __importDefault(require("../../middleware/authenticate"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const validationError_1 = __importDefault(require("../../middleware/validationError"));
const router = (0, express_1.Router)();
router.post('/register', (0, express_validator_1.body)('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format').custom(async (value) => {
    const existingUser = await user_1.default.exists({ email: value });
    if (existingUser) {
        throw new Error('Email already in use');
    }
    return true;
}), (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long').notEmpty().withMessage('Password is required'), (0, express_validator_1.body)('role').optional().isIn(['user', 'admin']).isString().withMessage('Role must be either user or admin'), (0, express_validator_1.body)('phone').isString().withMessage('Phone number must be a string').isLength({ min: 9, max: 9 }).custom(async (value) => {
    const existingUser = await user_1.default.exists({ phone: value });
    if (existingUser) {
        throw new Error('Phone number already in use');
    }
    return true;
}), validationError_1.default, register_1.default);
router.post('/login', (0, express_validator_1.body)('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format').custom(async (value) => {
    const existingUser = await user_1.default.exists({ email: value });
    if (!existingUser) {
        throw new Error('User does not exist');
    }
}), (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long').custom(async (value, { req }) => {
    const user = await user_1.default.findOne({ email: req.body.email }).select('password').lean().exec();
    if (!user) {
        throw new Error('User email or password does not exist');
    }
    const passwordMatch = await bcrypt_1.default.compare(value, user.password);
    if (!passwordMatch) {
        throw new Error('User email or password is invalid');
    }
}), validationError_1.default, login_1.default);
router.post('/refresh-token', (0, express_validator_1.cookie)('refreshToken')
    .exists().withMessage('Refresh token is required')
    .notEmpty().withMessage('Refresh token is required')
    .isJWT().withMessage('Invalid refresh token'), validationError_1.default, refresh_token_1.default);
router.post('/logout', authenticate_1.default, logout_1.default);
exports.default = router;
