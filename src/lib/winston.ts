import winston from "winston";
import config from "@/config";


const { combine, timestamp, json, errors, colorize, align, printf } = winston.format;

const transports: winston.transport[] = [];

if (config.NODE_ENV !== 'production') {
    transports.push(
        new winston.transports.Console({
            format: combine(
                colorize({ all: true }),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss A' }),
                align(),
                printf(({ level, message, timestamp, ...meta }) => {
                    const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
                    return `${timestamp} [${level}]: ${message}${metaString}`;
                })
            )
        }),
    )
}

const logger = winston.createLogger({
    level: config.LOG_LEVEL || 'info',
    format: combine(
        timestamp(),
        errors({ stack: true }),
        json(),
    ),
    transports,
    silent: config.NODE_ENV === 'test',
});

export { logger };