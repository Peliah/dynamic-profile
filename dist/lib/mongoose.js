"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectFromDatabase = exports.connectToDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
const winston_1 = require("./winston");
const clientOptions = {
    dbName: "dynamic-profile-db",
    appName: "DYNAMIC-PROFILE",
    serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
    },
};
const connectToDatabase = async () => {
    if (!config_1.default.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in the environment variables");
    }
    try {
        await mongoose_1.default.connect(config_1.default.MONGO_URI, clientOptions);
        winston_1.logger.info("Connected to MongoDB successfully", {
            url: config_1.default.MONGO_URI,
            options: clientOptions,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to connect to MongoDB: ${error.message}`);
        }
        winston_1.logger.error("Error connecting to MongoDB:", error);
        if (config_1.default.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};
exports.connectToDatabase = connectToDatabase;
const disconnectFromDatabase = async () => {
    try {
        await mongoose_1.default.disconnect();
        winston_1.logger.info("Disconnected from MongoDB successfully", {
            url: config_1.default.MONGO_URI,
            options: clientOptions,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to disconnect from MongoDB: ${error.message}`);
        }
        winston_1.logger.error("Error disconnecting from MongoDB:", error);
    }
};
exports.disconnectFromDatabase = disconnectFromDatabase;
