import Database from '@/lib/database';
import { logger } from '@/lib/winston';

export interface Country {
    id?: number;
    name: string;
    capital?: string;
    region?: string;
    population: number;
    currency_code?: string;
    exchange_rate?: number;
    estimated_gdp?: number;
    flag_url?: string;
    last_refreshed_at?: Date;
    created_at?: Date;
    updated_at?: Date;
}

export interface CountryFilters {
    region?: string;
    currency?: string;
    sort?: string;
    limit?: number;
    offset?: number;
}

export interface RefreshLog {
    id?: number;
    last_refreshed_at: Date;
    total_countries: number;
    created_at?: Date;
}

export class CountryModel {
    private db: Database;

    constructor() {
        this.db = Database.getInstance();
    }

    async create(country: Omit<Country, 'id' | 'created_at' | 'updated_at'>): Promise<Country> {
        const connection = await this.db.connect();

        const query = `
            INSERT INTO countries (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            country.name,
            country.capital || null,
            country.region || null,
            country.population,
            country.currency_code || null,
            country.exchange_rate || null,
            country.estimated_gdp || null,
            country.flag_url || null,
            country.last_refreshed_at || new Date()
        ];

        try {
            const [result] = await connection.execute(query, values);
            const insertId = (result as any).insertId;

            const createdCountry = await this.findById(insertId);
            if (!createdCountry) {
                throw new Error('Failed to retrieve created country');
            }
            return createdCountry;
        } catch (error) {
            logger.error('Error creating country:', error);
            throw error;
        }
    }

    async findById(id: number): Promise<Country | null> {
        const connection = await this.db.connect();

        const query = 'SELECT * FROM countries WHERE id = ?';

        try {
            const [rows] = await connection.execute(query, [id]);
            const countries = rows as Country[];
            return countries.length > 0 ? countries[0] : null;
        } catch (error) {
            logger.error('Error finding country by ID:', error);
            throw error;
        }
    }

    async findByName(name: string): Promise<Country | null> {
        const connection = await this.db.connect();

        const query = 'SELECT * FROM countries WHERE LOWER(name) = LOWER(?)';

        try {
            const [rows] = await connection.execute(query, [name]);
            const countries = rows as Country[];
            return countries.length > 0 ? countries[0] : null;
        } catch (error) {
            logger.error('Error finding country by name:', error);
            throw error;
        }
    }

    async findAll(filters: CountryFilters = {}): Promise<Country[]> {
        const connection = await this.db.connect();

        let query = 'SELECT * FROM countries WHERE 1=1';
        const values: any[] = [];

        // Apply filters
        if (filters.region) {
            query += ' AND region = ?';
            values.push(filters.region);
        }

        if (filters.currency) {
            query += ' AND currency_code = ?';
            values.push(filters.currency);
        }

        // Apply sorting
        if (filters.sort) {
            switch (filters.sort) {
                case 'gdp_desc':
                    query += ' ORDER BY estimated_gdp DESC';
                    break;
                case 'gdp_asc':
                    query += ' ORDER BY estimated_gdp ASC';
                    break;
                case 'population_desc':
                    query += ' ORDER BY population DESC';
                    break;
                case 'population_asc':
                    query += ' ORDER BY population ASC';
                    break;
                case 'name_asc':
                    query += ' ORDER BY name ASC';
                    break;
                case 'name_desc':
                    query += ' ORDER BY name DESC';
                    break;
                default:
                    query += ' ORDER BY name ASC';
            }
        } else {
            query += ' ORDER BY name ASC';
        }

        // Apply pagination
        const limit = filters.limit || 1000; // Default limit
        const offset = filters.offset || 0;
        query += ` LIMIT ${parseInt(limit.toString())} OFFSET ${parseInt(offset.toString())}`;

        try {
            const [rows] = await connection.execute(query, values);
            return rows as Country[];
        } catch (error) {
            logger.error('Error finding countries:', error);
            throw error;
        }
    }

    async updateByName(name: string, country: Partial<Country>): Promise<Country | null> {
        const connection = await this.db.connect();

        const fields = [];
        const values = [];

        if (country.capital !== undefined) {
            fields.push('capital = ?');
            values.push(country.capital);
        }
        if (country.region !== undefined) {
            fields.push('region = ?');
            values.push(country.region);
        }
        if (country.population !== undefined) {
            fields.push('population = ?');
            values.push(country.population);
        }
        if (country.currency_code !== undefined) {
            fields.push('currency_code = ?');
            values.push(country.currency_code);
        }
        if (country.exchange_rate !== undefined) {
            fields.push('exchange_rate = ?');
            values.push(country.exchange_rate);
        }
        if (country.estimated_gdp !== undefined) {
            fields.push('estimated_gdp = ?');
            values.push(country.estimated_gdp);
        }
        if (country.flag_url !== undefined) {
            fields.push('flag_url = ?');
            values.push(country.flag_url);
        }
        if (country.last_refreshed_at !== undefined) {
            fields.push('last_refreshed_at = ?');
            values.push(country.last_refreshed_at);
        }

        if (fields.length === 0) {
            return this.findByName(name);
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(name);

        const query = `UPDATE countries SET ${fields.join(', ')} WHERE LOWER(name) = LOWER(?)`;

        try {
            const [result] = await connection.execute(query, values);
            const affectedRows = (result as any).affectedRows;

            if (affectedRows > 0) {
                return this.findByName(name);
            }
            return null;
        } catch (error) {
            logger.error('Error updating country:', error);
            throw error;
        }
    }

    async deleteByName(name: string): Promise<boolean> {
        const connection = await this.db.connect();

        const query = 'DELETE FROM countries WHERE LOWER(name) = LOWER(?)';

        try {
            const [result] = await connection.execute(query, [name]);
            const affectedRows = (result as any).affectedRows;
            return affectedRows > 0;
        } catch (error) {
            logger.error('Error deleting country:', error);
            throw error;
        }
    }

    async count(): Promise<number> {
        const connection = await this.db.connect();

        const query = 'SELECT COUNT(*) as count FROM countries';

        try {
            const [rows] = await connection.execute(query);
            const result = rows as any[];
            return result[0].count;
        } catch (error) {
            logger.error('Error counting countries:', error);
            throw error;
        }
    }

    async getLastRefreshTime(): Promise<Date | null> {
        const connection = await this.db.connect();

        const query = 'SELECT last_refreshed_at FROM refresh_log ORDER BY id DESC LIMIT 1';

        try {
            const [rows] = await connection.execute(query);
            const result = rows as any[];
            return result.length > 0 ? result[0].last_refreshed_at : null;
        } catch (error) {
            logger.error('Error getting last refresh time:', error);
            throw error;
        }
    }

    async updateRefreshLog(totalCountries: number): Promise<void> {
        const connection = await this.db.connect();

        const query = `
            INSERT INTO refresh_log (last_refreshed_at, total_countries)
            VALUES (CURRENT_TIMESTAMP, ?)
        `;

        try {
            await connection.execute(query, [totalCountries]);
        } catch (error) {
            logger.error('Error updating refresh log:', error);
            throw error;
        }
    }
}

export default CountryModel;
