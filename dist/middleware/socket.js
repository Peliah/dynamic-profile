"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../server");
const attachSocket = (req, res, next) => {
    req.io = server_1.io;
    next();
};
exports.default = attachSocket;
