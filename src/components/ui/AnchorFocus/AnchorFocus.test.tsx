import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { SectionId } from '@/content/sections';
import SectionHeading from '@/components/ui/SectionHeading/SectionHeading';
import AnchorFocus from './AnchorFocus';

const SECTION_IDS: SectionId[] = ['about', 'work', 'stack', 'contact'];

function destination(
  sectionId: SectionId,
  label: string,
  withHeading = true
) {
  return (
    <section id={sectionId}>
      {withHeading ? (
        <SectionHeading id={sectionId} index="01" label={label} />
      ) : null}
    </section>
  );
}

describe('AnchorFocus (RF-13)', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  afterEach(() => {
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  test('does not render visible nodes', () => {
    const { container } = render(<AnchorFocus sectionIds={SECTION_IDS} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('empty hash does nothing', () => {
    render(
      <>
        <AnchorFocus sectionIds={SECTION_IDS} />
        {destination('about', 'About')}
      </>
    );
    const heading = screen.getByRole('heading', { name: 'About' });
    expect(heading).not.toHaveFocus();
  });

  test('unknown hash does nothing', () => {
    window.location.hash = '#unknown';
    render(
      <>
        <AnchorFocus sectionIds={SECTION_IDS} />
        {destination('about', 'About')}
      </>
    );
    const heading = screen.getByRole('heading', { name: 'About' });
    expect(heading).not.toHaveFocus();
  });

  test('valid hash focuses the heading on mount, not the section', () => {
    window.location.hash = '#about';
    render(
      <>
        <AnchorFocus sectionIds={SECTION_IDS} />
        {destination('about', 'About')}
      </>
    );
    const heading = screen.getByRole('heading', { name: 'About' });
    expect(heading).toHaveFocus();
    expect(heading).toHaveAttribute('data-section-heading');
  });

  test('valid hash focuses the heading with preventScroll', () => {
    render(
      <>
        <AnchorFocus sectionIds={SECTION_IDS} />
        {destination('about', 'About')}
        {destination('work', 'Work')}
      </>
    );
    const heading = screen.getByRole('heading', { name: 'About' });
    const focusSpy = vi.spyOn(heading, 'focus');

    window.location.hash = '#about';
    window.dispatchEvent(new Event('hashchange'));

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    expect(heading).toHaveFocus();
  });

  test('hashchange re-focuses when the hash changes', () => {
    render(
      <>
        <AnchorFocus sectionIds={SECTION_IDS} />
        {destination('about', 'About')}
        {destination('work', 'Work')}
      </>
    );

    window.location.hash = '#about';
    window.dispatchEvent(new Event('hashchange'));
    expect(screen.getByRole('heading', { name: 'About' })).toHaveFocus();

    window.location.hash = '#work';
    window.dispatchEvent(new Event('hashchange'));
    expect(screen.getByRole('heading', { name: 'Work' })).toHaveFocus();
  });

  test('section without heading does not throw', () => {
    window.location.hash = '#about';
    expect(() => {
      render(
        <>
          <AnchorFocus sectionIds={SECTION_IDS} />
          {destination('about', '', false)}
        </>
      );
    }).not.toThrow();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
