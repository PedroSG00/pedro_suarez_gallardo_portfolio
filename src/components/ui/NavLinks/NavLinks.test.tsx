import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NavLinks, { type NavItem } from './NavLinks';

const items: NavItem[] = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#stack', label: 'Stack' },
  { href: '#contact', label: 'Contact' },
];

describe('NavLinks', () => {
  test('renders a list whose accessible name is ariaLabel', () => {
    render(<NavLinks items={items} ariaLabel="Main" />);
    const list = screen.getByRole('list', { name: 'Main' });
    expect(list.tagName).toBe('UL');
  });

  test('renders one link per item, in the received order', () => {
    render(<NavLinks items={items} ariaLabel="Main" />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(items.length);
    expect(
      links.map((link) => link.getAttribute('href')!),
    ).toEqual(items.map((item) => item.href));
    expect(links.map((link) => link.textContent)).toEqual(
      items.map((item) => item.label),
    );
  });

  test('calls onNavigate when a link is activated', () => {
    const onNavigate = vi.fn();
    render(
      <NavLinks items={items} ariaLabel="Main" onNavigate={onNavigate} />,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Work' }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  test('omits items without href', () => {
    render(
      <NavLinks
        items={[{ href: '', label: 'About' }, { href: '#work', label: 'Work' }]}
        ariaLabel="Main"
      />,
    );
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '#work');
  });

  test('omits items without label', () => {
    render(
      <NavLinks
        items={[{ href: '#about', label: '' }, { href: '#work', label: 'Work' }]}
        ariaLabel="Main"
      />,
    );
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '#work');
  });

  test('returns null when items is empty', () => {
    const { container } = render(<NavLinks items={[]} ariaLabel="Main" />);
    expect(container).toBeEmptyDOMElement();
  });
});
