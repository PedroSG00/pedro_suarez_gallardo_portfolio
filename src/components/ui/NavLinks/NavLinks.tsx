'use client';

export type NavItem = {
  href: string;
  label: string;
};

type Props = {
  items: NavItem[];
  ariaLabel: string;
  onNavigate?: () => void;
  inline?: boolean;
};

export default function NavLinks({ items, ariaLabel, onNavigate, inline = false }: Props) {
  if (items.length === 0) {
    return null;
  }

  const handleClick = () => {
    onNavigate?.();
  };

  return (
    <ul aria-label={ariaLabel} className={inline ? 'flex items-center justify-center gap-1' : 'grid gap-1'}>
      {items
        .filter((item) => item.href && item.label)
        .map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              onClick={handleClick}
              className="flex min-h-11 items-center whitespace-nowrap px-3 text-meta underline-offset-4 hover:bg-ink hover:text-surface hover:underline"
            >
              {item.label}
            </a>
          </li>
        ))}
    </ul>
  );
}
