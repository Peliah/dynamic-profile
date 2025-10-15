"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCatFactWithFallback = exports.fetchCatFact = void 0;
const config_1 = __importDefault(require("../config"));
const winston_1 = require("../lib/winston");
const fetchCatFact = async (timeoutMs = 5000) => {
    try {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                const error = new Error('Cat Facts API request timeout');
                error.code = 'TIMEOUT';
                reject(error);
            }, timeoutMs);
        });
        const fetchPromise = fetch(config_1.default.CAT_FACT_API_URL + '/fact', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Dynamic-Profile-API/1.0.0'
            }
        });
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        if (!response.ok) {
            const error = new Error(`Cat Facts API returned status: ${response.status}`);
            error.code = 'API_ERROR';
            throw error;
        }
        const data = await response.json();
        if (!data.fact || typeof data.fact !== 'string') {
            const error = new Error('Invalid cat fact response structure');
            error.code = 'INVALID_RESPONSE';
            throw error;
        }
        winston_1.logger.info('Successfully fetched cat fact from API');
        return data;
    }
    catch (error) {
        winston_1.logger.error('Error fetching cat fact:', error);
        if (error instanceof Error) {
            const catFactError = error;
            throw catFactError;
        }
        const unknownError = new Error('Unknown error occurred while fetching cat fact');
        unknownError.code = 'UNKNOWN_ERROR';
        throw unknownError;
    }
};
exports.fetchCatFact = fetchCatFact;
const getCatFactWithFallback = async (timeoutMs = 5000) => {
    try {
        const catFactData = await (0, exports.fetchCatFact)(timeoutMs);
        return catFactData.fact;
    }
    catch (error) {
        winston_1.logger.warn('Using fallback cat fact due to API error:', error);
        const fallbackFacts = [
            'Cats have been companions to humans for over 4,000 years.',
            'A group of cats is called a "clowder."',
            'Cats spend 70% of their lives sleeping.',
            'A cat\'s purr vibrates at a frequency that helps promote healing.',
            'Cats have a third eyelid called a nictitating membrane.'
        ];
        const randomFallback = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
        return randomFallback;
    }
};
exports.getCatFactWithFallback = getCatFactWithFallback;
