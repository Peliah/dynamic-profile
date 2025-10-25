import { Request, Response } from 'express';
import CountryModel, { CountryFilters } from '@/models/country';
import { logger } from '@/lib/winston';

export class GetCountriesController {
    private countryModel: CountryModel;

    constructor() {
        this.countryModel = new CountryModel();
    }

    /**
     * GET /countries
     * Get all countries from the DB with optional filters and sorting
     */
    public getCountries = async (req: Request, res: Response): Promise<void> => {
        try {
            const filters: CountryFilters = {
                region: req.query.region as string,
                currency: req.query.currency as string,
                sort: req.query.sort as string,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
            };

            const countries = await this.countryModel.findAll(filters);

            res.status(200).json(countries);
        } catch (error) {
            logger.error('Error fetching countries:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: 'Failed to fetch countries'
            });
        }
    };
}

export default GetCountriesController;
