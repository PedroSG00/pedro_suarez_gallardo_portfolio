export const STACK_CATEGORIES = [
  'frontend',
  'data-visualization',
  'backend-apis',
  'databases',
  'testing-ci',
  'ai-tools',
] as const;

export type StackCategoryId = (typeof STACK_CATEGORIES)[number];

export interface StackTechnology {
  id: string;
  category: StackCategoryId;
  order: number;
  brandMark: string;
}

export const STACK_TECHNOLOGIES = [
  {
    id: 'javascript',
    category: 'frontend',
    order: 1,
    brandMark: '/stack/javascript.svg',
  },
  {
    id: 'typescript',
    category: 'frontend',
    order: 2,
    brandMark: '/stack/typescript.svg',
  },
  {
    id: 'react',
    category: 'frontend',
    order: 3,
    brandMark: '/stack/react.svg',
  },
  {
    id: 'nextJs',
    category: 'frontend',
    order: 4,
    brandMark: '/stack/nextJs.svg',
  },
  {
    id: 'html',
    category: 'frontend',
    order: 5,
    brandMark: '/stack/html.svg',
  },
  {
    id: 'css',
    category: 'frontend',
    order: 6,
    brandMark: '/stack/css.svg',
  },
  {
    id: 'chartJs',
    category: 'data-visualization',
    order: 7,
    brandMark: '/stack/chartJs.svg',
  },
  {
    id: 'recharts',
    category: 'data-visualization',
    order: 8,
    brandMark: '/stack/recharts.svg',
  },
  {
    id: 'nodeJs',
    category: 'backend-apis',
    order: 9,
    brandMark: '/stack/nodeJs.svg',
  },
  {
    id: 'expressJs',
    category: 'backend-apis',
    order: 10,
    brandMark: '/stack/expressJs.svg',
  },
  {
    id: 'restApis',
    category: 'backend-apis',
    order: 11,
    brandMark: '/stack/restApis.svg',
  },
  {
    id: 'webSockets',
    category: 'backend-apis',
    order: 12,
    brandMark: '/stack/webSockets.svg',
  },
  {
    id: 'cSharp',
    category: 'backend-apis',
    order: 13,
    brandMark: '/stack/cSharp.svg',
  },
  {
    id: 'python',
    category: 'backend-apis',
    order: 14,
    brandMark: '/stack/python.svg',
  },
  {
    id: 'mysql',
    category: 'databases',
    order: 15,
    brandMark: '/stack/mysql.svg',
  },
  {
    id: 'mongodb',
    category: 'databases',
    order: 16,
    brandMark: '/stack/mongodb.svg',
  },
  {
    id: 'jest',
    category: 'testing-ci',
    order: 17,
    brandMark: '/stack/jest.svg',
  },
  {
    id: 'vitest',
    category: 'testing-ci',
    order: 18,
    brandMark: '/stack/vitest.svg',
  },
  {
    id: 'playwright',
    category: 'testing-ci',
    order: 19,
    brandMark: '/stack/playwright.svg',
  },
  {
    id: 'githubActions',
    category: 'testing-ci',
    order: 20,
    brandMark: '/stack/githubActions.svg',
  },
  {
    id: 'githubCopilot',
    category: 'ai-tools',
    order: 21,
    brandMark: '/stack/githubCopilot.svg',
  },
  {
    id: 'claudeCode',
    category: 'ai-tools',
    order: 22,
    brandMark: '/stack/claudeCode.svg',
  },
  {
    id: 'opencode',
    category: 'ai-tools',
    order: 23,
    brandMark: '/stack/opencode.svg',
  },
  {
    id: 'git',
    category: 'ai-tools',
    order: 24,
    brandMark: '/stack/git.svg',
  },
  {
    id: 'github',
    category: 'ai-tools',
    order: 25,
    brandMark: '/stack/github.svg',
  },
] as const satisfies readonly StackTechnology[];

export type StackTechnologyId = (typeof STACK_TECHNOLOGIES)[number]['id'];

export const FEATURED_STACK_TECHNOLOGY_IDS = [
  'react',
  'typescript',
] as const satisfies readonly StackTechnologyId[];
