import { Request, Response } from 'express';
import { logger } from '@/lib/winston';
import { getCatFactWithFallback } from '@/utils';

const getProfile = async (req: Request, res: Response) => {
    try {
        const catFact = await getCatFactWithFallback(5000);

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
        logger.error('Unexpected error in profile endpoint:', error);

        const fallbackResponse = {
            status: 'error',
            user: {
                email: 'dushane@example.com',
                name: 'Pelayah Epoupa',
                stack: 'Node.js/Express'
            },
            timestamp: new Date().toISOString(),
            fact: 'Cats have been companions to humans for over 4,000 years.'
        };

        res.status(200).json(fallbackResponse);
    }
};

export default getProfile;
