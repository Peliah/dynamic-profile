import { Request, Response } from 'express';
import { logger } from '../../../lib/winston';
import { readAnalyzedStrings } from '../../../utils/json_storage';
import {
    validateFilterParameters,
    applyFilters,
    FilterParameters
} from '../../../utils/string_filters';


/**
 * Parses natural language queries into filter parameters
 */
function parseNaturalLanguageQuery(query: string): { filters: FilterParameters; conflicts: string[] } {
    const filters: FilterParameters = {};
    const conflicts: string[] = [];
    const lowerQuery = query.toLowerCase();

    logger.debug('Parsing natural language query', { query, lowerQuery });

    // Parse palindrome-related queries
    if (lowerQuery.includes('palindrom')) {
        if (lowerQuery.includes('not') || lowerQuery.includes('non')) {
            filters.is_palindrome = false;
        } else {
            filters.is_palindrome = true;
        }
    }

    // Parse word count queries
    if (lowerQuery.includes('single word') || lowerQuery.includes('one word')) {
        filters.word_count = 1;
    } else if (lowerQuery.includes('two word') || lowerQuery.includes('double word')) {
        filters.word_count = 2;
    } else if (lowerQuery.includes('three word')) {
        filters.word_count = 3;
    } else if (lowerQuery.includes('word')) {
        // Extract number from phrases like "5 word strings"
        const wordMatch = lowerQuery.match(/(\d+)\s*word/);
        if (wordMatch) {
            filters.word_count = parseInt(wordMatch[1]);
        }
    }

    // Parse length queries
    if (lowerQuery.includes('longer than') || lowerQuery.includes('more than')) {
        const lengthMatch = lowerQuery.match(/(?:longer than|more than)\s*(\d+)/);
        if (lengthMatch) {
            filters.min_length = parseInt(lengthMatch[1]) + 1;
        }
    } else if (lowerQuery.includes('shorter than') || lowerQuery.includes('less than')) {
        const lengthMatch = lowerQuery.match(/(?:shorter than|less than)\s*(\d+)/);
        if (lengthMatch) {
            filters.max_length = parseInt(lengthMatch[1]) - 1;
        }
    } else if (lowerQuery.includes('exactly') && lowerQuery.includes('character')) {
        const lengthMatch = lowerQuery.match(/exactly\s*(\d+)\s*character/);
        if (lengthMatch) {
            const exactLength = parseInt(lengthMatch[1]);
            filters.min_length = exactLength;
            filters.max_length = exactLength;
        }
    } else if (lowerQuery.includes('character')) {
        // Extract number from phrases like "10 characters"
        const lengthMatch = lowerQuery.match(/(\d+)\s*character/);
        if (lengthMatch) {
            const length = parseInt(lengthMatch[1]);
            if (lowerQuery.includes('at least') || lowerQuery.includes('minimum')) {
                filters.min_length = length;
            } else if (lowerQuery.includes('at most') || lowerQuery.includes('maximum')) {
                filters.max_length = length;
            } else {
                // Default to minimum length if no qualifier
                filters.min_length = length;
            }
        }
    }

    // Parse character containment queries
    const characterPatterns = [
        /contains?\s+the\s+letter\s+([a-z])/,
        /contains?\s+([a-z])/,
        /with\s+([a-z])/,
        /having\s+([a-z])/,
        /that\s+have\s+([a-z])/,
        /including\s+([a-z])/,
        /first\s+vowel/,
        /last\s+vowel/,
        /letter\s+([a-z])/
    ];

    for (const pattern of characterPatterns) {
        const match = lowerQuery.match(pattern);
        if (match) {
            if (match[1]) {
                filters.contains_character = match[1];
            } else if (pattern.source.includes('first vowel')) {
                filters.contains_character = 'a';
            } else if (pattern.source.includes('last vowel')) {
                filters.contains_character = 'u';
            }
            break;
        }
    }

    // Check for conflicts
    if (filters.min_length !== undefined && filters.max_length !== undefined) {
        if (filters.min_length > filters.max_length) {
            conflicts.push('min_length cannot be greater than max_length');
        }
    }

    logger.debug('Parsed natural language query', { filters, conflicts });

    return { filters, conflicts };
}

/**
 * Filters strings using natural language queries
 */
export const filterByNaturalLanguage = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();

    try {
        const { query } = req.query;

        logger.info('Natural language filter request received', {
            query,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Validate query parameter
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            logger.warn('Invalid or missing query parameter');
            res.status(400).json({
                error: 'Unable to parse natural language query',
                message: 'Query parameter is required and must be a non-empty string'
            });
            return;
        }

        const trimmedQuery = query.trim();

        // Parse the natural language query
        const { filters, conflicts } = parseNaturalLanguageQuery(trimmedQuery);

        // Check for parsing conflicts
        if (conflicts.length > 0) {
            logger.warn('Query parsed but resulted in conflicting filters', {
                query: trimmedQuery,
                conflicts
            });

            res.status(422).json({
                error: 'Query parsed but resulted in conflicting filters',
                details: conflicts,
                interpreted_query: {
                    original: trimmedQuery,
                    parsed_filters: filters
                }
            });
            return;
        }

        // Validate parsed filters using shared utility
        const validationErrors = validateFilterParameters(filters);

        if (validationErrors.length > 0) {
            logger.warn('Invalid filters parsed from natural language query', {
                query: trimmedQuery,
                errors: validationErrors
            });

            res.status(400).json({
                error: 'Unable to parse natural language query',
                message: 'Parsed filters contain invalid values',
                details: validationErrors.map(err => err.message),
                interpreted_query: {
                    original: trimmedQuery,
                    parsed_filters: filters
                }
            });
            return;
        }

        // Check if any filters were parsed
        if (Object.keys(filters).length === 0) {
            logger.warn('No filters could be parsed from query', { query: trimmedQuery });
            res.status(400).json({
                error: 'Unable to parse natural language query',
                message: 'No recognizable filters found in the query',
                interpreted_query: {
                    original: trimmedQuery,
                    parsed_filters: {}
                }
            });
            return;
        }

        // Get all strings and apply filters using shared utility
        const allStrings = await readAnalyzedStrings();
        logger.debug('Retrieved all strings from storage', { totalCount: allStrings.length });

        const filteredStrings = applyFilters(allStrings, filters);

        logger.debug('Applied natural language filters', {
            originalCount: allStrings.length,
            filteredCount: filteredStrings.length,
            filters
        });

        const processingTime = Date.now() - startTime;
        logger.info('Natural language filtering completed successfully', {
            query: trimmedQuery,
            filters,
            count: filteredStrings.length,
            processingTime: `${processingTime}ms`
        });

        res.status(200).json({
            data: filteredStrings,
            count: filteredStrings.length,
            interpreted_query: {
                original: trimmedQuery,
                parsed_filters: filters
            }
        });

    } catch (error) {
        const processingTime = Date.now() - startTime;
        logger.error('Error processing natural language filter', {
            error: (error as Error).message,
            stack: (error as Error).stack,
            processingTime: `${processingTime}ms`,
            query: req.query.query
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process natural language query'
        });
    }
};
