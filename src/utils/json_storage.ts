import fs from 'fs/promises';
import path from 'path';
import { logger } from '../lib/winston';

const DATA_DIR = path.join(process.cwd(), 'data');
const STRINGS_FILE = path.join(DATA_DIR, 'analyzed_strings.json');

export interface AnalyzedString {
    id: string;
    value: string;
    properties: {
        length: number;
        is_palindrome: boolean;
        unique_characters: number;
        word_count: number;
        sha256_hash: string;
        character_frequency_map: Record<string, number>;
    };
    created_at: string;
}

/**
 * Ensures the data directory exists
 */
async function ensureDataDirectory(): Promise<void> {
    try {
        await fs.access(DATA_DIR);
        logger.debug('Data directory already exists', { path: DATA_DIR });
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
        logger.info('Created data directory', { path: DATA_DIR });
    }
}

/**
 * Reads all analyzed strings from the JSON file
 */
export async function readAnalyzedStrings(): Promise<AnalyzedString[]> {
    await ensureDataDirectory();

    try {
        const data = await fs.readFile(STRINGS_FILE, 'utf-8');
        const strings = JSON.parse(data);
        logger.debug('Successfully read analyzed strings from file', { count: strings.length });
        return strings;
    } catch (error) {
        // If file doesn't exist or is empty, return empty array
        logger.debug('No existing strings file found, returning empty array', { error: (error as Error).message });
        return [];
    }
}

/**
 * Writes analyzed strings to the JSON file
 */
export async function writeAnalyzedStrings(strings: AnalyzedString[]): Promise<void> {
    await ensureDataDirectory();
    await fs.writeFile(STRINGS_FILE, JSON.stringify(strings, null, 2), 'utf-8');
    logger.debug('Successfully wrote analyzed strings to file', { count: strings.length });
}

/**
 * Finds an analyzed string by its value
 */
export async function findAnalyzedStringByValue(value: string): Promise<AnalyzedString | null> {
    logger.debug('Searching for analyzed string by value', { value });
    const strings = await readAnalyzedStrings();
    const found = strings.find(str => str.value === value) || null;

    if (found) {
        logger.debug('Found analyzed string by value', { value, foundValue: found.value });
    } else {
        logger.debug('No analyzed string found with value', { value });
    }

    return found;
}

/**
 * Adds a new analyzed string to storage
 */
export async function addAnalyzedString(analyzedString: AnalyzedString): Promise<void> {
    logger.info('Adding new analyzed string to storage', {
        id: analyzedString.id,
        value: analyzedString.value,
        length: analyzedString.properties.length
    });

    const strings = await readAnalyzedStrings();
    strings.push(analyzedString);
    await writeAnalyzedStrings(strings);

    logger.info('Successfully added analyzed string to storage', { id: analyzedString.id });
}

/**
 * Removes an analyzed string by its ID
 */
export async function removeAnalyzedStringByValue(value: string): Promise<boolean> {
    logger.info('Attempting to remove analyzed string by value', { value });

    const strings = await readAnalyzedStrings();
    const initialLength = strings.length;
    const filteredStrings = strings.filter(str => str.value !== value);

    if (filteredStrings.length < initialLength) {
        await writeAnalyzedStrings(filteredStrings);
        logger.info('Successfully removed analyzed string', { value, removedCount: initialLength - filteredStrings.length });
        return true;
    }

    logger.warn('No analyzed string found to remove', { value });
    return false;
}

/**
 * Checks if a string already exists by its SHA-256 hash
 */
export async function stringExists(hash: string): Promise<boolean> {
    logger.debug('Checking if string exists by hash', { hash });
    const strings = await readAnalyzedStrings();
    const exists = strings.some(str => str.id === hash);

    logger.debug('String existence check result', { hash, exists });
    return exists;
}
