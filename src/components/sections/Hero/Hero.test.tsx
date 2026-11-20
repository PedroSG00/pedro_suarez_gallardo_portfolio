import { describe, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import enMessages from '../../../../messages/en.json';
import esMessages from '../../../../messages/es.json';
import { renderWithIntl } from '@/test/render-with-intl';
import Hero from './Hero';

type HeroContent = {
  name: string;
  role: string;
  pitch: string;
  support: string;
  meta: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

function mountHero(
  content: Partial<HeroContent> = {},
  {
    primaryHref,
    secondaryHref,
    locale = 'en',
  }: { primaryHref?: string; secondaryHref?: string; locale?: 'en' | 'es' } = {},
): void {
  renderWithIntl(
    <Hero
      content={content}
      primaryHref={primaryHref ?? '#work'}
      secondaryHref={secondaryHref ?? '#contact'}
    />,
    { locale },
  );
}

function revealContaining(text: string): HTMLElement {
  return screen.getByText((_content, element) => {
    if (!element) {
      return false;
    }
    return element.matches('[data-reveal-root]') && element.textContent?.includes(text);
  });
}

function isInsideReveal(text: string): HTMLElement | null {
  return screen.queryByText(new RegExp(text), { selector: '[data-reveal-root]' });
}

describe('Hero content and reveal', () => {
  test('renders a single h1 whose accessible name is the full name', () => {
    mountHero();
    expect(screen.getByRole('heading', { level: 1, name: 'Pedro Suárez Gallardo' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  test('announces the section by the hero-name id', () => {
    mountHero();
    const section = screen.getByRole('region', { name: 'Pedro Suárez Gallardo' });
    expect(section).toHaveAttribute('aria-labelledby', 'hero-name');
    expect(screen.getByRole('heading', { level: 1, name: 'Pedro Suárez Gallardo' })).toHaveAttribute(
      'id',
      'hero-name',
    );
  });

  test('renders three lines each hidden from assistive technology', () => {
    mountHero();
    const lines = screen.getAllByText(/^Pedro$|^Suárez$|^Gallardo$/);
    expect(lines).toHaveLength(3);
    for (const line of lines) {
      expect(line).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('renders a decorative cursor hidden from assistive technology', () => {
    mountHero();
    const cursor = screen.getByText('█', { selector: '[aria-hidden="true"]' });
    expect(cursor).toHaveAttribute('aria-hidden', 'true');
  });

  test('renders role, pitch, support and meta as visible plain text', () => {
    mountHero();
    expect(screen.getByText(enMessages.hero.role)).toBeVisible();
    expect(screen.getByText(enMessages.hero.pitch)).toBeVisible();
    expect(screen.getByText(enMessages.hero.support)).toBeVisible();
    expect(screen.getByText(enMessages.hero.meta)).toBeVisible();
  });

  test('renders CTAs to #work and #contact', () => {
    mountHero();
    expect(screen.getByRole('link', { name: enMessages.hero.ctaPrimary })).toHaveAttribute(
      'href',
      '#work',
    );
    expect(screen.getByRole('link', { name: enMessages.hero.ctaSecondary })).toHaveAttribute(
      'href',
      '#contact',
    );
  });

  test('wraps the name outside of any reveal block', () => {
    mountHero();
    expect(isInsideReveal('Pedro Suárez Gallardo')).toBeNull();
  });

  test('wraps role, pitch, support, meta and CTAs in reveal blocks', () => {
    mountHero();
    const texts = [
      enMessages.hero.role,
      enMessages.hero.pitch,
      enMessages.hero.support,
      enMessages.hero.meta,
      enMessages.hero.ctaPrimary,
      enMessages.hero.ctaSecondary,
    ];
    for (const text of texts) {
      const reveal = revealContaining(text);
      expect(reveal).toHaveAttribute('data-reveal-variant', 'rise');
    }
  });

  test('renders all hero text in Spanish for the Spanish locale', () => {
    mountHero({}, { locale: 'es' });
    expect(screen.getByText(esMessages.hero.meta)).toBeVisible();
    expect(screen.getByText(esMessages.hero.role)).toBeVisible();
    expect(screen.getByRole('link', { name: esMessages.hero.ctaPrimary })).toBeVisible();
  });

  test('keeps rendering the rest when the name is missing, without h1 or aria-labelledby', () => {
    mountHero({ name: '' });
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Pedro Suárez Gallardo' })).not.toBeInTheDocument();
    expect(screen.getByText(enMessages.hero.role)).toBeVisible();
    expect(screen.getByText(enMessages.hero.pitch)).toBeVisible();
    expect(screen.getByText(enMessages.hero.support)).toBeVisible();
    expect(screen.getByText(enMessages.hero.meta)).toBeVisible();
  });

  test('omits a CTA link when it is missing', () => {
    mountHero({ ctaSecondary: '' });
    expect(screen.getByRole('link', { name: enMessages.hero.ctaPrimary })).toHaveAttribute(
      'href',
      '#work',
    );
    expect(screen.queryByRole('link', { name: enMessages.hero.ctaSecondary })).not.toBeInTheDocument();
  });

  test('never throws when all optional content is missing', () => {
    expect(() => {
      mountHero(
        { name: '', role: '', pitch: '', support: '', meta: '', ctaPrimary: '', ctaSecondary: '' },
        { primaryHref: '', secondaryHref: '' },
      );
    }).not.toThrow();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });
});
