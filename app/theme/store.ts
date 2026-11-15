/**
 * app/theme/store.ts — Store externo, único escritor del DOM del tema.
 *
 * Expone la API que consume useSyncExternalStore:
 * - getChoice(): elección actual (lee data-theme-choice del DOM).
 * - getServerChoice(): valor para SSR sin DOM ('system').
 * - setChoice(choice): guarda, aplica data-theme al DOM y emite a suscriptores.
 * 
 * Suscribe también a:
 * - evento storage (otra pestaña cambió el tema; null/inválido → system).
 * - matchMedia change (cuando la elección es system, se recalcula data-theme).
 * Nunca escribe className/classList: solo atributos data-*.
 */

import {
  DATA_CHOICE_ATTR,
  DATA_THEME_ATTR,
  DEFAULT_CHOICE,
  DARK_QUERY,
  STORAGE_KEY,
  type ThemeValue,
} from './constants';
import { isChoice, parseChoice, resolve } from './model';

let choice: ThemeValue = DEFAULT_CHOICE;
const listeners = new Set<(value: ThemeValue) => void>();

function readChoiceFromDom(): ThemeValue {
  if (typeof document === 'undefined') return DEFAULT_CHOICE;
  const stored = document.documentElement.getAttribute(DATA_CHOICE_ATTR);
  return isChoice(stored) ? stored : DEFAULT_CHOICE;
}

function readSystemDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(DARK_QUERY).matches;
}

function applyToDom(effective: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute(DATA_THEME_ATTR, effective);
}

function emit(value: ThemeValue): void {
  for (const cb of listeners) cb(value);
}

/** Selección actual: se resincroniza con el DOM en cada lectura. */
export function getChoice(): ThemeValue {
  if (typeof document !== 'undefined') {
    choice = readChoiceFromDom();
  }
  return choice;
}

/** Valor de servidor (sin DOM): siempre system. */
export function getServerChoice(): ThemeValue {
  return DEFAULT_CHOICE;
}

/** Guarda la elección, aplica el tema efectivo al DOM y notifica a suscriptores. */
export function setChoice(next: ThemeValue): void {
  choice = next;
  // Memoriza la elección en el atributo de elección (no solo el efectivo).
  document.documentElement.setAttribute(DATA_CHOICE_ATTR, next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage bloqueado o lleno: la elección no se persiste pero no falla.
  }
  const effective = resolve(next, readSystemDark());
  applyToDom(effective);
  emit(next);
}

export function subscribe(callback: (value: ThemeValue) => void): () => void {
  listeners.add(callback);

  const media = window.matchMedia(DARK_QUERY);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    setChoice(parseChoice(event.newValue));
  };

  const onMediaChange = () => {
    const current = getChoice();
    if (current === 'system') {
      applyToDom(resolve(current, media.matches));
    }
  };

  if (typeof document !== 'undefined') {
    window.addEventListener('storage', onStorage);
    media.addEventListener('change', onMediaChange);
  }

  return () => {
    listeners.delete(callback);
    if (typeof document !== 'undefined') {
      window.removeEventListener('storage', onStorage);
      media.removeEventListener('change', onMediaChange);
    }
  };
}
