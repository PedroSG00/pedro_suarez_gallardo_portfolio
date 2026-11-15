/**
 * app/theme/boot-script.ts — Script de arranque del tema inline en <head>.
 *
 * Corre antes del primer pintado (beforeInteractive). Lee la elección
 * guardada, la valida, usa matchMedia para resolver el tema efectivo cuando
 * la elección es "system", y escribe en <html> los atributos
 * data-theme-choice (elección) y data-theme (efectivo: light|dark).
 * Nunca lanza: storage bloqueado o DOM ausente se ignoran silenciosamente.
 *
 * Los literales (clave de storage, nombres de atributo, media query) se
 * embuten con JSON.stringify desde constants.ts: no hay literales duplicados.
 */

import {
  DATA_CHOICE_ATTR,
  DATA_THEME_ATTR,
  DEFAULT_CHOICE,
  DARK_QUERY,
  STORAGE_KEY,
} from './constants';

/**
 * Construye el script inline. Las constantes de configuración se incrustan
 * como literales mediante JSON.stringify; la lógica (matchMedia, dataset)
 * corre en el navegador al ejecutar el script.
 */
export function buildBootScript(): string {
  return `(function(){
    const storageKey = ${JSON.stringify(STORAGE_KEY)};
    const darkQuery = ${JSON.stringify(DARK_QUERY)};
    const dataChoiceAttr = ${JSON.stringify(DATA_CHOICE_ATTR)};
    const dataThemeAttr = ${JSON.stringify(DATA_THEME_ATTR)};
    let choice = ${JSON.stringify(DEFAULT_CHOICE)};
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        choice = stored;
      }
    } catch {}
    try {
      const html = document.documentElement;
      html.setAttribute(dataChoiceAttr, choice);
      let systemDark = false;
      try {
        systemDark = window.matchMedia(darkQuery).matches;
      } catch {
        // matchMedia puede no estar disponible durante beforeInteractive;
        // asumimos claro en ese caso, se corregirá tras la hidratación.
      }
      const effective =
        choice === 'system' ? (systemDark ? 'dark' : 'light') : choice;
      html.setAttribute(dataThemeAttr, effective);
    } catch {}
  })();`;
}

/** Script inline listo para insertar en <Script dangerouslySetInnerHTML>. */
export const THEME_BOOT_SCRIPT = buildBootScript();
