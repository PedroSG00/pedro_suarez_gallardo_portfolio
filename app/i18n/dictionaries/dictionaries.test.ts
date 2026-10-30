import { describe, it, expect } from 'vitest';
import en from './en.json';
import es from './es.json';

describe('i18n dictionaries — T01 theme selector modal', () => {
  it('contains themeSelect labels in EN', () => {
    expect(en.themeSelect.label).toBeDefined();
    expect(en.themeSelect.option.light).toBeDefined();
    expect(en.themeSelect.option.dark).toBeDefined();
    expect(en.themeSelect.option.system).toBeDefined();
  });

  it('contains themeSelect labels in ES', () => {
    expect(es.themeSelect.label).toBeDefined();
    expect(es.themeSelect.option.light).toBeDefined();
    expect(es.themeSelect.option.dark).toBeDefined();
    expect(es.themeSelect.option.system).toBeDefined();
  });

  it('contains modalInfoJSDisabled in EN', () => {
    expect(en.modalInfoJSDisabled.title).toBeDefined();
    expect(en.modalInfoJSDisabled.body).toBeDefined();
  });

  it('contains modalInfoJSDisabled in ES', () => {
    expect(es.modalInfoJSDisabled.title).toBeDefined();
    expect(es.modalInfoJSDisabled.body).toBeDefined();
  });

  it('has matching keys across EN and ES', () => {
    expect(Object.keys(en.themeSelect)).toEqual(Object.keys(es.themeSelect));
  });
});
