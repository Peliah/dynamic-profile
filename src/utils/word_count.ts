/**
 * Counts the number of words in a string separated by whitespace
 * @param str - The input string
 * @returns The number of words in the string
 */
export function getWordCount(str: string): number {
    // Split by whitespace and filter out empty strings
    const words = str.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
}
