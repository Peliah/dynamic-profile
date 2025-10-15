
export const generateUserName = (): string => {
    const usernamePrefix = 'user-';
    const randomSuffix = Math.random().toString(36).slice(2);
    const username = `${usernamePrefix}${randomSuffix}`;
    return username;
}

export { fetchCatFact, getCatFactWithFallback } from './catFacts';
export type { CatFactResponse, CatFactError } from './catFacts';