import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveActiveTheme, getSavedTheme } from './theme';

describe('RF-6 — Sin JavaScript / localStorage bloqueado', () => {
  beforeEach(() => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => null);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('falls back to system when localStorage unavailable', () => {
    expect(resolveActiveTheme()).toBe('system');
  });

  it('does not throw without storage', () => {
    expect(() => getSavedTheme()).not.toThrow();
  });
});
