/**
 * translate.ts — T11 (RF-1)
 * createT resolves dotted keys and throws an explicit error when a key is
 * missing or its value is not a string. A missing key is a build-time parity
 * failure, never a runtime UI hole. No mergeWithFallback: dictionaries are
 * already complete at compile time.
 */

export function createT(dictionary: Record<string, unknown>) {
  return function t(key: string): string {
    const parts = key.split('.');
    let current: unknown = dictionary;
    for (const part of parts) {
      if (
        typeof current !== 'object' ||
        current === null ||
        !Object.prototype.hasOwnProperty.call(current, part)
      ) {
        throw new Error(`Missing translation key: ${key}`);
      }
      current = (current as Record<string, unknown>)[part];
    }
    if (typeof current !== 'string') {
      throw new Error(`Translation key "${key}" does not resolve to a string`);
    }
    return current;
  };
}
