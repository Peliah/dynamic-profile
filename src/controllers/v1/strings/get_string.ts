import { Request, Response } from 'express';
import { logger } from '../../../lib/winston';
import { findAnalyzedStringByValue } from '../../../utils/json_storage';

/**
 * Gets a specific analyzed string by its value
 */
export const getString = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();

    try {
        const { string_value } = req.params;

        logger.info('Get string request received', {
            string_value,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Validate that string_value is provided
        if (!string_value) {
            logger.warn('No string value provided in request');
            res.status(400).json({
                error: 'String value is required',
                message: 'Please provide a string value in the URL path'
            });
            return;
        }

        const analyzedString = await findAnalyzedStringByValue(string_value);

        if (!analyzedString) {
            logger.warn('String not found', { string_value });
            res.status(404).json({
                error: 'String not found',
                message: 'No analyzed string found with the provided value'
            });
            return;
        }

        const processingTime = Date.now() - startTime;
        logger.info('String retrieved successfully', {
            id: analyzedString.id,
            string_value,
            processingTime: `${processingTime}ms`,
            value: analyzedString.value.substring(0, 50) + (analyzedString.value.length > 50 ? '...' : '')
        });

        res.status(200).json(analyzedString);

    } catch (error) {
        const processingTime = Date.now() - startTime;
        logger.error('Error getting string', {
            error: (error as Error).message,
            stack: (error as Error).stack,
            processingTime: `${processingTime}ms`,
            string_value: req.params.string_value
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve string'
        });
    }
};
