"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_rate_limit_1 = require("express-rate-limit");
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        error: 'Too many requests, please try again later.',
    },
});
exports.default = limiter;
