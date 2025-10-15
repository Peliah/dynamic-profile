"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("./config"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("./lib/express_rate_limit"));
const index_1 = __importDefault(require("./routes/v1/index"));
const http_1 = __importDefault(require("http"));
const winston_1 = require("./lib/winston");
const swagger_1 = __importDefault(require("./config/swagger"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const socketio = require('socket.io');
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = socketio(server, { cors: { origin: '*' } });
exports.io = io;
const corsOptions = {
    origin(origin, callback) {
        if (config_1.default.NODE_ENV === 'development' || !origin || config_1.default.WHITELIST_ORIGINS.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`Cors Error: Origin ${origin} not allowed by CORS`), false);
            winston_1.logger.error(`Cors Error: Origin ${origin} not allowed by CORS`);
        }
    },
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, compression_1.default)({
    level: 6,
    threshold: 1024,
}));
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use(express_rate_limit_1.default);
(async () => {
    try {
        app.use('/api/v1', index_1.default);
        app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
        app.get("/swagger.json", (req, res) => {
            res.setHeader("Content-Type", "application/json");
            res.send(swagger_1.default);
        });
        server.listen(config_1.default.PORT, () => {
            winston_1.logger.info(`Server running on http://localhost:${config_1.default.PORT}`);
        });
    }
    catch (error) {
        winston_1.logger.error('Error during application initialization:', error);
        if (config_1.default.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
})();
const handleShutdown = async () => {
    try {
        winston_1.logger.warn('Shutting down gracefully...');
        process.exit(0);
    }
    catch (error) {
        winston_1.logger.error('Error during shutdown:', error);
    }
};
process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);
