import { createCanvas, loadImage, Canvas, CanvasRenderingContext2D } from 'canvas';
import fs from 'fs';
import path from 'path';
import { Country } from '@/models/country';
import { logger } from '@/lib/winston';

export class ImageGenerationService {
    private static readonly IMAGE_WIDTH = 800;
    private static readonly IMAGE_HEIGHT = 600;
    private static readonly CACHE_DIR = 'cache';
    private static readonly IMAGE_PATH = path.join(this.CACHE_DIR, 'summary.png');

    static async generateSummaryImage(countries: Country[], totalCountries: number, lastRefreshTime: Date): Promise<string> {
        try {
            // Ensure cache directory exists
            if (!fs.existsSync(this.CACHE_DIR)) {
                fs.mkdirSync(this.CACHE_DIR, { recursive: true });
            }

            const canvas = createCanvas(this.IMAGE_WIDTH, this.IMAGE_HEIGHT);
            const ctx = canvas.getContext('2d');

            // Set background
            this.drawBackground(ctx);

            // Draw title
            this.drawTitle(ctx);

            // Draw total countries
            this.drawTotalCountries(ctx, totalCountries);

            // Draw top 5 countries by GDP
            const topCountries = this.getTopCountriesByGdp(countries, 5);
            this.drawTopCountries(ctx, topCountries);

            // Draw timestamp
            this.drawTimestamp(ctx, lastRefreshTime);

            // Save image
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(this.IMAGE_PATH, buffer);

            logger.info(`Summary image generated successfully at ${this.IMAGE_PATH}`);
            return this.IMAGE_PATH;
        } catch (error) {
            logger.error('Error generating summary image:', error);
            throw error;
        }
    }

    private static drawBackground(ctx: CanvasRenderingContext2D): void {
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, this.IMAGE_HEIGHT);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.IMAGE_WIDTH, this.IMAGE_HEIGHT);
    }

    private static drawTitle(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Country Data Summary', this.IMAGE_WIDTH / 2, 60);
    }

    private static drawTotalCountries(ctx: CanvasRenderingContext2D, totalCountries: number): void {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Total Countries: ${totalCountries}`, this.IMAGE_WIDTH / 2, 120);
    }

    private static drawTopCountries(ctx: CanvasRenderingContext2D, countries: Country[]): void {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Top 5 Countries by Estimated GDP:', 50, 180);

        ctx.font = '16px Arial';
        let yPosition = 220;

        countries.forEach((country, index) => {
            const gdpText = country.estimated_gdp
                ? `$${country.estimated_gdp.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                : 'N/A';

            const text = `${index + 1}. ${country.name} - ${gdpText}`;
            ctx.fillText(text, 50, yPosition);
            yPosition += 30;
        });
    }

    private static drawTimestamp(ctx: CanvasRenderingContext2D, lastRefreshTime: Date): void {
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';

        const timestamp = lastRefreshTime.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        });

        ctx.fillText(`Last Updated: ${timestamp}`, this.IMAGE_WIDTH / 2, this.IMAGE_HEIGHT - 30);
    }

    private static getTopCountriesByGdp(countries: Country[], limit: number): Country[] {
        return countries
            .filter(country => country.estimated_gdp !== null && country.estimated_gdp !== undefined)
            .sort((a, b) => (b.estimated_gdp || 0) - (a.estimated_gdp || 0))
            .slice(0, limit);
    }

    static getImagePath(): string {
        return this.IMAGE_PATH;
    }

    static imageExists(): boolean {
        return fs.existsSync(this.IMAGE_PATH);
    }

    static deleteImage(): void {
        if (fs.existsSync(this.IMAGE_PATH)) {
            fs.unlinkSync(this.IMAGE_PATH);
            logger.info('Summary image deleted');
        }
    }
}

export default ImageGenerationService;
