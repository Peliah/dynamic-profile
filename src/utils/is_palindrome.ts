/**
 * Checks if a string is a palindrome (case-insensitive)
 * @param str - The input string
 * @returns Boolean indicating if the string reads the same forwards and backwards
 */
export function isPalindrome(str: string): boolean {
    // Remove all non-alphanumeric characters and convert to lowercase
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check if the cleaned string is equal to its reverse
    return cleaned === cleaned.split('').reverse().join('');
}
