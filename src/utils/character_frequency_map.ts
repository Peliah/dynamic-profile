/**
 * Creates a frequency map of characters in a string
 * @param str - The input string
 * @returns Object mapping each character to its occurrence count
 */
export function getCharacterFrequencyMap(str: string): Record<string, number> {
    const frequencyMap: Record<string, number> = {};

    for (const char of str) {
        frequencyMap[char] = (frequencyMap[char] || 0) + 1;
    }

    return frequencyMap;
}
