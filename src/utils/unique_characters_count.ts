/**
 * Counts the number of unique characters in a string
 * @param str - The input string
 * @returns The count of distinct characters in the string
 */
export function getUniqueCharactersCount(str: string): number {
    const uniqueChars = new Set(str);
    return uniqueChars.size;
}
