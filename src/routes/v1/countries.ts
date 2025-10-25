import { Router } from "express";
import { CountryController } from '@/controllers/v1/country';

const router = Router();
const countryController = new CountryController();

/**
 * @openapi
 * /api/v1/countries/refresh:
 *   post:
 *     summary: Refresh countries data
 *     description: Fetch all countries and exchange rates from external APIs, then cache them in the database. This endpoint processes country data, calculates estimated GDP, and generates a summary image.
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: Countries refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 *             example:
 *               message: "Countries refreshed successfully"
 *               processed: 250
 *               updated: 200
 *               inserted: 50
 *               total_countries: 250
 *               last_refreshed_at: "2025-10-22T18:00:00Z"
 *       503:
 *         description: External data source unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "External data source unavailable"
 *               details: "Countries API request timed out"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 *               details: "Failed to refresh country data"
 */
router.post('/refresh', countryController.refreshCountries);

/**
 * @openapi
 * /api/v1/countries:
 *   get:
 *     summary: Get all countries
 *     description: Retrieve all countries from the database with optional filtering and sorting capabilities.
 *     tags: [Countries]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter countries by region (e.g., Africa, Europe, Asia)
 *         example: Africa
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *         description: Filter countries by currency code (e.g., USD, EUR, NGN)
 *         example: NGN
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [gdp_desc, gdp_asc, population_desc, population_asc, name_asc, name_desc]
 *         description: Sort countries by specified criteria
 *         example: gdp_desc
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *         description: Maximum number of countries to return
 *         example: 100
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of countries to skip
 *         example: 0
 *     responses:
 *       200:
 *         description: List of countries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Country'
 *             example:
 *               - id: 1
 *                 name: "Nigeria"
 *                 capital: "Abuja"
 *                 region: "Africa"
 *                 population: 206139589
 *                 currency_code: "NGN"
 *                 exchange_rate: 1600.23
 *                 estimated_gdp: 25767448125.2
 *                 flag_url: "https://flagcdn.com/ng.svg"
 *                 last_refreshed_at: "2025-10-22T18:00:00Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 *               details: "Failed to fetch countries"
 */
router.get('/', countryController.getCountries);

/**
 * @openapi
 * /api/v1/countries/image:
 *   get:
 *     summary: Get summary image
 *     description: Serve the generated summary image containing total countries, top 5 countries by GDP, and last refresh timestamp. The image is generated automatically after each refresh operation.
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: Summary image retrieved successfully
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *             description: PNG image containing country data summary
 *       404:
 *         description: Summary image not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Summary image not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 *               details: "Failed to serve summary image"
 */
router.get('/image', countryController.getSummaryImage);

/**
 * @openapi
 * /api/v1/countries/{name}:
 *   get:
 *     summary: Get country by name
 *     description: Retrieve a specific country by its name (case-insensitive).
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the country to retrieve
 *         example: Nigeria
 *     responses:
 *       200:
 *         description: Country retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Country'
 *             example:
 *               id: 1
 *               name: "Nigeria"
 *               capital: "Abuja"
 *               region: "Africa"
 *               population: 206139589
 *               currency_code: "NGN"
 *               exchange_rate: 1600.23
 *               estimated_gdp: 25767448125.2
 *               flag_url: "https://flagcdn.com/ng.svg"
 *               last_refreshed_at: "2025-10-22T18:00:00Z"
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Validation failed"
 *               details: { name: "is required" }
 *       404:
 *         description: Country not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Country not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 *               details: "Failed to fetch country"
 */
router.get('/:name', countryController.getCountryByName);

/**
 * @openapi
 * /api/v1/countries/{name}:
 *   delete:
 *     summary: Delete country by name
 *     description: Delete a specific country record by its name (case-insensitive).
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the country to delete
 *         example: Nigeria
 *     responses:
 *       200:
 *         description: Country deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Country deleted successfully"
 *                 name:
 *                   type: string
 *                   example: "Nigeria"
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Validation failed"
 *               details: { name: "is required" }
 *       404:
 *         description: Country not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Country not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 *               details: "Failed to delete country"
 */
router.delete('/:name', countryController.deleteCountryByName);

export default router;
