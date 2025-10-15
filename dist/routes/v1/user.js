"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const user_1 = __importDefault(require("../../models/user"));
const authenticate_1 = __importDefault(require("../../middleware/authenticate"));
const validationError_1 = __importDefault(require("../../middleware/validationError"));
const authorize_1 = __importDefault(require("../../middleware/authorize"));
const get_current_user_1 = __importDefault(require("../../controllers/v1/user/get_current_user"));
const update_current_user_1 = __importDefault(require("../../controllers/v1/user/update_current_user"));
const delete_current_user_1 = __importDefault(require("../../controllers/v1/user/delete_current_user"));
const get_all_users_1 = __importDefault(require("../../controllers/v1/user/get_all_users"));
const get_user_by_id_1 = __importDefault(require("../../controllers/v1/user/get_user_by_id"));
const update_user_by_id_1 = __importDefault(require("../../controllers/v1/user/update_user_by_id"));
const delete_user_by_id_1 = __importDefault(require("../../controllers/v1/user/delete_user_by_id"));
const create_user_1 = require("../../controllers/v1/user/create_user");
const router = (0, express_1.Router)();
router.get('/me', authenticate_1.default, (0, authorize_1.default)(['user', 'admin']), get_current_user_1.default);
router.put('/me', authenticate_1.default, (0, authorize_1.default)(['user', 'admin']), (0, express_validator_1.body)('username').optional().isString().isLength({ max: 20 }).withMessage('Username must be a string and less than 20 characters').custom(async (value) => {
    const userExists = await user_1.default.findOne({ username: value });
    if (userExists) {
        throw new Error('Username is already in use');
    }
}), (0, express_validator_1.body)('email').optional().isEmail().withMessage('Email must be a valid email address').custom(async (value) => {
    const userExists = await user_1.default.findOne({ email: value });
    if (userExists) {
        throw new Error('Email already exists');
    }
}), (0, express_validator_1.body)('password').optional().isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'), (0, express_validator_1.body)(['first_name', 'last_name']).optional().isString().withMessage('Name must be  less than 50 characters').isLength({ max: 50 }), (0, express_validator_1.body)('phone').optional().isString().withMessage('Phone number must be a string').isLength({ min: 9, max: 9 }).custom(async (value) => {
    const userExists = await user_1.default.findOne({ phone: value });
    if (userExists) {
        throw new Error('Phone number already in use');
    }
}), (0, express_validator_1.body)('profile_picture').optional().isString().withMessage('Profile picture must be a string'), (0, express_validator_1.body)('bio').optional().isString().withMessage('Bio must be a string').isLength({ max: 1000 }), validationError_1.default, update_current_user_1.default);
router.delete('/me', authenticate_1.default, (0, authorize_1.default)(['user', 'admin']), delete_current_user_1.default);
router.get('/', authenticate_1.default, (0, authorize_1.default)(['admin']), (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be a positive integer'), (0, express_validator_1.query)('offset').optional().isInt({ min: 0 }).withMessage('Page must be a positive integer'), validationError_1.default, get_all_users_1.default);
router.get('/:id', authenticate_1.default, (0, authorize_1.default)(['admin', 'user']), (0, express_validator_1.param)('id').notEmpty().isMongoId().withMessage('Invalid user ID format'), validationError_1.default, get_user_by_id_1.default);
router.put('/:id', authenticate_1.default, (0, authorize_1.default)(['admin']), (0, express_validator_1.param)('id').notEmpty().isMongoId().withMessage('Invalid user ID format'), (0, express_validator_1.body)('username').optional().isString().isLength({ max: 20 }).withMessage('Username must be a string and less than 20 characters').custom(async (value, { req }) => {
    const userExists = await user_1.default.findOne({ username: value, _id: { $ne: req.params.id } });
    if (userExists) {
        throw new Error('Username is already in use');
    }
}), (0, express_validator_1.body)('email').optional().isEmail().withMessage('Email must be a valid email address').custom(async (value, { req }) => {
    const userExists = await user_1.default.findOne({ email: value, _id: { $ne: req.params.id } });
    if (userExists) {
        throw new Error('Email already exists');
    }
}), (0, express_validator_1.body)('password').optional().isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'), (0, express_validator_1.body)('role').optional().isIn(['user', 'admin']).withMessage('Role must be either user or admin'), (0, express_validator_1.body)(['first_name', 'last_name']).optional().isString().withMessage('Name must be  less than 50 characters').isLength({ max: 50 }), validationError_1.default, update_user_by_id_1.default);
router.delete('/:id', authenticate_1.default, (0, authorize_1.default)(['admin']), (0, express_validator_1.param)('id').notEmpty().isMongoId().withMessage('Invalid user ID format'), validationError_1.default, delete_user_by_id_1.default);
router.post('/', authenticate_1.default, (0, authorize_1.default)(['admin']), (0, express_validator_1.body)('username').isString().isLength({ max: 20 }).withMessage('Username must be a string and less than 20 characters').custom(async (value) => {
    const userExists = await user_1.default.findOne({ username: value });
    if (userExists) {
        throw new Error('Username is already in use');
    }
}), (0, express_validator_1.body)('email').isEmail().withMessage('Email must be a valid email address').custom(async (value) => {
    const userExists = await user_1.default.findOne({ email: value });
    if (userExists) {
        throw new Error('Email already exists');
    }
}), (0, express_validator_1.body)('role').isIn(['user', 'admin']).withMessage('Role must be either user or admin'), (0, express_validator_1.body)('phone').isString().withMessage('Phone number must be a string').isLength({ min: 9, max: 9 }).custom(async (value) => {
    const userExists = await user_1.default.findOne({ phone: value });
    if (userExists) {
        throw new Error('Phone number already in use');
    }
}), (0, express_validator_1.body)('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'), (0, express_validator_1.body)(['first_name', 'last_name']).isString().isLength({ max: 50 }).withMessage('Name must be  less than 50 characters').optional(), validationError_1.default, create_user_1.createUser);
exports.default = router;
