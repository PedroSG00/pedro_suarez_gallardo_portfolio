import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  applyTheme,
  getThemeFromDocument,
  saveTheme,
  listenStorageChanges,
} from './theme';

// T12: theme.ts — document class model, persistence and cross-tab sync.
// The inline boot script is the only storage reader; these helpers never read
// localStorage on boot.
describe('theme.ts', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getThemeFromDocument defaults to system when no class is set', () => {
    expect(getThemeFromDocument()).toBe('system');
  });

  it('getThemeFromDocument reads the class applied by the boot script', () => {
    document.documentElement.classList.add('theme-dark');
    expect(getThemeFromDocument()).toBe('dark');
  });

  it('applyTheme swaps the theme class without leaving duplicates', () => {
    document.documentElement.classList.add('theme-light');
    applyTheme('dark');
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
    expect(document.documentElement.classList.contains('theme-light')).toBe(
      false
    );
    expect(document.documentElement.classList.contains('theme-system')).toBe(
      false
    );
  });

  it('applyTheme never writes to storage', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    applyTheme('dark');
    expect(setItem).not.toHaveBeenCalled();
  });

  it('saveTheme persists the value', () => {
    saveTheme('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('saveTheme silently ignores when localStorage is blocked', () => {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    Object.defineProperty(localStorage, 'setItem', {
      value: () => {
        throw new Error('blocked');
      },
      configurable: true,
      writable: true,
    });
    expect(() => saveTheme('dark')).not.toThrow();
    Object.defineProperty(localStorage, 'setItem', {
      value: originalSetItem,
      configurable: true,
      writable: true,
    });
  });

  it('listenStorageChanges maps newValue null (deletion) to system', () => {
    const callback = vi.fn();
    const unlisten = listenStorageChanges(callback);

    window.dispatchEvent(
      new StorageEvent('storage', { key: 'theme', newValue: null })
    );
    expect(callback).toHaveBeenCalledWith('system');

    unlisten();
  });

  it('listenStorageChanges maps invalid values to system', () => {
    const callback = vi.fn();
    const unlisten = listenStorageChanges(callback);

    window.dispatchEvent(
      new StorageEvent('storage', { key: 'theme', newValue: 'purple' })
    );
    expect(callback).toHaveBeenCalledWith('system');

    unlisten();
  });

  it('listenStorageChanges forwards valid values', () => {
    const callback = vi.fn();
    const unlisten = listenStorageChanges(callback);

    window.dispatchEvent(
      new StorageEvent('storage', { key: 'theme', newValue: 'dark' })
    );
    expect(callback).toHaveBeenCalledWith('dark');

    unlisten();
  });

  it('listenStorageChanges ignores storage events for other keys', () => {
    const callback = vi.fn();
    const unlisten = listenStorageChanges(callback);

    window.dispatchEvent(
      new StorageEvent('storage', { key: 'other', newValue: 'dark' })
    );
    expect(callback).not.toHaveBeenCalled();

    unlisten();
  });
});
