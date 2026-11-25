'use client';

import { useEffect, useState } from 'react';
import {
  Code,
  Database,
  Flask,
  GraphUp,
  Server,
  Sparks,
  ViewGrid,
} from 'iconoir-react';
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

const FILTER_ICONS = {
  all: ViewGrid,
  frontend: Code,
  'data-visualization': GraphUp,
  'backend-apis': Server,
  databases: Database,
  'testing-ci': Flask,
  'ai-tools': Sparks,
} satisfies Record<StackFilter, typeof ViewGrid>;

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
          const Icon = FILTER_ICONS[id];

          return (
            <label
              key={id}
              data-stack-filter-option
              data-active={isActive}
              title={label}
            >
              <input
                type="radio"
                name="stack-category-filter"
                value={id}
                checked={isActive}
                onChange={() => onFilterChange(id)}
              />
              <Icon aria-hidden="true" focusable="false" width={20} height={20} />
              <span className="sr-only">{label}</span>
            </label>
          );
        })}
      </div>
      <span role="status" aria-live="polite" data-stack-active-filter>
        {options.find(({ id }) => id === activeFilter)?.label}
      </span>
    </fieldset>
  );
}
