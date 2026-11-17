import { describe, expect, test } from 'vitest';
import { resolveLocaleForRoot } from './resolve-locale';

describe('resolveLocaleForRoot', () => {
  const request = (acceptLanguage?: string) => ({
    headers: acceptLanguage ? { 'accept-language': acceptLanguage } : {},
  });

  test('devuelve el idioma de la cookie válida con prioridad sobre el navegador', () => {
    const cookieStore = { cookies: { psg_locale: 'es' } };
    const result = resolveLocaleForRoot(request('en'), cookieStore);
    expect(result).toBe('es');
  });

  test('devuelve el idioma de la cookie "en" con prioridad sobre el navegador', () => {
    const cookieStore = { cookies: { psg_locale: 'en' } };
    const result = resolveLocaleForRoot(request('es'), cookieStore);
    expect(result).toBe('en');
  });

  test('sin cookie devuelve el primer idioma compatible de Accept-Language en orden', () => {
    const result = resolveLocaleForRoot(request('es,en;q=0.9'));
    expect(result).toBe('es');
  });

  test('sin cookie devuelve "en" cuando es el primero en Accept-Language', () => {
    const result = resolveLocaleForRoot(request('en,es;q=0.9'));
    expect(result).toBe('en');
  });

  test('normaliza subtag regional es-ES a es', () => {
    const result = resolveLocaleForRoot(request('es-ES'));
    expect(result).toBe('es');
  });

  test('normaliza subtag regional en-US a en', () => {
    const result = resolveLocaleForRoot(request('en-US'));
    expect(result).toBe('en');
  });

  test('devuelve "en" cuando el navegador no indica un idioma compatible', () => {
    const result = resolveLocaleForRoot(request('fr,de;q=0.8'));
    expect(result).toBe('en');
  });

  test('devuelve "en" cuando no hay Accept-Language ni cookie', () => {
    const result = resolveLocaleForRoot(request());
    expect(result).toBe('en');
  });

  test('ignora cookie inválida y usa el navegador', () => {
    const cookieStore = { cookies: { psg_locale: 'fr' } };
    const result = resolveLocaleForRoot(request('es'), cookieStore);
    expect(result).toBe('es');
  });

  test('ignora cookie vacía y usa el navegador', () => {
    const cookieStore = { cookies: { psg_locale: '' } };
    const result = resolveLocaleForRoot(request('es'), cookieStore);
    expect(result).toBe('es');
  });

  test('sin cookieStore usa el navegador y fallback a inglés', () => {
    const result = resolveLocaleForRoot(request('fr'));
    expect(result).toBe('en');
  });
});
