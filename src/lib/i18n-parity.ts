export function flattenKeys(
  obj: Record<string, unknown>,
  prefix = ''
): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      return flattenKeys(value as Record<string, unknown>, fullKey);
    }
    return [fullKey];
  });
}

export function validateParity(
  enMessages: Record<string, unknown>,
  esMessages: Record<string, unknown>
): { valid: boolean; missing: string[]; extra: string[] } {
  const enKeys = flattenKeys(enMessages);
  const esKeys = flattenKeys(esMessages);
  const missingInEs = enKeys.filter((k) => !esKeys.includes(k));
  const extraInEs = esKeys.filter((k) => !enKeys.includes(k));

  return {
    valid: missingInEs.length === 0 && extraInEs.length === 0,
    missing: missingInEs,
    extra: extraInEs,
  };
}
