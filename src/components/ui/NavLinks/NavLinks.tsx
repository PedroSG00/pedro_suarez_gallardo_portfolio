'use client';

export type NavItem = {
  href: string;
  label: string;
};

type Props = {
  items: NavItem[];
  ariaLabel: string;
  onNavigate?: () => void;
};

export default function NavLinks({ items, ariaLabel, onNavigate }: Props) {
  if (items.length === 0) {
    return null;
  }

  const handleClick = () => {
    onNavigate?.();
  };

  return (
    <ul aria-label={ariaLabel}>
      {items
        .filter((item) => item.href && item.label)
        .map((item) => (
          <li key={item.href}>
            <a href={item.href} onClick={handleClick}>
              {item.label}
            </a>
          </li>
        ))}
    </ul>
  );
}
