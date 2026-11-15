/**
 * app/theme/model.ts — Funciones puras del modelo de tema (sin DOM).
 *
 * - isChoice: valida que un valor sea una opción de tema.
 * - parseChoice: valida o devuelve el default (system).
 * - nextChoice: ciclo light → dark → system → light.
 * - resolve: dada una elección y si el SO es oscuro, devuelve el tema
 *   efectivo aplicado al documento ('light' | 'dark').
 */

import { DEFAULT_CHOICE, type ThemeValue } from './constants';

export function isChoice(value: unknown): value is ThemeValue {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function parseChoice(stored: string | null): ThemeValue {
  return isChoice(stored) ? stored : DEFAULT_CHOICE;
}

export function nextChoice(choice: ThemeValue): ThemeValue {
  const order: readonly ThemeValue[] = ['light', 'dark', 'system'];
  const i = order.indexOf(choice);
  return order[(i + 1) % order.length];
}

export function resolve(
  choice: ThemeValue,
  systemDark: boolean
): 'light' | 'dark' {
  if (choice === 'system') return systemDark ? 'dark' : 'light';
  return choice;
}
