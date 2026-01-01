/**
 * DOMAIN LAYER: Immutability Utility
 * 
 * Recursively freezes objects to enforce immutability.
 * Used after domain transitions to prevent accidental mutations.
 */
export function deepFreeze<T>(obj: T): T {
    Object.getOwnPropertyNames(obj).forEach((prop) => {
        const value = (obj as any)[prop];
        if (value && typeof value === 'object') {
            deepFreeze(value);
        }
    });
    return Object.freeze(obj);
}
