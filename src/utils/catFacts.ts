import { logger } from '@/lib/winston';

export interface CatFactResponse {
    fact: string;
    length: number;
}

export interface CatFactError extends Error {
    code?: string;
}

/**
 * Fetches a random cat fact from the Cat Facts API
 * @param timeoutMs - Timeout in milliseconds (default: 5000)
 * @returns Promise<CatFactResponse>
 * @throws CatFactError if the API call fails
 */
export const fetchCatFact = async (timeoutMs: number = 5000): Promise<CatFactResponse> => {
    try {
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                const error = new Error('Cat Facts API request timeout') as CatFactError;
                error.code = 'TIMEOUT';
                reject(error);
            }, timeoutMs);
        });

        const fetchPromise = fetch('https://catfact.ninja/fact', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Dynamic-Profile-API/1.0.0'
            }
        });

        const response = await Promise.race([fetchPromise, timeoutPromise]);

        if (!response.ok) {
            const error = new Error(`Cat Facts API returned status: ${response.status}`) as CatFactError;
            error.code = 'API_ERROR';
            throw error;
        }

        const data: CatFactResponse = await response.json();

        if (!data.fact || typeof data.fact !== 'string') {
            const error = new Error('Invalid cat fact response structure') as CatFactError;
            error.code = 'INVALID_RESPONSE';
            throw error;
        }

        logger.info('Successfully fetched cat fact from API');
        return data;

    } catch (error) {
        logger.error('Error fetching cat fact:', error);

        if (error instanceof Error) {
            const catFactError = error as CatFactError;
            throw catFactError;
        }

        const unknownError = new Error('Unknown error occurred while fetching cat fact') as CatFactError;
        unknownError.code = 'UNKNOWN_ERROR';
        throw unknownError;
    }
};

/**
 * Gets a cat fact with fallback handling
 * @param timeoutMs - Timeout in milliseconds (default: 5000)
 * @returns Promise<string> - Always returns a cat fact string
 */
export const getCatFactWithFallback = async (timeoutMs: number = 5000): Promise<string> => {
    try {
        const catFactData = await fetchCatFact(timeoutMs);
        return catFactData.fact;
    } catch (error) {
        logger.warn('Using fallback cat fact due to API error:', error);

        const fallbackFacts = [
            'Cats have been companions to humans for over 4,000 years.',
            'A group of cats is called a "clowder."',
            'Cats spend 70% of their lives sleeping.',
            'A cat\'s purr vibrates at a frequency that helps promote healing.',
            'Cats have a third eyelid called a nictitating membrane.'
        ];

        const randomFallback = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
        return randomFallback;
    }
};
