import { afterEach, describe, expect, test, vi } from 'vitest';
import { createStackContext } from './stack-capabilities';

describe('createStackContext', () => {
  afterEach(() => vi.unstubAllGlobals());

  test('reuses the drawing context instead of allocating and releasing a probe', () => {
    vi.stubGlobal('WebGL2RenderingContext', class {});
    const context = {};
    const getContext = vi.fn(() => context);
    expect(createStackContext({ getContext } as unknown as HTMLCanvasElement)).toBe(context);
    expect(getContext).toHaveBeenCalledExactlyOnceWith('webgl2', {
      alpha: true,
      powerPreference: 'low-power',
    });
  });

  test.each(['unavailable', 'blocked'] as const)('falls back when WebGL 2 is %s', (reason) => {
    vi.stubGlobal('WebGL2RenderingContext', class {});
    const getContext = vi.fn(() => {
      if (reason === 'blocked') throw new Error('WebGL is blocked');
      return null;
    });
    expect(createStackContext({ getContext } as unknown as HTMLCanvasElement)).toBeNull();
    expect(getContext).toHaveBeenCalledOnce();
  });

  test('does not attempt initialization on browsers without WebGL 2', () => {
    vi.stubGlobal('WebGL2RenderingContext', undefined);
    const getContext = vi.fn();
    expect(createStackContext({ getContext } as unknown as HTMLCanvasElement)).toBeNull();
    expect(getContext).not.toHaveBeenCalled();
  });
});
