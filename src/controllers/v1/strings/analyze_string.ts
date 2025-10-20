import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
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
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                error: 'Invalid data type for "value" (must be string)',
                details: errors.array()
            });
            return;
        }

        const { value } = req.body;

        // Generate SHA-256 hash for unique identification
        const sha256Hash = getSha256Hash(value);

        // Check if string already exists
        if (await stringExists(sha256Hash)) {
            res.status(409).json({
                error: 'String already exists in the system',
                id: sha256Hash
            });
            return;
        }

        // Compute all properties
        const properties = {
            length: getStringLength(value),
            is_palindrome: isPalindrome(value),
            unique_characters: getUniqueCharactersCount(value),
            word_count: getWordCount(value),
            sha256_hash: sha256Hash,
            character_frequency_map: getCharacterFrequencyMap(value)
        };

        // Create analyzed string object
        const analyzedString: AnalyzedString = {
            id: sha256Hash,
            value,
            properties,
            created_at: new Date().toISOString()
        };

        // Store in JSON file
        await addAnalyzedString(analyzedString);

        // Return success response
        res.status(201).json(analyzedString);

    } catch (error) {
        console.error('Error analyzing string:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to analyze string'
        });
    }
};
