import { Request, Response } from 'express';
import { logger } from '../../../lib/winston';
import { readAnalyzedStrings } from '../../../utils/json_storage';

/**
 * Gets all analyzed strings with optional pagination and filtering
 */
export const getStrings = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();

    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        // Extract filter parameters
        const filters = {
            is_palindrome: req.query.is_palindrome as string | undefined,
            min_length: req.query.min_length as string | undefined,
            max_length: req.query.max_length as string | undefined,
            word_count: req.query.word_count as string | undefined,
            contains_character: req.query.contains_character as string | undefined
        };

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
        const validationErrors: string[] = [];

        if (filters.is_palindrome !== undefined && !['true', 'false'].includes(filters.is_palindrome)) {
            validationErrors.push('is_palindrome must be "true" or "false"');
        }

        if (filters.min_length !== undefined) {
            const minLength = parseInt(filters.min_length);
            if (isNaN(minLength) || minLength < 0) {
                validationErrors.push('min_length must be a non-negative integer');
            }
        }

        if (filters.max_length !== undefined) {
            const maxLength = parseInt(filters.max_length);
            if (isNaN(maxLength) || maxLength < 0) {
                validationErrors.push('max_length must be a non-negative integer');
            }
        }

        if (filters.word_count !== undefined) {
            const wordCount = parseInt(filters.word_count);
            if (isNaN(wordCount) || wordCount < 0) {
                validationErrors.push('word_count must be a non-negative integer');
            }
        }

        if (filters.contains_character !== undefined && filters.contains_character.length !== 1) {
            validationErrors.push('contains_character must be a single character');
        }

        // Check for logical conflicts
        if (filters.min_length && filters.max_length) {
            const minLength = parseInt(filters.min_length);
            const maxLength = parseInt(filters.max_length);
            if (minLength > maxLength) {
                validationErrors.push('min_length cannot be greater than max_length');
            }
        }

        if (validationErrors.length > 0) {
            logger.warn('Invalid filter parameters provided', {
                errors: validationErrors,
                filters
            });

            res.status(400).json({
                error: 'Invalid query parameter values or types',
                details: validationErrors
            });
            return;
        }

        const allStrings = await readAnalyzedStrings();
        logger.debug('Retrieved all strings from storage', { totalCount: allStrings.length });



        // Apply filters
        let filteredStrings = allStrings.filter(string => {
            // is_palindrome filter
            if (filters.is_palindrome !== undefined) {
                const isPalindrome = filters.is_palindrome === 'true';
                if (string.properties.is_palindrome !== isPalindrome) {
                    return false;
                }
            }

            // min_length filter
            if (filters.min_length !== undefined) {
                const minLength = parseInt(filters.min_length);
                if (string.properties.length < minLength) {
                    return false;
                }
            }

            // max_length filter
            if (filters.max_length !== undefined) {
                const maxLength = parseInt(filters.max_length);
                if (string.properties.length > maxLength) {
                    return false;
                }
            }

            // word_count filter
            if (filters.word_count !== undefined) {
                const wordCount = parseInt(filters.word_count);
                if (string.properties.word_count !== wordCount) {
                    return false;
                }
            }

            // contains_character filter
            if (filters.contains_character !== undefined) {
                if (!string.value.toLowerCase().includes(filters.contains_character.toLowerCase())) {
                    return false;
                }
            }

            return true;
        });

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

        // Build filters_applied object (only include applied filters)
        const filtersApplied: Record<string, any> = {};
        if (filters.is_palindrome !== undefined) {
            filtersApplied.is_palindrome = filters.is_palindrome === 'true';
        }
        if (filters.min_length !== undefined) {
            filtersApplied.min_length = parseInt(filters.min_length);
        }
        if (filters.max_length !== undefined) {
            filtersApplied.max_length = parseInt(filters.max_length);
        }
        if (filters.word_count !== undefined) {
            filtersApplied.word_count = parseInt(filters.word_count);
        }
        if (filters.contains_character !== undefined) {
            filtersApplied.contains_character = filters.contains_character;
        }

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
