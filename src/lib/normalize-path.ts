export function normalizePath(pathname: string): string {
  let normalized = pathname.toLowerCase();
  if (normalized !== '/' && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}
