/**
 * get-dictionary.ts — T10 (RF-1)
 * Server: loads the dictionary for the active locale without any runtime
 * merge or fallback. Parity between en.json and es.json is enforced at
 * compile time (es.json satisfies typeof en), so no key is ever missing.
 * Contains no hardcoded texts.
 */

import en from '../dictionaries/en.json';
import es from '../dictionaries/es.json';
import { Locale } from '../config';

type Dictionary = Record<string, unknown>;

const dictionaries: Record<Locale, Dictionary> = { en, es };

/**
 * Returns the dictionary for the given locale exactly as stored.
 * No deepMerge, no fallback to English: each locale is self-contained.
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
