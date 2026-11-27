import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import enMessages from '../../messages/en.json';
import esMessages from '../../messages/es.json';
import {
  FEATURED_STACK_TECHNOLOGY_IDS,
  STACK_CATEGORIES,
  STACK_TECHNOLOGIES,
} from './stack';

const EXPECTED_CATEGORY_ORDER = [
  'frontend',
  'data-visualization',
  'backend-apis',
  'databases',
  'testing-ci',
  'ai-tools',
] as const;

const EXPECTED_TECHNOLOGY_IDS = [
  'javascript',
  'typescript',
  'react',
  'nextJs',
  'html',
  'css',
  'chartJs',
  'recharts',
  'nodeJs',
  'expressJs',
  'restApis',
  'webSockets',
  'cSharp',
  'python',
  'mysql',
  'mongodb',
  'jest',
  'vitest',
  'playwright',
  'githubActions',
  'githubCopilot',
  'claudeCode',
  'opencode',
  'git',
  'github',
] as const;

const EXPECTED_CATEGORY_BY_TECHNOLOGY = [
  'frontend',
  'frontend',
  'frontend',
  'frontend',
  'frontend',
  'frontend',
  'data-visualization',
  'data-visualization',
  'backend-apis',
  'backend-apis',
  'backend-apis',
  'backend-apis',
  'backend-apis',
  'backend-apis',
  'databases',
  'databases',
  'testing-ci',
  'testing-ci',
  'testing-ci',
  'testing-ci',
  'ai-tools',
  'ai-tools',
  'ai-tools',
  'ai-tools',
  'ai-tools',
] as const;

const FORBIDDEN_DESCRIPTION_PATTERNS: ReadonlyArray<{
  label: string;
  pattern: RegExp;
}> = [
  { label: 'metrics', pattern: /\d|%/ },
  {
    label: 'levels',
    pattern:
      /\b(levels?|niveles?|advanced|avanzad[oa]s?|expert|experto?s?|senior|junior|proficient|mastery|dominio|beginner|b[áa]sico|intermediate)\b/i,
  },
  {
    label: 'experience or time',
    pattern: /\b(years?|a[ñn]os?|experience|experiencia|daily|a diario)\b/i,
  },
  {
    label: 'results or clients',
    pattern: /\b(results?|resultados?|customers?|clientes|employers?|empleadores?)\b/i,
  },
  {
    label: 'personal projects',
    pattern:
      /\b(my|our|mis|nuestros?|nuestras?)\s+(projects?|proyectos?|work|trabajo)\b/i,
  },
  {
    label: 'first person',
    pattern: /\b(I|we|yo|nosotros)\b/,
  },
];

const TECHNOLOGIES_BY_LOCALE = {
  en: enMessages.stack.technologies,
  es: esMessages.stack.technologies,
} as const;

