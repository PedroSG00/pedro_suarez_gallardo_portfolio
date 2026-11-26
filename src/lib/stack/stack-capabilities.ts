export function createStackContext(canvas: HTMLCanvasElement): WebGL2RenderingContext | null {
  if (typeof WebGL2RenderingContext === 'undefined') return null;
  try {
    return canvas.getContext('webgl2', { alpha: true, powerPreference: 'low-power' });
  } catch {
    return null;
  }
}

export function hasStackPerspectiveSupport(
  context: Pick<WebGL2RenderingContext, 'getContextAttributes'>,
): boolean {
  return context.getContextAttributes()?.depth === true;
}
