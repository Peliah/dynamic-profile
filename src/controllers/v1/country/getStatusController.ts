import { Request, Response } from 'express';
import CountryModel from '@/models/country';
import { logger } from '@/lib/winston';

export class GetStatusController {
    private countryModel: CountryModel;

    constructor() {
        this.countryModel = new CountryModel();
    }

    /**
     * GET /status
     * Show total countries and last refresh timestamp
     */
    public getStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const totalCountries = await this.countryModel.count();
            const lastRefreshTime = await this.countryModel.getLastRefreshTime();

            res.status(200).json({
                total_countries: totalCountries,
                last_refreshed_at: lastRefreshTime ? lastRefreshTime.toISOString() : null
            });
        } catch (error) {
            logger.error('Error fetching status:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: 'Failed to fetch status'
            });
        }
    };
}

export default GetStatusController;
