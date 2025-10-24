import mysql from 'mysql2/promise';
import config from '@/config';
import { logger } from '@/lib/winston';

class Database {
    private static instance: Database;
    private connection: mysql.Connection | null = null;

    private constructor() { }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async connect(): Promise<mysql.Connection> {
        if (this.connection) {
            return this.connection;
        }

        try {
            // First connect without database to create it if it doesn't exist
            const tempConnection = await mysql.createConnection({
                host: config.DB_HOST,
                port: config.DB_PORT,
                user: config.DB_USER,
                password: config.DB_PASSWORD,
                charset: 'utf8mb4'
            });

            // Create database if it doesn't exist
            await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.DB_NAME}\``);
            await tempConnection.end();

            // Now connect to the specific database
            this.connection = await mysql.createConnection({
                host: config.DB_HOST,
                port: config.DB_PORT,
                user: config.DB_USER,
                password: config.DB_PASSWORD,
                database: config.DB_NAME,
                charset: 'utf8mb4'
            });

            logger.info('Connected to MySQL database');
            await this.createTables();
            return this.connection;
        } catch (error) {
            logger.error('Database connection failed:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
            logger.info('Disconnected from MySQL database');
        }
    }

    public getConnection(): mysql.Connection {
        if (!this.connection) {
            throw new Error('Database not connected');
        }
        return this.connection;
    }

    private async createTables(): Promise<void> {
        if (!this.connection) return;

        const createCountriesTable = `
            CREATE TABLE IF NOT EXISTS countries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                capital VARCHAR(255),
                region VARCHAR(255),
                population BIGINT NOT NULL,
                currency_code VARCHAR(10),
                exchange_rate DECIMAL(20, 6),
                estimated_gdp DECIMAL(20, 2),
                flag_url VARCHAR(500),
                last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_name (name),
                INDEX idx_region (region),
                INDEX idx_currency_code (currency_code),
                INDEX idx_population (population),
                INDEX idx_estimated_gdp (estimated_gdp)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        const createRefreshLogTable = `
            CREATE TABLE IF NOT EXISTS refresh_log (
                id INT AUTO_INCREMENT PRIMARY KEY,
                last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_countries INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        try {
            await this.connection.execute(createCountriesTable);
            await this.connection.execute(createRefreshLogTable);
            logger.info('Database tables created/verified successfully');
        } catch (error) {
            logger.error('Error creating tables:', error);
            throw error;
        }
    }
}

export default Database;
