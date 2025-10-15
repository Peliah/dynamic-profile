import dotenv from 'dotenv';
import type ms from 'ms';
dotenv.config();

const config = {
    PORT: process.env.PORT || 3030,
    NODE_ENV: process.env.NODE_ENV,
    WHITELIST_ORIGINS: [
        'http://localhost:3030'],
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    defaultResLimit: 20,
    defaultResOffset: 0,

    CAT_FACT_API_URL: process.env.CAT_FACT_API_URL || 'https://catfact.ninja/',
};

export default config;