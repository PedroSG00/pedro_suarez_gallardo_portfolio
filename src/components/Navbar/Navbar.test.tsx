import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import Navbar from './Navbar';
import type { Locale } from '@/lib/locale';
import type { SiteData } from '@/content/site';
import type { SectionDestination } from '@/content/sections';
import { renderWithIntl } from '@/test/render-with-intl';

let currentPathname = '/';
vi.mock('@/i18n/navigation', () => ({
  usePathname: vi.fn(() => currentPathname),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
  getPathname: ({ href, locale }: { href: string; locale: string }) =>
    href === '/' ? `/${locale}` : `/${locale}${href}`,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

const site: SiteData = {
  name: 'Pedro Suárez Gallardo',
  email: 'suarezgallardopedro@gmail.com',
  githubUrl: 'https://github.com/PedroSG00',
  linkedinUrl: 'https://linkedin.com/in/pedro-suarez-gallardo',
  cvPath: { en: '/EN_Pedro_Suarez_Gallardo_CV.pdf', es: '/ES_Pedro_Suarez_Gallardo_CV.pdf' },
  portraitSrc: '/pedro-suarez.png',
};

const sections: SectionDestination[] = [
  { id: 'about', index: '01', label: 'About' },
  { id: 'work', index: '02', label: 'Work' },
  { id: 'stack', index: '03', label: 'Stack' },
  { id: 'contact', index: '04', label: 'Contact' },
];

const labels = {
  nav: 'Main',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  themeToggle: 'Toggle theme',
  langEn: 'English',
  langEs: 'Español',
};

function renderNavbar(
  props = {},
  intlLocale: Locale = 'en',
  currentPath = '/',
) {
  currentPathname = currentPath;
  return renderWithIntl(
    <Navbar
      locale={intlLocale}
      site={site}
      sections={sections}
      labels={labels}
      {...props}
    />,
    { locale: intlLocale },
  );
}

function sectionLinks() {
  return screen
    .getAllByRole('link')
    .filter((l) => (l.getAttribute('href') ?? '').startsWith('#'));
}

beforeEach(() => {
  currentPathname = '/';
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Navbar', () => {
  test('muestra la identidad con nombre accesible y enlace al inicio', () => {
    renderNavbar();
    const link = screen.getByRole('link', { name: 'Pedro Suárez Gallardo' });
    expect(link).toHaveAttribute('href', '/en');
  });

  test('muestra cuatro enlaces en orden About, Work, Stack, Contact', () => {
    renderNavbar();
    const links = sectionLinks().slice(0, 4);
    expect(links).toHaveLength(4);
    expect(links.map((l) => l.textContent)).toEqual([
      'About', 'Work', 'Stack', 'Contact',
    ]);
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '#about', '#work', '#stack', '#contact',
    ]);
  });

  test('renders Spanish section labels from the Spanish message catalog', () => {
    const sectionsEs: SectionDestination[] = [
      { id: 'about', index: '01', label: 'Sobre mí' },
      { id: 'work', index: '02', label: 'Trabajo' },
      { id: 'stack', index: '03', label: 'Stack' },
      { id: 'contact', index: '04', label: 'Contacto' },
    ];
    renderNavbar({ locale: 'es', sections: sectionsEs }, 'es', '/es');
    expect(screen.getAllByRole('link', { name: 'Sobre mí' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Trabajo' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Stack' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Contacto' })).toHaveLength(2);
  });

  test('uses next-intl translations when labels and sections are not passed', () => {
    renderWithIntl(<Navbar site={site} />, { locale: 'es' });
    expect(screen.getAllByRole('link', { name: 'Sobre mí' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Trabajo' })).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument();
  });

  test('renderiza un NavLinks de escritorio y otro dentro de <details> móvil', () => {
    renderNavbar();
    expect(screen.getAllByRole('list', { name: 'Main' })).toHaveLength(2);
    const details = screen.getByRole('group');
    expect(details.tagName).toBe('DETAILS');
    expect(within(details).getByRole('list')).toBeInTheDocument();
  });

  test('el summary anuncia Abrir menú cuando está cerrado', () => {
    renderNavbar();
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });

  test('announces Close menu after the native menu opens', async () => {
    renderNavbar();
    const summary = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(summary);
    expect(await screen.findByRole('button', { name: 'Close menu' })).toBeInTheDocument();
  });

  test('muestra ThemeControl y LanguageSwitch', () => {
    renderNavbar();
    expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Español' })).toBeInTheDocument();
  });

  test('shows the hamburger after the theme and language controls on mobile', () => {
    renderNavbar();
    const theme = screen.getByRole('button', { name: 'Toggle theme' });
    const language = screen.getByRole('button', { name: 'Español' });
    const menu = screen.getByRole('button', { name: 'Open menu' });
    expect(theme.compareDocumentPosition(language) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(language.compareDocumentPosition(menu) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('onClick de la identidad navega a / en la home', () => {
    const onClick = vi.fn();
    renderNavbar({ site: { ...site, name: 'Pedro Suárez Gallardo' } });
    const link = screen.getByRole('link', { name: 'Pedro Suárez Gallardo' });
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  test('los enlaces usan #id en la home', () => {
    renderNavbar();
    const aboutLinks = screen.getAllByRole('link', { name: 'About' });
    expect(aboutLinks[0]).toHaveAttribute('href', '#about');
    const workLinks = screen.getAllByRole('link', { name: 'Work' });
    expect(workLinks[0]).toHaveAttribute('href', '#work');
    const stackLinks = screen.getAllByRole('link', { name: 'Stack' });
    expect(stackLinks[0]).toHaveAttribute('href', '#stack');
    const contactLinks = screen.getAllByRole('link', { name: 'Contact' });
    expect(contactLinks[0]).toHaveAttribute('href', '#contact');
  });

  test('los enlaces usan /{locale}#id fuera de la home', () => {
    const sectionsEs: SectionDestination[] = [
      { id: 'about', index: '01', label: 'Sobre mí' },
      { id: 'work', index: '02', label: 'Trabajo' },
      { id: 'stack', index: '03', label: 'Stack' },
      { id: 'contact', index: '04', label: 'Contacto' },
    ];
    renderNavbar({ locale: 'es', sections: sectionsEs }, 'es', '/es/ruta-inexistente');
    const aboutLinks = screen.getAllByRole('link', { name: 'Sobre mí' });
    expect(aboutLinks[0]).toHaveAttribute('href', '/es#about');
  });

  test('no hay enlaces a proyectos ni a rutas inexistentes', () => {
    renderNavbar();
    const allLinks = screen.getAllByRole('link');
    const projectLinks = allLinks.filter((l) => (l.getAttribute('href') ?? '').includes('/projects'));
    expect(projectLinks).toHaveLength(0);
  });

  test('falta una etiqueta de sección y se omite ese enlace', () => {
    const incomplete: SectionDestination[] = [
      { id: 'about', index: '01', label: 'About' },
      { id: 'work', index: '02', label: '' },
      { id: 'stack', index: '03', label: 'Stack' },
      { id: 'contact', index: '04', label: 'Contact' },
    ];
    renderNavbar({ sections: incomplete });
    const links = sectionLinks();
    expect(links).toHaveLength(6);
    expect(screen.queryByRole('link', { name: 'Work' })).not.toBeInTheDocument();
  });

  test('falta el nombre y se omite el Logo', () => {
    renderNavbar({ site: { ...site, name: '' } });
    expect(screen.queryByRole('link', { name: 'Pedro Suárez Gallardo' })).not.toBeInTheDocument();
  });

  test('closes the mobile menu after following a section link', async () => {
    renderNavbar();
    const summary = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(summary);
    expect(await screen.findByRole('button', { name: 'Close menu' })).toBeInTheDocument();
    const workLink = within(screen.getByRole('group')).getByRole('link', { name: 'Work' });
    fireEvent.click(workLink);
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });
});

describe('Navbar — visibilidad por scroll y foco (RF-3, RF-4, RF-12)', () => {
  function mockSupportsScrollTimeline(supported: boolean) {
    const original = CSS.supports.bind(CSS);
    vi.spyOn(CSS, 'supports').mockImplementation((prop: string) =>
      prop === 'animation-timeline: view()' ? supported : original(prop),
    );
  }

  function mockScrollPosition(scrollY: number) {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: scrollY,
    });
  }

  function dispatchScroll() {
    fireEvent.scroll(window);
  }

  function dispatchUserScroll() {
    fireEvent.wheel(window, { deltaY: 120 });
    dispatchScroll();
  }

  beforeEach(() => {
    mockSupportsScrollTimeline(true);
    mockScrollPosition(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('estado inicial visible', () => {
    renderNavbar();
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-hidden');
  });

  test('scroll a 81 px bajando añade data-hidden', () => {
    renderNavbar();
    mockScrollPosition(81);
    dispatchUserScroll();
    expect(screen.getByRole('banner')).toHaveAttribute('data-hidden');
  });

  test('subir lo quita', () => {
    renderNavbar();
    mockScrollPosition(100);
    dispatchUserScroll();
    expect(screen.getByRole('banner')).toHaveAttribute('data-hidden');
    mockScrollPosition(50);
    dispatchUserScroll();
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-hidden');
  });

  test('scroll sin cambio mantiene el estado', () => {
    renderNavbar();
    mockScrollPosition(100);
    dispatchUserScroll();
    expect(screen.getByRole('banner')).toHaveAttribute('data-hidden');
    dispatchScroll();
    expect(screen.getByRole('banner')).toHaveAttribute('data-hidden');
  });

  test('programmatic scroll restoration stays visible until the first user scroll', () => {
    renderNavbar();
    mockScrollPosition(320);
    dispatchScroll();
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-hidden');

    mockScrollPosition(400);
    dispatchUserScroll();
    expect(screen.getByRole('banner')).toHaveAttribute('data-hidden');
  });

  test('focusin lo quita', () => {
    renderNavbar();
    mockScrollPosition(100);
    dispatchUserScroll();
    expect(screen.getByRole('banner')).toHaveAttribute('data-hidden');
    const banner = screen.getByRole('banner');
    fireEvent.focusIn(banner);
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-hidden');
  });

  test('keeps the navbar visible while the native menu is open', async () => {
    renderNavbar();
    const summary = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(summary);
    await screen.findByRole('button', { name: 'Close menu' });
    mockScrollPosition(100);
    dispatchUserScroll();
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-hidden');
  });

  test('reduced motion siempre visible', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    renderNavbar();
    mockScrollPosition(100);
    dispatchUserScroll();
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-hidden');
  });
});
