import { describe, it, expect } from 'vitest';
import { isChoice, parseChoice, nextChoice, resolve } from './model';

// model.ts — funciones puras del tema (sin DOM).
describe('theme model — pure functions', () => {
  describe('isChoice', () => {
    it('accepts light, dark and system', () => {
      expect(isChoice('light')).toBe(true);
      expect(isChoice('dark')).toBe(true);
      expect(isChoice('system')).toBe(true);
    });

    it('rejects anything else', () => {
      expect(isChoice(null)).toBe(false);
      expect(isChoice(undefined)).toBe(false);
      expect(isChoice('purple')).toBe(false);
      expect(isChoice('')).toBe(false);
      expect(isChoice(42)).toBe(false);
    });
  });

  describe('parseChoice', () => {
    it('returns the stored value when it is valid', () => {
      expect(parseChoice('light')).toBe('light');
      expect(parseChoice('dark')).toBe('dark');
      expect(parseChoice('system')).toBe('system');
    });

    it('defaults to system when absent or invalid', () => {
      expect(parseChoice(null)).toBe('system');
      expect(parseChoice(undefined as unknown as string | null)).toBe(
        'system'
      );
      expect(parseChoice('purple')).toBe('system');
    });
  });

  describe('nextChoice', () => {
    it('cycles light → dark → system → light', () => {
      expect(nextChoice('light')).toBe('dark');
      expect(nextChoice('dark')).toBe('system');
      expect(nextChoice('system')).toBe('light');
    });
  });

  describe('resolve', () => {
    it('returns the choice itself for light and dark', () => {
      expect(resolve('light', false)).toBe('light');
      expect(resolve('light', true)).toBe('light');
      expect(resolve('dark', false)).toBe('dark');
      expect(resolve('dark', true)).toBe('dark');
    });

    it('resolves system to dark when the OS is dark', () => {
      expect(resolve('system', true)).toBe('dark');
    });

    it('resolves system to light when the OS is light', () => {
      expect(resolve('system', false)).toBe('light');
    });
  });
});
