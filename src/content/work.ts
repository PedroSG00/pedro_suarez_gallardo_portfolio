import { Computer, GraphUp, Network, Server, ViewGrid } from 'iconoir-react';

export const WORK_ENTRIES = [
  {
    id: 'desktopAppsToWeb',
    icon: Computer,
    technologies: ['React', 'TypeScript'],
  },
  {
    id: 'liveSupervisionDashboard',
    icon: GraphUp,
    technologies: ['React', 'TypeScript'],
  },
  {
    id: 'adminSuite',
    icon: ViewGrid,
    technologies: ['React', 'TypeScript'],
  },
  {
    id: 'visualFlowEditor',
    icon: Network,
    technologies: ['React', 'TypeScript', 'WebSockets'],
  },
  {
    id: 'integrationsAndBackendApis',
    icon: Server,
    technologies: ['Node.js', 'Express', 'C#', 'PHP', 'Python', 'REST'],
  },
] as const;
