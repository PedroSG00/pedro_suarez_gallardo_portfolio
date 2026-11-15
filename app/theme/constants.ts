/**
 * app/theme/constants.ts — Única fuente de valores del sistema de tema.
 *
 * Todos los literales del tema (clave de storage, opciones, nombres de
 * atributos y media query) viven aquí. boot-script, store y CSS los consumen
 * desde este módulo para que no haya literales duplicados ni desajustes.
 */

export type ThemeValue = 'light' | 'dark' | 'system';

export const STORAGE_KEY = 'theme';

export const CHOICES: readonly ThemeValue[] = ['light', 'dark', 'system'];

export const DEFAULT_CHOICE: ThemeValue = 'system';

export const DATA_CHOICE_ATTR = 'data-theme-choice';
export const DATA_THEME_ATTR = 'data-theme';

export const DARK_QUERY = '(prefers-color-scheme: dark)';
