import { Request, Response } from 'express';
import CountryModel from '@/models/country';
import { logger } from '@/lib/winston';

export class GetCountryByNameController {
    private countryModel: CountryModel;

    constructor() {
        this.countryModel = new CountryModel();
    }

    /**
     * GET /countries/:name
     * Get one country by name
     */
    public getCountryByName = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name } = req.params;

            if (!name || name.trim() === '') {
                res.status(400).json({
                    error: 'Validation failed',
                    details: {
                        name: 'is required'
                    }
                });
                return;
            }

            const country = await this.countryModel.findByName(name.trim());

            if (!country) {
                res.status(404).json({
                    error: 'Country not found'
                });
                return;
            }

            res.status(200).json(country);
        } catch (error) {
            logger.error('Error fetching country by name:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: 'Failed to fetch country'
            });
        }
    };
}

export default GetCountryByNameController;
