import { Router } from "express";
import getProfile from "@/controllers/v1/profile/get_profile";

const router = Router();

/** 
 * @openapi
 * /api/v1/me:
 *   get:
 *     summary: Get dynamic profile with cat fact
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Successfully retrieved profile with cat fact
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "peliah@example.com"
 *                     name:
 *                       type: string
 *                       example: "Peliah Developer"
 *                     stack:
 *                       type: string
 *                       example: "Node.js/Express"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-15T12:34:56.789Z"
 *                 fact:
 *                   type: string
 *                   example: "The technical term for a cat's hairball is a 'bezoar.'"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch cat fact"
 */
router.get('/me', getProfile);

export default router;
