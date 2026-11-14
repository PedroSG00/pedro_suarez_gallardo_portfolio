import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSavedTheme, saveTheme, resolveActiveTheme, listenStorageChanges } from './theme';

// Theme utilities — T-02 (red first)
// RF covered: RF-2 (manual/system theme), RF-4 (persistence and sync between tabs),
// edge case 5 (invalid value → system) and edge case 6 (localStorage blocked)

describe('theme utilities — T-02 (red first)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getSavedTheme', () => {
    it('reads "light" from localStorage when set', () => {
      localStorage.setItem('theme', 'light');
      expect(getSavedTheme()).toBe('light');
    });

    it('returns "system" when localStorage is empty', () => {
      expect(getSavedTheme()).toBe('system');
    });
  });

  describe('saveTheme', () => {
    it('writes value to localStorage', () => {
      saveTheme('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });
  });

  describe('resolveActiveTheme', () => {
    it('returns manual value when stored is light/dark', () => {
      localStorage.setItem('theme', 'light');
      expect(resolveActiveTheme()).toBe('light');
    });

    it('falls back to system when stored value is invalid (edge case 5)', () => {
      localStorage.setItem('theme', 'invalid');
      expect(resolveActiveTheme()).toBe('system');
    });
  });

  describe('storage event listener', () => {
    it('syncs theme between tabs via storage event', () => {
      const callback = vi.fn();
      listenStorageChanges(callback);
      const event = new StorageEvent('storage', { key: 'theme', newValue: 'dark' });
      window.dispatchEvent(event);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('localStorage blocked (edge case 6)', () => {
    it('works in session without errors when localStorage throws', () => {
      vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage blocked');
      });
      expect(() => getSavedTheme()).not.toThrow();
    });

    it('quota full: saveTheme does not throw (RF-6)', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      expect(() => saveTheme('dark')).not.toThrow();
    });
  });
});
