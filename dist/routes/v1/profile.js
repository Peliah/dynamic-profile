"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_profile_1 = __importDefault(require("../../controllers/v1/profile/get_profile"));
const router = (0, express_1.Router)();
router.get('/me', get_profile_1.default);
exports.default = router;
