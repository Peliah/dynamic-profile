import config from '@/config';
import { logger } from '@/lib/winston';

export interface ExternalCountry {
    name: string;
    capital?: string;
    region?: string;
    population: number;
    flag?: string;
    currencies?: Array<{
        code: string;
        name: string;
        symbol: string;
    }>;
}

export interface ExchangeRates {
    rates: Record<string, number>;
    base: string;
    date: string;
}

export class ExternalApiService {
    private static readonly TIMEOUT = 10000; // 10 seconds

    static async fetchCountries(): Promise<ExternalCountry[]> {
        try {
            logger.info('Fetching countries from external API...');

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

            const response = await fetch(config.COUNTRY_DATA, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Country-API/1.0'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const countries: ExternalCountry[] = await response.json();
            logger.info(`Successfully fetched ${countries.length} countries`);

            return countries;
        } catch (error) {
            logger.error('Error fetching countries:', error);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Countries API request timed out');
            }
            throw new Error(`Failed to fetch countries: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async fetchExchangeRates(): Promise<ExchangeRates> {
        try {
            logger.info('Fetching exchange rates from external API...');

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

            const response = await fetch(config.EXCHANGE_RATE, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Country-API/1.0'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const exchangeRates: ExchangeRates = await response.json();
            logger.info(`Successfully fetched exchange rates for ${Object.keys(exchangeRates.rates).length} currencies`);

            return exchangeRates;
        } catch (error) {
            logger.error('Error fetching exchange rates:', error);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Exchange rates API request timed out');
            }
            throw new Error(`Failed to fetch exchange rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static extractCurrencyCode(country: ExternalCountry): string | null {
        if (!country.currencies || country.currencies.length === 0) {
            return null;
        }

        // Return the first currency code
        return country.currencies[0].code || null;
    }

    static calculateEstimatedGdp(
        population: number,
        exchangeRate: number | null,
        randomMultiplier: number
    ): number | null {
        if (!exchangeRate || exchangeRate <= 0) {
            return null;
        }

        return (population * randomMultiplier) / exchangeRate;
    }

    static generateRandomMultiplier(): number {
        // Generate random number between 1000 and 2000
        return Math.random() * 1000 + 1000;
    }
}

export default ExternalApiService;
