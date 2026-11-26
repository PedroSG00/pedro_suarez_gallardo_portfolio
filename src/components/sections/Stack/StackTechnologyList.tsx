import Image from 'next/image';
import type { StackCategoryId, StackTechnologyId } from '@/content/stack';
import Reveal from '@/components/ui/Reveal/Reveal';
import { isStackTechnologyEnabled, type StackState } from '@/lib/stack/stack-state';

export type StackListTechnology = {
  id: StackTechnologyId;
  category: StackCategoryId;
  name: string;
  description: string;
  selectLabel: string;
  brandMark: string;
  flatMark: string;
  featured: boolean;
};

export type StackListCategory = {
  id: StackCategoryId;
  label: string;
  technologies: readonly StackListTechnology[];
};

type Props = {
  id: string;
  groups: readonly StackListCategory[];
  state: StackState;
  interactive: boolean;
  flatView: boolean;
  onSelect: (id: StackTechnologyId) => void;
};

export default function StackTechnologyList({ id, groups, state, interactive, flatView, onSelect }: Props) {
  return (
    <div id={id} data-stack-accessible-list={!flatView} data-stack-list-interactive={interactive}>
      {groups.map(({ id: category, label, technologies }) => {
        const headingId = `stack-category-${category}`;
        const enabled = isStackTechnologyEnabled(category, state, flatView);

        return (
          <Reveal key={category} variant="fade">
            <div data-stack-category={category} data-active={enabled}>
              <h3 id={headingId} data-stack-category-heading>{label}</h3>
              <ul aria-labelledby={headingId} data-stack-technologies className="list-none">
                {technologies.map((technology) => (
                  <li
                    key={technology.id}
                    data-stack-technology={technology.id}
                    data-featured={technology.featured ? '' : undefined}
                    className="min-w-0 wrap-anywhere"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={flatView ? technology.flatMark : technology.brandMark}
                        alt=""
                        aria-hidden="true"
                        role="img"
                        width={48}
                        height={32}
                        unoptimized
                        data-stack-brand-mark
                        className="h-8 w-12 shrink-0 object-contain"
                      />
                      <span data-stack-technology-name>
                        {interactive ? (
                          <button
                            type="button"
                            aria-label={technology.selectLabel}
                            aria-pressed={state.selectedId === technology.id}
                            disabled={!enabled}
                            data-stack-select
                            onClick={() => onSelect(technology.id)}
                          >
                            {technology.name}
                          </button>
                        ) : technology.name}
                      </span>
                    </div>
                    {(!interactive || !flatView) && (
                      <p data-stack-technology-description className="max-w-prose text-body">
                        {technology.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
