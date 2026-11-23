'use client';

import { useEffect, useState } from 'react';
import type { StackFilter } from '@/lib/stack/stack-state';

export type StackFilterOption = {
  id: StackFilter;
  label: string;
};

type Props = {
  activeFilter: StackFilter;
  groupLabel: string;
  options: readonly StackFilterOption[];
  onFilterChange: (filter: StackFilter) => void;
};

export default function StackFilters({
  activeFilter,
  groupLabel,
  options,
  onFilterChange,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Keep controls out of the server HTML so the no-JavaScript list stays informational.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <fieldset data-stack-filter-group>
      <legend>{groupLabel}</legend>
      <div data-stack-filter-options>
        {options.map(({ id, label }) => {
          const isActive = activeFilter === id;

          return (
            <label
              key={id}
              data-stack-filter-option
              data-active={isActive}
            >
              <input
                type="radio"
                name="stack-category-filter"
                value={id}
                checked={isActive}
                onChange={() => onFilterChange(id)}
              />
              <span>{label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
