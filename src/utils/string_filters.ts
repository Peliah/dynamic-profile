import { AnalyzedString } from '../models/analyzed_string';

export interface FilterParameters {
    is_palindrome?: boolean;
    min_length?: number;
    max_length?: number;
    word_count?: number;
    contains_character?: string;
}

export interface ValidationError {
    field: string;
    message: string;
}

/**
 * Validates filter parameters and returns validation errors
 */
export function validateFilterParameters(filters: Partial<FilterParameters>): ValidationError[] {
    const errors: ValidationError[] = [];

    if (filters.min_length !== undefined) {
        if (isNaN(filters.min_length) || filters.min_length < 0) {
            errors.push({
                field: 'min_length',
                message: 'min_length must be a non-negative integer'
            });
        }
    }

    if (filters.max_length !== undefined) {
        if (isNaN(filters.max_length) || filters.max_length < 0) {
            errors.push({
                field: 'max_length',
                message: 'max_length must be a non-negative integer'
            });
        }
    }

    if (filters.word_count !== undefined) {
        if (isNaN(filters.word_count) || filters.word_count < 0) {
            errors.push({
                field: 'word_count',
                message: 'word_count must be a non-negative integer'
            });
        }
    }

    if (filters.contains_character !== undefined) {
        if (typeof filters.contains_character !== 'string' || filters.contains_character.length !== 1) {
            errors.push({
                field: 'contains_character',
                message: 'contains_character must be a single character'
            });
        }
    }

    // Check for logical conflicts
    if (filters.min_length !== undefined && filters.max_length !== undefined) {
        if (filters.min_length > filters.max_length) {
            errors.push({
                field: 'length_range',
                message: 'min_length cannot be greater than max_length'
            });
        }
    }

    return errors;
}

/**
 * Applies filters to an array of analyzed strings
 */
export function applyFilters(strings: AnalyzedString[], filters: FilterParameters): AnalyzedString[] {
    return strings.filter(string => {
        // is_palindrome filter
        if (filters.is_palindrome !== undefined) {
            if (string.properties.is_palindrome !== filters.is_palindrome) {
                return false;
            }
        }

        // min_length filter
        if (filters.min_length !== undefined) {
            if (string.properties.length < filters.min_length) {
                return false;
            }
        }

        // max_length filter
        if (filters.max_length !== undefined) {
            if (string.properties.length > filters.max_length) {
                return false;
            }
        }

        // word_count filter
        if (filters.word_count !== undefined) {
            if (string.properties.word_count !== filters.word_count) {
                return false;
            }
        }

        // contains_character filter
        if (filters.contains_character !== undefined) {
            if (!string.value.toLowerCase().includes(filters.contains_character.toLowerCase())) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Builds the filters_applied object (only includes applied filters)
 */
export function buildFiltersApplied(filters: Partial<FilterParameters>): Record<string, any> {
    const filtersApplied: Record<string, any> = {};

    if (filters.is_palindrome !== undefined) {
        filtersApplied.is_palindrome = filters.is_palindrome;
    }
    if (filters.min_length !== undefined) {
        filtersApplied.min_length = filters.min_length;
    }
    if (filters.max_length !== undefined) {
        filtersApplied.max_length = filters.max_length;
    }
    if (filters.word_count !== undefined) {
        filtersApplied.word_count = filters.word_count;
    }
    if (filters.contains_character !== undefined) {
        filtersApplied.contains_character = filters.contains_character;
    }

    return filtersApplied;
}

/**
 * Parses query string parameters into filter parameters
 */
export function parseQueryFilters(query: any): Partial<FilterParameters> {
    const filters: Partial<FilterParameters> = {};

    if (query.is_palindrome !== undefined) {
        if (query.is_palindrome === 'true') {
            filters.is_palindrome = true;
        } else if (query.is_palindrome === 'false') {
            filters.is_palindrome = false;
        }
    }

    if (query.min_length !== undefined) {
        const minLength = parseInt(query.min_length);
        if (!isNaN(minLength)) {
            filters.min_length = minLength;
        }
    }

    if (query.max_length !== undefined) {
        const maxLength = parseInt(query.max_length);
        if (!isNaN(maxLength)) {
            filters.max_length = maxLength;
        }
    }

    if (query.word_count !== undefined) {
        const wordCount = parseInt(query.word_count);
        if (!isNaN(wordCount)) {
            filters.word_count = wordCount;
        }
    }

    if (query.contains_character !== undefined) {
        filters.contains_character = query.contains_character;
    }

    return filters;
}
