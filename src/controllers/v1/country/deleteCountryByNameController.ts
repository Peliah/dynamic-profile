import { Request, Response } from 'express';
import CountryModel from '@/models/country';
import { logger } from '@/lib/winston';

export class DeleteCountryByNameController {
    private countryModel: CountryModel;

    constructor() {
        this.countryModel = new CountryModel();
    }

    /**
     * DELETE /countries/:name
     * Delete a country record
     */
    public deleteCountryByName = async (req: Request, res: Response): Promise<void> => {
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

            const deleted = await this.countryModel.deleteByName(name.trim());

            if (!deleted) {
                res.status(404).json({
                    error: 'Country not found'
                });
                return;
            }

            res.status(200).json({
                message: 'Country deleted successfully',
                name: name.trim()
            });
        } catch (error) {
            logger.error('Error deleting country:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: 'Failed to delete country'
            });
        }
    };
}

export default DeleteCountryByNameController;
