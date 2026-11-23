export function hasWebGLSupport(
  createCanvas?: () => HTMLCanvasElement,
): boolean {
  if (
    !createCanvas &&
    typeof WebGLRenderingContext === 'undefined' &&
    typeof WebGL2RenderingContext === 'undefined'
  ) {
    return false;
  }

  try {
    const canvas = (createCanvas ?? (() => document.createElement('canvas')))();
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!context) return false;

    context
      .getExtension('WEBGL_lose_context')
      ?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function hasStackPerspectiveSupport(
  context: Pick<WebGL2RenderingContext, 'getContextAttributes'>,
): boolean {
  return context.getContextAttributes()?.depth === true;
}
