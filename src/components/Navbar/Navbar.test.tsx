import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Navbar from './Navbar';
import type { Locale } from '@/lib/locale';
import type { SiteData } from '@/content/site';
import type { SectionDestination } from '@/content/sections';

let currentPathname = '/en';
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => currentPathname),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
}));

const locale: Locale = 'en';

const site: SiteData = {
  name: 'Pedro Suárez Gallardo',
  email: 'suarezgallardopedro@gmail.com',
  githubUrl: 'https://github.com/PedroSG00',
  linkedinUrl: 'https://linkedin.com/in/pedro-suarez-gallardo',
  cvPath: { en: '/EN_Pedro_Suarez_Gallardo_CV.pdf', es: '/ES_Pedro_Suarez_Gallardo_CV.pdf' },
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

function renderNavbar(props = {}) {
  return render(
    <Navbar
      locale={locale}
      site={site}
      sections={sections}
      labels={labels}
      {...props}
    />,
  );
}

function sectionLinks() {
  return screen
    .getAllByRole('link')
    .filter((l) => (l.getAttribute('href') ?? '').startsWith('#'));
}

beforeEach(() => {
  currentPathname = '/en';
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

  test('traduce las etiquetas de los enlaces en español', () => {
    const sectionsEs: SectionDestination[] = [
      { id: 'about', index: '01', label: 'Sobre mí' },
      { id: 'work', index: '02', label: 'Trabajo' },
      { id: 'stack', index: '03', label: 'Stack' },
      { id: 'contact', index: '04', label: 'Contacto' },
    ];
    renderNavbar({ locale: 'es', sections: sectionsEs });
    expect(screen.getAllByRole('link', { name: 'Sobre mí' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Trabajo' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Stack' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Contacto' })).toHaveLength(2);
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

  test('el summary anuncia Cerrar menú cuando el details está abierto', () => {
    renderNavbar();
    const summary = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(summary);
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();
  });

  test('muestra ThemeControl y LanguageSwitch', () => {
    renderNavbar();
    expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Español' })).toBeInTheDocument();
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
    renderNavbar({ locale: 'es', sections: sectionsEs });
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

  test('el menú se cierra al navegar con JS', () => {
    renderNavbar();
    const summary = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(summary);
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();
    const workLink = screen.getAllByRole('link', { name: 'Work' })[0];
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

  function setScrollY(value: number) {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value,
    });
  }

  function scrollTo(value: number) {
    setScrollY(value);
    fireEvent.scroll(window);
  }

  function mockReducedMotion(reduced: boolean) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? reduced : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }

  beforeEach(() => {
    mockSupportsScrollTimeline(true);
    setScrollY(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('estado inicial: la barra está visible, sin data-hidden', () => {
    renderNavbar();
    const header = screen.getByRole('banner');
    expect(header).not.toHaveAttribute('data-hidden');
  });

  test('scroll a 81 px hacia abajo añade data-hidden', () => {
    renderNavbar();
    scrollTo(81);
    const header = screen.getByRole('banner');
    expect(header).toHaveAttribute('data-hidden');
  });

  test('subir de nuevo quita data-hidden', () => {
    renderNavbar();
    scrollTo(640);
    expect(screen.getByRole('banner')).toHaveAttribute('data-hidden');
    scrollTo(600);
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-hidden');
  });

  test('scroll sin cambio de dirección mantiene el estado', () => {
    renderNavbar();
    scrollTo(81);
    expect(screen.getByRole('banner')).toHaveAttribute('data-hidden');
    scrollTo(81);
    expect(screen.getByRole('banner')).toHaveAttribute('data-hidden');
  });

  test('focusin dentro del header quita data-hidden de inmediato', () => {
    renderNavbar();
    scrollTo(81);
    expect(screen.getByRole('banner')).toHaveAttribute('data-hidden');
    fireEvent.focusIn(screen.getByRole('banner'));
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-hidden');
  });

  test('focusout recalcula y conserva el estado si no hubo cambio de scroll', () => {
    renderNavbar();
    const header = screen.getByRole('banner');
    scrollTo(81);
    expect(header).toHaveAttribute('data-hidden');
    fireEvent.focusIn(header);
    expect(header).not.toHaveAttribute('data-hidden');
    fireEvent.focusOut(header);
    expect(header).not.toHaveAttribute('data-hidden');
  });

  test('menú abierto: la barra se mantiene visible aunque se haga scroll', () => {
    renderNavbar();
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    scrollTo(81);
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-hidden');
  });

  test('con prefers-reduced-motion: reduce, la barra siempre es visible', () => {
    mockReducedMotion(true);
    renderNavbar();
    scrollTo(81);
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-hidden');
  });

  test('sin soporte de animation-timeline, la barra siempre es visible', () => {
    mockSupportsScrollTimeline(false);
    renderNavbar();
    scrollTo(81);
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-hidden');
  });

  test('doble focusIn y un solo focusOut mantienen la barra visible', () => {
    renderNavbar();
    const header = screen.getByRole('banner');
    scrollTo(81);
    expect(header).toHaveAttribute('data-hidden');
    fireEvent.focusIn(header);
    fireEvent.focusIn(header);
    expect(header).not.toHaveAttribute('data-hidden');
    fireEvent.focusOut(header);
    expect(header).not.toHaveAttribute('data-hidden');
  });

  test('con foco dentro del header, un scroll hacia abajo no oculta la barra', () => {
    renderNavbar();
    const header = screen.getByRole('banner');
    scrollTo(81);
    expect(header).toHaveAttribute('data-hidden');
    fireEvent.focusIn(header);
    expect(header).not.toHaveAttribute('data-hidden');
    scrollTo(90);
    expect(header).not.toHaveAttribute('data-hidden');
  });

  test('el foco no se pierde al ocultar y mostrar la barra', () => {
    renderNavbar();
    document.body.focus();
    expect(document.body).toHaveFocus();
    scrollTo(81);
    expect(screen.getByRole('banner')).toHaveAttribute('data-hidden');
    expect(document.body).toHaveFocus();
    const link = screen.getAllByRole('link', { name: 'About' })[0];
    link.focus();
    expect(link).toHaveFocus();
    scrollTo(0);
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-hidden');
    expect(link).toHaveFocus();
  });
});
