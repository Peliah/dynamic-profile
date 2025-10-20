import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const STRINGS_FILE = path.join(DATA_DIR, 'analyzed_strings.json');

export interface AnalyzedString {
    id: string; // SHA-256 hash
    value: string;
    properties: {
        length: number;
        is_palindrome: boolean;
        unique_characters: number;
        word_count: number;
        sha256_hash: string;
        character_frequency_map: Record<string, number>;
    };
    created_at: string; // ISO string
}

/**
 * Ensures the data directory exists
 */
async function ensureDataDirectory(): Promise<void> {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

/**
 * Reads all analyzed strings from the JSON file
 */
export async function readAnalyzedStrings(): Promise<AnalyzedString[]> {
    await ensureDataDirectory();

    try {
        const data = await fs.readFile(STRINGS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or is empty, return empty array
        return [];
    }
}

/**
 * Writes analyzed strings to the JSON file
 */
export async function writeAnalyzedStrings(strings: AnalyzedString[]): Promise<void> {
    await ensureDataDirectory();
    await fs.writeFile(STRINGS_FILE, JSON.stringify(strings, null, 2), 'utf-8');
}

/**
 * Finds an analyzed string by its ID (SHA-256 hash)
 */
export async function findAnalyzedStringById(id: string): Promise<AnalyzedString | null> {
    const strings = await readAnalyzedStrings();
    return strings.find(str => str.id === id) || null;
}

/**
 * Adds a new analyzed string to storage
 */
export async function addAnalyzedString(analyzedString: AnalyzedString): Promise<void> {
    const strings = await readAnalyzedStrings();
    strings.push(analyzedString);
    await writeAnalyzedStrings(strings);
}

/**
 * Removes an analyzed string by its ID
 */
export async function removeAnalyzedStringById(id: string): Promise<boolean> {
    const strings = await readAnalyzedStrings();
    const initialLength = strings.length;
    const filteredStrings = strings.filter(str => str.id !== id);

    if (filteredStrings.length < initialLength) {
        await writeAnalyzedStrings(filteredStrings);
        return true;
    }

    return false;
}

/**
 * Checks if a string already exists by its SHA-256 hash
 */
export async function stringExists(hash: string): Promise<boolean> {
    const strings = await readAnalyzedStrings();
    return strings.some(str => str.id === hash);
}
