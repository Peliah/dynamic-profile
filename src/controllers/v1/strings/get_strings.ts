import { Request, Response } from 'express';
import { logger } from '../../../lib/winston';
import { readAnalyzedStrings } from '../../../utils/json_storage';
import {
    parseQueryFilters,
    validateFilterParameters,
    applyFilters,
    buildFiltersApplied,
    FilterParameters
} from '../../../utils/string_filters';

/**
 * Gets all analyzed strings with optional pagination and filtering
 */
export const getStrings = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();

    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        // Extract and parse filter parameters
        const filters = parseQueryFilters(req.query);

        logger.info('Get strings request received', {
            page,
            limit,
            offset,
            filters,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            logger.warn('Invalid pagination parameters provided', {
                page,
                limit,
                isValidPage: page >= 1,
                isValidLimit: limit >= 1 && limit <= 100
            });

            res.status(400).json({
                error: 'Invalid pagination parameters',
                message: 'Page must be >= 1, limit must be between 1 and 100'
            });
            return;
        }

        // Validate filter parameters
        const validationErrors = validateFilterParameters(filters);

        if (validationErrors.length > 0) {
            logger.warn('Invalid filter parameters provided', {
                errors: validationErrors,
                filters
            });

            res.status(400).json({
                error: 'Invalid query parameter values or types',
                details: validationErrors.map(err => err.message)
            });
            return;
        }

        const allStrings = await readAnalyzedStrings();
        logger.debug('Retrieved all strings from storage', { totalCount: allStrings.length });

        // Apply filters using shared utility
        const filteredStrings = applyFilters(allStrings, filters as FilterParameters);

        logger.debug('Applied filters to strings', {
            originalCount: allStrings.length,
            filteredCount: filteredStrings.length
        });

        // Apply pagination to filtered results
        const paginatedStrings = filteredStrings.slice(offset, offset + limit);

        // Calculate pagination metadata
        const totalCount = filteredStrings.length;
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        // Build filters_applied object using shared utility
        const filtersApplied = buildFiltersApplied(filters);

        const processingTime = Date.now() - startTime;
        logger.info('Strings retrieved successfully with filters', {
            page,
            limit,
            totalCount,
            returnedCount: paginatedStrings.length,
            filtersApplied,
            processingTime: `${processingTime}ms`
        });

        res.status(200).json({
            data: paginatedStrings,
            count: totalCount,
            filters_applied: filtersApplied,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {
        const processingTime = Date.now() - startTime;
        logger.error('Error getting strings', {
            error: (error as Error).message,
            stack: (error as Error).stack,
            processingTime: `${processingTime}ms`,
            query: req.query
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve strings'
        });
    }
};
