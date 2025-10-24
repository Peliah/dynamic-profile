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
    COUNTRY_DATA: process.env.COUNTRY_DATA || 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies',
    EXCHANGE_RATE: process.env.EXCHANGE_RATE || ' https://open.er-api.com/v6/latest/USD'
};

export default config;