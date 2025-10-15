import { Request, Response } from 'express';
import { logger } from '@/lib/winston';
import { fetchCatFact } from '@/utils';

const getProfile = async (req: Request, res: Response) => {
    try {
        const catFactData = await fetchCatFact(5000);
        const catFact = catFactData.fact;

        const response = {
            status: 'success',
            user: {
                email: 'pelepoupa@gmail.com',
                name: 'Pelayah Epoupa',
                stack: 'Node.js/Express'
            },
            timestamp: new Date().toISOString(),
            fact: catFact
        };

        logger.info('Profile endpoint accessed successfully');
        res.status(200).json(response);

    } catch (error) {
        logger.error('Error fetching cat fact:', error);

        const errorResponse = {
            status: 'error',
            message: 'Failed to fetch cat fact'
        };

        res.status(500).json(errorResponse);
    }
};

export default getProfile;
