import { Request, Response } from 'express';
import CountryModel, { Country } from '@/models/country';
import ExternalApiService from '@/services/externalApiService';
import ImageGenerationService from '@/services/imageGenerationService';
import { logger } from '@/lib/winston';

export class RefreshCountriesController {
    private countryModel: CountryModel;

    constructor() {
        this.countryModel = new CountryModel();
    }

    /**
     * POST /countries/refresh
     * Fetch all countries and exchange rates, then cache them in the database
     */
    public refreshCountries = async (req: Request, res: Response): Promise<void> => {
        try {
            logger.info('Starting country data refresh...');

            // Fetch data from external APIs
            const [externalCountries, exchangeRates] = await Promise.all([
                ExternalApiService.fetchCountries(),
                ExternalApiService.fetchExchangeRates()
            ]);

            logger.info(`Fetched ${externalCountries.length} countries and ${Object.keys(exchangeRates.rates).length} exchange rates`);

            let processedCount = 0;
            let updatedCount = 0;
            let insertedCount = 0;
            const batchSize = 50; // Process countries in batches

            // Process countries in batches to avoid overwhelming the database
            for (let i = 0; i < externalCountries.length; i += batchSize) {
                const batch = externalCountries.slice(i, i + batchSize);
                logger.info(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(externalCountries.length / batchSize)} (${batch.length} countries)`);

                // Process batch concurrently
                const batchPromises = batch.map(async (externalCountry) => {
                    try {
                        const currencyCode = ExternalApiService.extractCurrencyCode(externalCountry);
                        let exchangeRate: number | null = null;
                        let estimatedGdp: number | null = null;

                        if (currencyCode && exchangeRates.rates[currencyCode]) {
                            exchangeRate = exchangeRates.rates[currencyCode];
                            const randomMultiplier = ExternalApiService.generateRandomMultiplier();
                            estimatedGdp = ExternalApiService.calculateEstimatedGdp(
                                externalCountry.population,
                                exchangeRate,
                                randomMultiplier
                            );
                        }

                        const countryData: Omit<Country, 'id' | 'created_at' | 'updated_at'> = {
                            name: externalCountry.name,
                            capital: externalCountry.capital || undefined,
                            region: externalCountry.region || undefined,
                            population: externalCountry.population,
                            currency_code: currencyCode || undefined,
                            exchange_rate: exchangeRate || undefined,
                            estimated_gdp: estimatedGdp || undefined,
                            flag_url: externalCountry.flag || undefined,
                            last_refreshed_at: new Date()
                        };

                        // Check if country exists
                        const existingCountry = await this.countryModel.findByName(externalCountry.name);

                        if (existingCountry) {
                            // Update existing country
                            await this.countryModel.updateByName(externalCountry.name, countryData);
                            return { action: 'updated', name: externalCountry.name };
                        } else {
                            // Insert new country
                            await this.countryModel.create(countryData);
                            return { action: 'inserted', name: externalCountry.name };
                        }
                    } catch (error) {
                        logger.error(`Error processing country ${externalCountry.name}:`, error);
                        return { action: 'error', name: externalCountry.name };
                    }
                });

                // Wait for batch to complete
                const batchResults = await Promise.all(batchPromises);

                // Count results
                batchResults.forEach(result => {
                    processedCount++;
                    if (result.action === 'updated') updatedCount++;
                    else if (result.action === 'inserted') insertedCount++;
                });

                logger.info(`Batch completed: ${processedCount}/${externalCountries.length} processed`);
            }

            // Update refresh log
            const totalCountries = await this.countryModel.count();
            await this.countryModel.updateRefreshLog(totalCountries);

            logger.info('Generating summary image...');
            // Generate summary image
            const allCountries = await this.countryModel.findAll({ limit: 1000 });
            const lastRefreshTime = new Date();
            await ImageGenerationService.generateSummaryImage(allCountries, totalCountries, lastRefreshTime);

            logger.info(`Country refresh completed: ${processedCount} processed, ${updatedCount} updated, ${insertedCount} inserted`);

            res.status(200).json({
                message: 'Countries refreshed successfully',
                processed: processedCount,
                updated: updatedCount,
                inserted: insertedCount,
                total_countries: totalCountries,
                last_refreshed_at: lastRefreshTime.toISOString()
            });

        } catch (error) {
            logger.error('Error refreshing countries:', error);

            if (error instanceof Error) {
                if (error.message.includes('timed out') || error.message.includes('Failed to fetch')) {
                    res.status(503).json({
                        error: 'External data source unavailable',
                        details: error.message
                    });
                    return;
                }
            }

            res.status(500).json({
                error: 'Internal server error',
                details: 'Failed to refresh country data'
            });
        }
    };
}

export default RefreshCountriesController;
