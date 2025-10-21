import { Router } from 'express';
import { analyzeString, validateAnalyzeString } from '../../controllers/v1/strings/analyze_string';
import { getString } from '../../controllers/v1/strings/get_string';
import { getStrings } from '../../controllers/v1/strings/get_strings';
import { deleteString } from '../../controllers/v1/strings/delete_string';
import { filterByNaturalLanguage } from '../../controllers/v1/strings/filter_by_natural_language';

const router = Router();

/**
 * @openapi
 * /api/v1/strings:
 *   post:
 *     summary: Analyze and store a string
 *     tags: [Strings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *                 description: The string to analyze
 *                 example: "Hello World!"
 *     responses:
 *       201:
 *         description: String analyzed and stored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: SHA-256 hash of the string
 *                 value:
 *                   type: string
 *                   description: The original string
 *                 properties:
 *                   type: object
 *                   properties:
 *                     length:
 *                       type: number
 *                     is_palindrome:
 *                       type: boolean
 *                     unique_characters:
 *                       type: number
 *                     word_count:
 *                       type: number
 *                     sha256_hash:
 *                       type: string
 *                     character_frequency_map:
 *                       type: object
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - Invalid request body or missing value field
 *       409:
 *         description: Conflict - String already exists in the system
 *       422:
 *         description: Unprocessable Entity - Invalid data type for value
 */
router.post('/', validateAnalyzeString, analyzeString);

/**
 * @openapi
 * /api/v1/strings:
 *   get:
 *     summary: Get all analyzed strings with pagination and filtering
 *     tags: [Strings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: is_palindrome
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by palindrome status
 *         example: "true"
 *       - in: query
 *         name: min_length
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Minimum string length
 *         example: 5
 *       - in: query
 *         name: max_length
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Maximum string length
 *         example: 20
 *       - in: query
 *         name: word_count
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Exact word count
 *         example: 2
 *       - in: query
 *         name: contains_character
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 1
 *         description: Single character to search for
 *         example: "a"
 *     responses:
 *       200:
 *         description: List of analyzed strings with pagination and filter info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       value:
 *                         type: string
 *                       properties:
 *                         type: object
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 count:
 *                   type: integer
 *                   description: Total count of filtered results
 *                 filters_applied:
 *                   type: object
 *                   description: Applied filters with their values
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalCount:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       400:
 *         description: Bad request - Invalid pagination or filter parameters
 */
router.get('/', getStrings);

/**
 * @openapi
 * /api/v1/strings/filter-by-natural-language:
 *   get:
 *     summary: Filter strings using natural language queries
 *     tags: [Strings]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Natural language query to parse into filters
 *         examples:
 *           single_word_palindromes:
 *             summary: Single word palindromes
 *             value: "all single word palindromic strings"
 *           long_strings:
 *             summary: Long strings
 *             value: "strings longer than 10 characters"
 *           palindromes_with_vowel:
 *             summary: Palindromes with vowel
 *             value: "palindromic strings that contain the first vowel"
 *           strings_with_z:
 *             summary: Strings with letter z
 *             value: "strings containing the letter z"
 *     responses:
 *       200:
 *         description: Strings matching the natural language query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       value:
 *                         type: string
 *                       properties:
 *                         type: object
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 count:
 *                   type: integer
 *                   description: Number of matching strings
 *                 interpreted_query:
 *                   type: object
 *                   properties:
 *                     original:
 *                       type: string
 *                       description: The original query
 *                     parsed_filters:
 *                       type: object
 *                       description: Parsed filter parameters
 *       400:
 *         description: Bad request - Unable to parse natural language query
 *       422:
 *         description: Unprocessable Entity - Query parsed but resulted in conflicting filters
 *       500:
 *         description: Internal server error
 */
router.get('/filter-by-natural-language', filterByNaturalLanguage);

/**
 * @openapi
 * /api/v1/strings/{string_value}:
 *   get:
 *     summary: Get a specific analyzed string by its value
 *     tags: [Strings]
 *     parameters:
 *       - in: path
 *         name: string_value
 *         required: true
 *         schema:
 *           type: string
 *         description: The actual string value to search for
 *         example: "Hello World!"
 *     responses:
 *       200:
 *         description: Analyzed string found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: SHA-256 hash of the string
 *                 value:
 *                   type: string
 *                   description: The original string
 *                 properties:
 *                   type: object
 *                   properties:
 *                     length:
 *                       type: number
 *                     is_palindrome:
 *                       type: boolean
 *                     unique_characters:
 *                       type: number
 *                     word_count:
 *                       type: number
 *                     sha256_hash:
 *                       type: string
 *                     character_frequency_map:
 *                       type: object
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - String value is required
 *       404:
 *         description: String not found
 */
router.get('/:string_value', getString);

/**
 * @openapi
 * /api/v1/strings/{string_value}:
 *   delete:
 *     summary: Delete a specific analyzed string by its value
 *     tags: [Strings]
 *     parameters:
 *       - in: path
 *         name: string_value
 *         required: true
 *         schema:
 *           type: string
 *         description: The actual string value to delete
 *         example: "Hello World!"
 *     responses:
 *       204:
 *         description: String deleted successfully (No Content)
 *       400:
 *         description: Bad request - String value is required
 *       404:
 *         description: String not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:string_value', deleteString);

export default router;
