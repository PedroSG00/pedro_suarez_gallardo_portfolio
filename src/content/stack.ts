import {
  Atom,
  Brain,
  Code,
  CodeBrackets,
  Cpu,
  Css3,
  Database,
  DatabaseScript,
  DataTransferBoth,
  Flask,
  Git,
  GitBranch,
  Github,
  Globe,
  GraphUp,
  Html5,
  Network,
  Play,
  Server,
  ServerConnection,
  Spark,
  StatsReport,
  Terminal,
  TerminalTag,
  TestTube,
} from 'iconoir-react';
import type { ComponentType, SVGProps } from 'react';

export const STACK_CATEGORIES = [
  'frontend',
  'data-visualization',
  'backend-apis',
  'databases',
  'testing-ci',
  'ai-tools',
] as const;

export type StackCategoryId = (typeof STACK_CATEGORIES)[number];

export type StackIcon = ComponentType<SVGProps<SVGSVGElement>>;

export interface StackTechnology {
  id: string;
  category: StackCategoryId;
  order: number;
  icon: StackIcon;
}

export const STACK_TECHNOLOGIES = [
  { id: 'javascript', category: 'frontend', order: 1, icon: Code },
  { id: 'typescript', category: 'frontend', order: 2, icon: CodeBrackets },
  { id: 'react', category: 'frontend', order: 3, icon: Atom },
  { id: 'nextJs', category: 'frontend', order: 4, icon: Globe },
  { id: 'html', category: 'frontend', order: 5, icon: Html5 },
  { id: 'css', category: 'frontend', order: 6, icon: Css3 },
  { id: 'chartJs', category: 'data-visualization', order: 7, icon: GraphUp },
  { id: 'recharts', category: 'data-visualization', order: 8, icon: StatsReport },
  { id: 'nodeJs', category: 'backend-apis', order: 9, icon: Server },
  {
    id: 'expressJs',
    category: 'backend-apis',
    order: 10,
    icon: ServerConnection,
  },
  { id: 'restApis', category: 'backend-apis', order: 11, icon: Network },
  {
    id: 'webSockets',
    category: 'backend-apis',
    order: 12,
    icon: DataTransferBoth,
  },
  { id: 'cSharp', category: 'backend-apis', order: 13, icon: Cpu },
  { id: 'python', category: 'backend-apis', order: 14, icon: Terminal },
  { id: 'mysql', category: 'databases', order: 15, icon: Database },
  { id: 'mongodb', category: 'databases', order: 16, icon: DatabaseScript },
  { id: 'jest', category: 'testing-ci', order: 17, icon: TestTube },
  { id: 'vitest', category: 'testing-ci', order: 18, icon: Flask },
  { id: 'playwright', category: 'testing-ci', order: 19, icon: Play },
  { id: 'githubActions', category: 'testing-ci', order: 20, icon: GitBranch },
  { id: 'githubCopilot', category: 'ai-tools', order: 21, icon: Spark },
  { id: 'claudeCode', category: 'ai-tools', order: 22, icon: Brain },
  { id: 'opencode', category: 'ai-tools', order: 23, icon: TerminalTag },
  { id: 'git', category: 'ai-tools', order: 24, icon: Git },
  { id: 'github', category: 'ai-tools', order: 25, icon: Github },
] as const satisfies readonly StackTechnology[];

export type StackTechnologyId = (typeof STACK_TECHNOLOGIES)[number]['id'];

export const FEATURED_STACK_TECHNOLOGY_IDS = [
  'react',
  'typescript',
] as const satisfies readonly StackTechnologyId[];
