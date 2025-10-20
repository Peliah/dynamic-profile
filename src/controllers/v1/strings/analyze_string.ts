import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { logger } from '../../../lib/winston';
import {
    getStringLength,
    isPalindrome,
    getUniqueCharactersCount,
    getWordCount,
    getSha256Hash,
    getCharacterFrequencyMap
} from '../../../utils';
import { addAnalyzedString, stringExists } from '../../../utils/json_storage';
import { AnalyzedString } from '../../../models/analyzed_string';

/**
 * Validates the request body for string analysis
 */
export const validateAnalyzeString = [
    body('value')
        .notEmpty()
        .withMessage('Value field is required')
        .isString()
        .withMessage('Value must be a string')
        .trim()
];

/**
 * Analyzes a string and stores its computed properties
 */
export const analyzeString = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();

    try {
        logger.info('String analysis request received', {
            body: req.body,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn('String analysis validation failed', {
                errors: errors.array(),
                body: req.body
            });

            res.status(422).json({
                error: 'Invalid data type for "value" (must be string)',
                details: errors.array()
            });
            return;
        }

        const { value } = req.body;
        logger.debug('Starting string analysis', { value, length: value.length });

        // Generate SHA-256 hash for unique identification
        const sha256Hash = getSha256Hash(value);
        logger.debug('Generated SHA-256 hash', { hash: sha256Hash });

        // Check if string already exists
        if (await stringExists(sha256Hash)) {
            logger.warn('String already exists in system', {
                hash: sha256Hash,
                value: value.substring(0, 50) + (value.length > 50 ? '...' : '')
            });

            res.status(409).json({
                error: 'String already exists in the system',
                id: sha256Hash
            });
            return;
        }

        // Compute all properties
        logger.debug('Computing string properties');
        const properties = {
            length: getStringLength(value),
            is_palindrome: isPalindrome(value),
            unique_characters: getUniqueCharactersCount(value),
            word_count: getWordCount(value),
            sha256_hash: sha256Hash,
            character_frequency_map: getCharacterFrequencyMap(value)
        };

        logger.debug('String properties computed', {
            properties: {
                length: properties.length,
                is_palindrome: properties.is_palindrome,
                unique_characters: properties.unique_characters,
                word_count: properties.word_count
            }
        });

        // Create analyzed string object
        const analyzedString: AnalyzedString = {
            id: sha256Hash,
            value,
            properties,
            created_at: new Date().toISOString()
        };

        // Store in JSON file
        await addAnalyzedString(analyzedString);

        const processingTime = Date.now() - startTime;
        logger.info('String analysis completed successfully', {
            id: sha256Hash,
            processingTime: `${processingTime}ms`,
            properties: {
                length: properties.length,
                is_palindrome: properties.is_palindrome,
                unique_characters: properties.unique_characters,
                word_count: properties.word_count
            }
        });

        // Return success response
        res.status(201).json(analyzedString);

    } catch (error) {
        const processingTime = Date.now() - startTime;
        logger.error('Error analyzing string', {
            error: (error as Error).message,
            stack: (error as Error).stack,
            processingTime: `${processingTime}ms`,
            body: req.body
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to analyze string'
        });
    }
};
