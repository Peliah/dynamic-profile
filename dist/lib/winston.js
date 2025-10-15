"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = __importDefault(require("../config"));
const { combine, timestamp, json, errors, colorize, align, printf } = winston_1.default.format;
const transports = [];
if (config_1.default.NODE_ENV !== 'production') {
    transports.push(new winston_1.default.transports.Console({
        format: combine(colorize({ all: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss A' }), align(), printf(({ level, message, timestamp, ...meta }) => {
            const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `${timestamp} [${level}]: ${message}${metaString}`;
        }))
    }));
}
const logger = winston_1.default.createLogger({
    level: config_1.default.LOG_LEVEL || 'info',
    format: combine(timestamp(), errors({ stack: true }), json()),
    transports,
    silent: config_1.default.NODE_ENV === 'test',
});
exports.logger = logger;
