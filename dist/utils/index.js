"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCatFactWithFallback = exports.fetchCatFact = exports.generateUserName = void 0;
const generateUserName = () => {
    const usernamePrefix = 'user-';
    const randomSuffix = Math.random().toString(36).slice(2);
    const username = `${usernamePrefix}${randomSuffix}`;
    return username;
};
exports.generateUserName = generateUserName;
var catFacts_1 = require("./catFacts");
Object.defineProperty(exports, "fetchCatFact", { enumerable: true, get: function () { return catFacts_1.fetchCatFact; } });
Object.defineProperty(exports, "getCatFactWithFallback", { enumerable: true, get: function () { return catFacts_1.getCatFactWithFallback; } });