describe('STACK_TECHNOLOGIES', () => {
  test('registers exactly the 25 approved technologies', () => {
    expect(STACK_TECHNOLOGIES).toHaveLength(25);
  });

  test('keeps the six approved categories in editorial order', () => {
    expect(STACK_CATEGORIES).toEqual(EXPECTED_CATEGORY_ORDER);
  });

  test('keeps the editorial order of the brief', () => {
    expect(STACK_TECHNOLOGIES.map((technology) => technology.id)).toEqual(
      EXPECTED_TECHNOLOGY_IDS
    );
    expect(STACK_TECHNOLOGIES.map((technology) => technology.order)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 1)
    );
  });

  test('groups every technology under its approved category', () => {
    expect(
      STACK_TECHNOLOGIES.map((technology) => technology.category)
    ).toEqual(EXPECTED_CATEGORY_BY_TECHNOLOGY);
  });

  test('uses unique ids', () => {
    const ids = STACK_TECHNOLOGIES.map((technology) => technology.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  test('only uses allowed categories', () => {
    for (const technology of STACK_TECHNOLOGIES) {
      expect(STACK_CATEGORIES).toContain(technology.category);
    }
  });

  test('assigns a unique local brand mark to every technology', () => {
    const brandMarks = STACK_TECHNOLOGIES.map(
      (technology) => technology.brandMark
    );

    expect(new Set(brandMarks).size).toBe(STACK_TECHNOLOGIES.length);

    for (const technology of STACK_TECHNOLOGIES) {
      expect(technology.brandMark).toMatch(/^\/stack\/[a-zA-Z0-9-]+\.svg$/);
    }
  });

  test('ships valid local SVG artwork for every brand mark', () => {
    for (const technology of STACK_TECHNOLOGIES) {
      const filePath = resolve(
        process.cwd(),
        'public',
        technology.brandMark.slice(1)
      );
      const svg = readFileSync(filePath, 'utf8');

      expect(svg).toMatch(/^<svg[\s\S]*<\/svg>\s*$/);
      expect(svg).toMatch(/viewBox="[^"]+"/);
      expect(svg).toMatch(/<path\b[^>]*d="[^"]+"/);
      expect(svg).not.toMatch(/<(script|image)\b|\bhref=/i);
    }
  });

  test('documents every mark source, license or original-artwork status', () => {
    const attribution = readFileSync(
      resolve(process.cwd(), 'public/stack/ATTRIBUTION.md'),
      'utf8'
    );

    for (const technology of STACK_TECHNOLOGIES) {
      const entry = attribution
        .split('\n')
        .find((line) => line.startsWith(`| ${technology.id} |`));

      expect(entry).toContain(`\`${technology.brandMark}\``);
      expect(entry).toMatch(/https?:\/\/|Original artwork/);
    }

    expect(attribution).toMatch(/trademark/i);
    expect(attribution).toMatch(/not\s+imply\s+endorsement/i);
  });
});

describe('featured technologies', () => {
  test('gives visual priority to React and TypeScript inside Frontend', () => {
    expect([...FEATURED_STACK_TECHNOLOGY_IDS]).toEqual([
      'react',
      'typescript',
    ]);

    for (const id of FEATURED_STACK_TECHNOLOGY_IDS) {
      const technology = STACK_TECHNOLOGIES.find((entry) => entry.id === id);

      expect(technology?.category).toBe('frontend');
    }
  });

  test('does not move React or TypeScript out of the editorial reading order', () => {
    expect(STACK_TECHNOLOGIES[1].id).toBe('typescript');
    expect(STACK_TECHNOLOGIES[2].id).toBe('react');
  });
});

describe('stack descriptions', () => {
  test('provides a name and a description for every technology in both locales', () => {
    for (const technology of STACK_TECHNOLOGIES) {
      for (const locale of ['en', 'es'] as const) {
        const entry = TECHNOLOGIES_BY_LOCALE[locale][technology.id];

        expect(entry.name.trim()).not.toBe('');
        expect(entry.description.trim()).not.toBe('');
      }

      expect(TECHNOLOGIES_BY_LOCALE.en[technology.id].name).toBe(
        TECHNOLOGIES_BY_LOCALE.es[technology.id].name
      );
    }
  });

  test('gives every technology two concise description sentences in both locales', () => {
    for (const technology of STACK_TECHNOLOGIES) {
      for (const locale of ['en', 'es'] as const) {
        const { description } = TECHNOLOGIES_BY_LOCALE[locale][technology.id];
        const sentenceEndings = description.match(/[.!?](?=\s|$)/g) ?? [];

        expect(sentenceEndings, `${technology.id} (${locale})`).toHaveLength(2);
      }
    }
  });

  test('keeps the same technology keys in both message catalogs', () => {
    const expectedKeys = STACK_TECHNOLOGIES.map(
      (technology) => technology.id
    ).sort();

    expect(Object.keys(TECHNOLOGIES_BY_LOCALE.en).sort()).toEqual(expectedKeys);
    expect(Object.keys(TECHNOLOGIES_BY_LOCALE.es).sort()).toEqual(expectedKeys);
  });

  test('uses a compact, static Recharts mark suitable for the card face', () => {
    const svg = readFileSync(
      resolve(process.cwd(), 'public/stack/recharts.svg'),
      'utf8',
    );

    expect(svg).toContain('viewBox="0 0 64 64"');
    expect(svg).not.toMatch(/\b(class|role|tabindex)=|:r\d+/i);
  });

  test.each(['en', 'es'] as const)(
    'describes what each technology is without levels, metrics, projects, clients or results in %s',
    (locale) => {
      for (const technology of STACK_TECHNOLOGIES) {
        const { description } = TECHNOLOGIES_BY_LOCALE[locale][technology.id];

        for (const { label, pattern } of FORBIDDEN_DESCRIPTION_PATTERNS) {
          expect(description, `${technology.id} (${locale}) mentions ${label}`).not.toMatch(
            pattern
          );
        }
      }
    }
  );
});
