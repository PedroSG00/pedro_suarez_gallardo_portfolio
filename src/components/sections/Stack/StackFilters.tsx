'use client';

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
