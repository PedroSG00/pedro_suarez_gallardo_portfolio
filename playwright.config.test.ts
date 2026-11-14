import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const config = fs.readFileSync(path.resolve('playwright.config.ts'), 'utf8');

// T23: playwright.config.ts — 4 desktop + 2 mobile browser matrix (RNF-6)
// Done when: config defines six projects: Chromium, Firefox, WebKit, Edge
// (desktop) and Chromium, WebKit (mobile).
describe('T23 playwright.config.ts — browser matrix', () => {
  it('defines six projects total', () => {
    const projectMatches = config.match(/name:\s*'[^']+'/g);
    expect(projectMatches).toHaveLength(6);
  });

  it('includes Desktop Chromium project', () => {
    expect(config).toContain("name: 'chromium'");
    expect(config).toContain("Desktop Chrome");
  });

  it('includes Desktop Firefox project', () => {
    expect(config).toContain("name: 'firefox'");
    expect(config).toContain('firefox');
  });

  it('includes Desktop WebKit project', () => {
    expect(config).toContain("name: 'webkit'");
    expect(config).toContain('webkit');
  });

  it('includes Desktop Edge project', () => {
    expect(config).toContain("name: 'edge'");
    expect(config).toContain('edge');
  });

  it('includes Mobile Chromium project', () => {
    expect(config).toContain("name: 'mobile-chromium'");
    expect(config).toContain('Pixel 7');
  });

  it('includes Mobile WebKit project', () => {
    expect(config).toContain("name: 'mobile-webkit'");
  });
});
