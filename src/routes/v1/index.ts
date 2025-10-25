import { Router } from "express";
import profileRoutes from './profile';
import stringRoutes from './string';
import countryRoutes from './countries';
import { CountryController } from '@/controllers/v1/country';

const router = Router();
const countryController = new CountryController();

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Welcome
 *     description: Welcome endpoint providing basic API information and links to documentation.
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Welcome message with API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Welcome to the Country Data API!"
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 docs:
 *                   type: string
 *                   example: "/api-docs"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-22T18:00:00Z"
 */
router.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the Country Data API!',
        status: 'OK',
        version: '1.0.0',
        docs: "/api-docs",
        timestamp: new Date().toISOString(),
    });
});

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Get API status
 *     description: Retrieve the total number of countries in the database and the timestamp of the last refresh operation.
 *     tags: [Status]
 *     responses:
 *       200:
 *         description: Status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatusResponse'
 *             example:
 *               total_countries: 250
 *               last_refreshed_at: "2025-10-22T18:00:00Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 *               details: "Failed to fetch status"
 */
router.get('/status', countryController.getStatus);

router.use('/', profileRoutes);
router.use('/strings', stringRoutes);
router.use('/countries', countryRoutes);

export default router;