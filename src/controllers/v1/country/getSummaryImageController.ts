import { Request, Response } from 'express';
import ImageGenerationService from '@/services/imageGenerationService';
import { logger } from '@/lib/winston';

export class GetSummaryImageController {
    /**
     * GET /countries/image
     * Serve the generated summary image
     */
    public getSummaryImage = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!ImageGenerationService.imageExists()) {
                res.status(404).json({
                    error: 'Summary image not found'
                });
                return;
            }

            const imagePath = ImageGenerationService.getImagePath();
            res.sendFile(imagePath, { root: process.cwd() });
        } catch (error) {
            logger.error('Error serving summary image:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: 'Failed to serve summary image'
            });
        }
    };
}

export default GetSummaryImageController;
