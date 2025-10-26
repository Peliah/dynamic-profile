import express from 'express';
import config from '@/config';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import limiter from '@/lib/express_rate_limit';
import v1routes from '@/routes/v1/index';
import http from 'http';
import { logger } from '@/lib/winston';
import swagger from './config/swagger';
import swaggerUI from 'swagger-ui-express';
import Database from '@/lib/database';

const app = express();
const server = http.createServer(app);

// Trust proxy for rate limiting behind proxies (Railway, Heroku, etc.)
app.set('trust proxy', 1);

// Middleware setup
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (config.NODE_ENV === 'development' || !origin || config.WHITELIST_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Cors Error: Origin ${origin} not allowed by CORS`), false);
      logger.error(`Cors Error: Origin ${origin} not allowed by CORS`);

    }
  },
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression({
  level: 6,
  threshold: 1024,
}));
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(limiter);

(async () => {
  try {
    // Initialize database connection
    const db = Database.getInstance();
    await db.connect();
    logger.info('Database connection established');

    app.use('/api/v1', v1routes);
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swagger));
    app.get("/swagger.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swagger);
    });

    server.listen(config.PORT, () => {
      logger.info(`Server running on http://localhost:${config.PORT}`);
    });
  } catch (error) {
    logger.error('Error during application initialization:', error);
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

const handleShutdown = async () => {
  try {
    logger.warn('Shutting down gracefully...');
    const db = Database.getInstance();
    await db.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
  }
}

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);
