import { createHash } from 'crypto';

/**
 * Generates a SHA-256 hash of the input string
 * @param str - The input string
 * @returns SHA-256 hash of the string
 */
export function getSha256Hash(str: string): string {
    return createHash('sha256').update(str).digest('hex');
}
