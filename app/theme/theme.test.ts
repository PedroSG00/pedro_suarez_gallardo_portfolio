import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { getSavedTheme, saveTheme, resolveActiveTheme, listenStorageChanges } from './theme';

// T12: theme.ts — get/save/resolve theme, storage event sync, blocked storage
// Done when: inválido → 'system'; blocked storage → silent; storage event con valor vacío → 'system'.
describe('theme.ts', () => {
  beforeEach(() => {
    // Reset localStorage mock
    let store: Record<string, string> = {};
    const mockStorage = {
      getItem: (key: string): string | null => (key in store ? store[key] : null),
      setItem: (key: string, value: string): void => {
        store[key] = value;
      },
      removeItem: (key: string): void => {
        delete store[key];
      },
      clear: (): void => {
        store = {};
      },
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getSavedTheme returns system for invalid stored value', () => {
    localStorage.setItem('theme', 'invalid-value');
    expect(getSavedTheme()).toBe('system');
  });

  it('getSavedTheme returns system when localStorage is blocked (throws)', () => {
    const originalGetItem = localStorage.getItem.bind(localStorage);
    const blockingGetItem = (): never => {
      throw new Error('blocked');
    };
    Object.defineProperty(localStorage, 'getItem', {
      value: blockingGetItem,
      configurable: true,
      writable: true,
    });
    expect(getSavedTheme()).toBe('system');
    Object.defineProperty(localStorage, 'getItem', {
      value: originalGetItem,
      configurable: true,
      writable: true,
    });
  });

  it('saveTheme silently ignores when localStorage is blocked', () => {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    const blockingSetItem = (): never => {
      throw new Error('blocked');
    };
    Object.defineProperty(localStorage, 'setItem', {
      value: blockingSetItem,
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

  it('resolveActiveTheme falls back to system for invalid saved value', () => {
    localStorage.setItem('theme', 'not-a-theme');
    expect(resolveActiveTheme()).toBe('system');
  });

  it('listenStorageChanges calls callback with system when newValue is null/empty', () => {
    const callback = vi.fn();
    const unlisten = listenStorageChanges(callback);

    // Dispatch storage event with empty newValue
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'theme', newValue: null })
    );
    expect(callback).toHaveBeenCalledWith('system');

    unlisten();
  });

  it('listenStorageChanges calls callback with valid newValue', () => {
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
