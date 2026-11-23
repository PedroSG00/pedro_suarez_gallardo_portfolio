import { describe, expect, test, vi } from 'vitest';
import { hasWebGLSupport } from './stack-capabilities';

describe('hasWebGLSupport', () => {
  test('accepts WebGL 2 and releases the probe context', () => {
    const loseContext = vi.fn();
    const getExtension = vi.fn(() => ({ loseContext }));
    const webgl2 = { getExtension } as unknown as WebGL2RenderingContext;
    const canvas = {
      getContext: vi.fn((type: string) => (type === 'webgl2' ? webgl2 : null)),
    } as unknown as HTMLCanvasElement;

    expect(hasWebGLSupport(() => canvas)).toBe(true);
    expect(canvas.getContext).toHaveBeenCalledWith('webgl2');
    expect(getExtension).toHaveBeenCalledWith('WEBGL_lose_context');
    expect(loseContext).toHaveBeenCalledOnce();
  });

  test('falls back to WebGL 1 when WebGL 2 is unavailable', () => {
    const webgl = {
      getExtension: vi.fn(() => null),
    } as unknown as WebGLRenderingContext;
    const canvas = {
      getContext: vi.fn((type: string) => (type === 'webgl' ? webgl : null)),
    } as unknown as HTMLCanvasElement;

    expect(hasWebGLSupport(() => canvas)).toBe(true);
    expect(canvas.getContext).toHaveBeenNthCalledWith(1, 'webgl2');
    expect(canvas.getContext).toHaveBeenNthCalledWith(2, 'webgl');
  });

  test('returns false when neither WebGL context is available', () => {
    const canvas = {
      getContext: vi.fn(() => null),
    } as unknown as HTMLCanvasElement;

    expect(hasWebGLSupport(() => canvas)).toBe(false);
  });

  test('returns false when the browser rejects a WebGL context', () => {
    const canvas = {
      getContext: vi.fn(() => {
        throw new Error('WebGL is blocked');
      }),
    } as unknown as HTMLCanvasElement;

    expect(hasWebGLSupport(() => canvas)).toBe(false);
  });

  test('does not probe a DOM canvas when browser WebGL APIs are absent', () => {
    const createCanvas = vi.fn();

    expect(hasWebGLSupport()).toBe(false);
    expect(createCanvas).not.toHaveBeenCalled();
  });
});
