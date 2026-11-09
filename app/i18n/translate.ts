/**
 * translate.ts — mergeWithFallback y createT (plan §3.4)
 * Funciones puras: mergeWithFallback fusiona diccionarios con fallback a inglés;
 * createT devuelve t(key) resolviendo notación de puntos.
 * Último recurso: devuelve la clave misma (nunca un hueco vacío).
 */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Fusiona dos diccionarios de forma profunda. Las claves que existan en
 * `dictLocale` prevalecen sobre `dictEn`; las que falten en `dictLocale`
 * quedan en inglés (fallback, RF6).
 */
export function mergeWithFallback(
  dictEn: Record<string, unknown>,
  dictLocale: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...dictEn };
  for (const key of Object.keys(dictLocale)) {
    const baseValue = result[key];
    const overrideValue = dictLocale[key];
    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key] = mergeWithFallback(baseValue, overrideValue);
    } else {
      result[key] = overrideValue;
    }
  }
  return result;
}

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
        return key;
      }
      current = (current as Record<string, unknown>)[part];
    }
    if (typeof current === 'string') return current;
    return key;
  };
}
