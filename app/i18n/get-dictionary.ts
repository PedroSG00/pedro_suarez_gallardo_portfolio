/**
 * get-dictionary.ts — T14 (RF4, RF5)
 * Server: loads the merged dictionary (en as base, overrides from active locale).
 * Contains no hardcoded texts.
 */

import en from './dictionaries/en.json';
import es from './dictionaries/es.json';
import { Locale } from './config';

type Dictionary = Record<string, unknown>;

const dictionaries: Record<Locale, Dictionary> = { en, es };

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Partial<T>
): T {
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    const baseValue = result[key];
    const overrideValue = override[key];
    const isPlainObject = (v: unknown) =>
      typeof v === 'object' && v !== null && !Array.isArray(v);
    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key] = deepMerge(baseValue as Record<string, unknown>, overrideValue as Record<string, unknown>);
    } else {
      result[key] = overrideValue;
    }
  }
  return result as T;
}

/**
 * Returns the merged dictionary for the given locale.
 * Keys missing in the active locale fall back to English (RF6).
 */
export function getDictionary(locale: Locale): Dictionary {
  if (locale === 'en') return en;
  return deepMerge(en, dictionaries[locale]);
}
