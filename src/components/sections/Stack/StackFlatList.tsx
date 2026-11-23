import { useTranslations } from 'next-intl';
import {
  FEATURED_STACK_TECHNOLOGY_IDS,
  STACK_CATEGORIES,
  STACK_TECHNOLOGIES,
  type StackCategoryId,
} from '@/content/stack';
import Reveal from '@/components/ui/Reveal/Reveal';

const CATEGORY_MESSAGE_KEYS = {
  frontend: 'frontend',
  'data-visualization': 'dataVisualization',
  'backend-apis': 'backendApis',
  databases: 'databases',
  'testing-ci': 'testingCi',
  'ai-tools': 'aiTools',
} as const satisfies Record<StackCategoryId, string>;

const FEATURED_IDS: ReadonlySet<string> = new Set(
  FEATURED_STACK_TECHNOLOGY_IDS,
);

const CATEGORY_GROUPS = STACK_CATEGORIES.map((category) => ({
  id: category,
  technologies: STACK_TECHNOLOGIES.filter(
    (technology) => technology.category === category,
  ),
}));

export default function StackFlatList() {
  const t = useTranslations('stack');

  return (
    <div data-stack-flat-list className="grid">
      {CATEGORY_GROUPS.map(({ id, technologies }) => {
        const headingId = `stack-category-${id}`;

        return (
          <Reveal key={id} variant="fade">
            <div data-stack-category={id}>
              <h3 id={headingId} data-stack-category-heading>
                {t(`categories.${CATEGORY_MESSAGE_KEYS[id]}`)}
              </h3>
              <ul
                aria-labelledby={headingId}
                data-stack-technologies
                className="grid list-none"
              >
                {technologies.map(({ id: technologyId, icon: Icon }) => (
                  <li
                    key={technologyId}
                    data-stack-technology={technologyId}
                    data-featured={FEATURED_IDS.has(technologyId) ? '' : undefined}
                    className="min-w-0 wrap-anywhere"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        className="size-6 shrink-0"
                      />
                      <span data-stack-technology-name>
                        {t(`technologies.${technologyId}.name`)}
                      </span>
                    </div>
                    <p
                      data-stack-technology-description
                      className="max-w-prose text-body"
                    >
                      {t(`technologies.${technologyId}.description`)}
                    </p>
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
