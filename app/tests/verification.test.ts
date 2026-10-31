import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('T-09 verification — real checks (red first)', () => {
  it('lint passes with exit 0', () => {
    expect(() => execSync('pnpm lint', { stdio: 'inherit' })).not.toThrow();
  });

  it('typecheck passes with exit 0', () => {
    expect(() => execSync('pnpm exec tsc --noEmit', { stdio: 'inherit' })).not.toThrow();
  });

  it('full test suite passes', () => {
    const out = execSync('pnpm exec vitest run --exclude="**/verification.test.ts"', { encoding: 'utf8', stdio: 'pipe', timeout: 120000 });
    expect(out).toContain('passed');
  });
});
