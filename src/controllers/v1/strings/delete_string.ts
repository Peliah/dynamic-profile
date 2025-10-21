import { Request, Response } from 'express';
import { logger } from '../../../lib/winston';
import { removeAnalyzedStringByValue } from '../../../utils/json_storage';

/**
 * Deletes a specific analyzed string by its value
 */
export const deleteString = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();

    try {
        const { string_value } = req.params;

        logger.info('Delete string request received', {
            string_value,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Validate that string_value is provided
        if (!string_value) {
            logger.warn('No string value provided for deletion');
            res.status(400).json({
                error: 'String value is required',
                message: 'Please provide a string value in the URL path'
            });
            return;
        }

        const deleted = await removeAnalyzedStringByValue(string_value);

        if (!deleted) {
            logger.warn('String not found for deletion', { string_value });
            res.status(404).json({
                error: 'String not found',
                message: 'No analyzed string found with the provided value'
            });
            return;
        }

        const processingTime = Date.now() - startTime;
        logger.info('String deleted successfully', {
            string_value,
            processingTime: `${processingTime}ms`
        });

        // Return 204 No Content (empty response body)
        res.status(204).send();

    } catch (error) {
        const processingTime = Date.now() - startTime;
        logger.error('Error deleting string', {
            error: (error as Error).message,
            stack: (error as Error).stack,
            processingTime: `${processingTime}ms`,
            string_value: req.params.string_value
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete string'
        });
    }
};
