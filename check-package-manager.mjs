const agent = process.env.npm_config_user_agent ?? '';

if (!agent.startsWith('pnpm/')) {
  console.error('');
  console.error('This repository only supports pnpm.');
  console.error('Install dependencies with: pnpm install');
  console.error(`Detected package manager: ${agent || 'unknown'}`);
  console.error('');
  process.exit(1);
}
