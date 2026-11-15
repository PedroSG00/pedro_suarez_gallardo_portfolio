import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getChoice, getServerChoice, setChoice, subscribe } from './store';

// store.ts — único escritor del DOM del tema (suscriptores, storage, matchMedia).
// jsdom no define window.matchMedia, así que lo mockeamos en cada test.
describe('theme store — setChoice, storage events, matchMedia', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme-choice');
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  type MatchMediaCtrl = {
    dispatchChange: () => void;
    setMatches: (v: boolean) => void;
  };

  function mockMatchMedia(initialMatches: boolean): MatchMediaCtrl {
    const listeners: Array<() => void> = [];
    let matches = initialMatches;
    const mq = {
      get matches() {
        return matches;
      },
      set matches(v: boolean) {
        matches = v;
      },
      addEventListener: (type: string, listener: () => void) => {
        if (type === 'change') listeners.push(listener);
      },
      removeEventListener: (type: string, listener: () => void) => {
        if (type === 'change') {
          const i = listeners.indexOf(listener);
          if (i >= 0) listeners.splice(i, 1);
        }
      },
    } as unknown as MediaQueryList;
    const w = window as unknown as {
      matchMedia: ((q: string) => MediaQueryList) | undefined;
    };
    w.matchMedia = vi.fn(() => mq);
    return {
      dispatchChange: () => {
        for (const l of listeners) l();
      },
      setMatches: (v: boolean) => {
        matches = v;
      },
    };
  }

  it('getServerChoice returns system for SSR (no DOM)', () => {
    expect(getServerChoice()).toBe('system');
  });

  it('getChoice reads data-theme-choice from the DOM', () => {
    document.documentElement.setAttribute('data-theme-choice', 'dark');
    expect(getChoice()).toBe('dark');
  });

  it('getChoice defaults to system when no attribute is set', () => {
    expect(getChoice()).toBe('system');
  });

  it('setChoice persists, applies data-theme and emits to subscribers', () => {
    mockMatchMedia(false);
    const cb = vi.fn();
    const unsubscribe = subscribe(cb);

    setChoice('dark');

    expect(localStorage.getItem('theme')).toBe('dark');
    expect(
      document.documentElement.getAttribute('data-theme-choice')
    ).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(cb).toHaveBeenCalledWith('dark');

    unsubscribe();
  });

  it('setChoice with light applies data-theme=light even with dark OS', () => {
    mockMatchMedia(true); // dark OS
    setChoice('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('setChoice with system + dark OS applies data-theme=dark', () => {
    mockMatchMedia(true);
    setChoice('system');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('setChoice never throws when storage is blocked', () => {
    mockMatchMedia(false);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    let threw = false;
    try {
      setChoice('dark');
    } catch {
      threw = true;
    }
    expect(threw).toBe(false);
    expect(
      document.documentElement.getAttribute('data-theme-choice')
    ).toBe('dark');
  });

  it('storage event from another tab propagates the new choice', () => {
    mockMatchMedia(false);
    const cb = vi.fn();
    subscribe(cb);

    setChoice('dark');
    cb.mockClear();

    window.dispatchEvent(
      new StorageEvent('storage', { key: 'theme', newValue: 'light' })
    );
    expect(cb).toHaveBeenCalledWith('light');
    expect(
      document.documentElement.getAttribute('data-theme-choice')
    ).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('storage event with null or invalid value maps to system', () => {
    mockMatchMedia(false);
    const cb = vi.fn();
    subscribe(cb);

    window.dispatchEvent(
      new StorageEvent('storage', { key: 'theme', newValue: null })
    );
    expect(cb).toHaveBeenCalledWith('system');
    expect(
      document.documentElement.getAttribute('data-theme-choice')
    ).toBe('system');

    cb.mockClear();
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'theme', newValue: 'purple' })
    );
    expect(cb).toHaveBeenCalledWith('system');
  });

  it('storage events for other keys are ignored', () => {
    mockMatchMedia(false);
    const cb = vi.fn();
    subscribe(cb);
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'other', newValue: 'light' })
    );
    expect(cb).not.toHaveBeenCalled();
  });

  it('matchMedia change recalculates data-theme when choice is system', () => {
    const ctrl = mockMatchMedia(false); // OS light
    // Suscribirse registra el listener de matchMedia change en el store.
    subscribe(vi.fn());
    setChoice('system');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    ctrl.setMatches(true); // switch OS to dark
    ctrl.dispatchChange();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
