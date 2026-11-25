export const STACK_CARD_FACE_WIDTH = 768;
export const STACK_CARD_FACE_HEIGHT = 384;

export function resolveStackTokenColor(
  container: HTMLElement,
  token: string,
  fallback: string,
): string {
  const probe = document.createElement('span');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
  probe.style.color = `var(${token})`;
  container.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();

  return color && color !== 'canvastext' && !color.startsWith('var(')
    ? color
    : fallback;
}

export function prepareStackCardMark(image: HTMLImageElement): HTMLCanvasElement {
  const stamp = document.createElement('canvas');
  stamp.width = stamp.height = 216;
  const context = stamp.getContext('2d', { willReadFrequently: true });
  if (!context) return stamp;

  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const scale = 186 / Math.max(width, height);
  const left = (stamp.width - width * scale) / 2;
  const top = (stamp.height - height * scale) / 2;
  context.drawImage(image, left, top, width * scale, height * scale);

  // Keep white details cut out instead of tinting them into the surrounding mark.
  const pixels = context.getImageData(0, 0, stamp.width, stamp.height);
  const { data } = pixels;
  const lightness = (offset: number) =>
    Math.min(data[offset], data[offset + 1], data[offset + 2]);
  const hasInk = data.some((value, index) =>
    index % 4 === 3 && value > 64 && lightness(index - 3) < 232,
  );
  if (hasInk) {
    for (let offset = 0; offset < data.length; offset += 4) {
      const white = Math.max(0, (lightness(offset) - 232) / 23);
      data[offset + 3] *= 1 - white;
    }
    context.putImageData(pixels, 0, 0);
  }
  return stamp;
}

export function drawStackCardFace(
  canvas: HTMLCanvasElement,
  mark: HTMLCanvasElement | null,
  name: string,
  category: string,
  order: number,
  surface: string,
  ink: string,
  font: string,
): void {
  const context = canvas.getContext('2d');
  if (!context) return;

  context.clearRect(
    0,
    0,
    STACK_CARD_FACE_WIDTH,
    STACK_CARD_FACE_HEIGHT,
  );
  if (mark) {
    context.drawImage(mark, 38, 147, 180, 180);
    context.globalCompositeOperation = 'source-in';
    context.fillStyle = ink;
    context.fillRect(0, 0, STACK_CARD_FACE_WIDTH, STACK_CARD_FACE_HEIGHT);
    context.globalCompositeOperation = 'destination-over';
  }
  context.fillStyle = surface;
  context.fillRect(0, 0, STACK_CARD_FACE_WIDTH, STACK_CARD_FACE_HEIGHT);
  context.globalCompositeOperation = 'source-over';

  context.fillStyle = ink;
  context.strokeStyle = ink;
  context.lineWidth = 6;
  context.strokeRect(3, 3, STACK_CARD_FACE_WIDTH - 6, STACK_CARD_FACE_HEIGHT - 6);
  context.textBaseline = 'middle';
  context.font = `400 48px ${font}`;
  context.textAlign = 'left';
  context.fillText(`[${String(order).padStart(2, '0')}]`, 42, 60);
  context.textAlign = 'right';
  context.fillText(category.toUpperCase(), STACK_CARD_FACE_WIDTH - 42, 60, 510);
  context.globalAlpha = 0.34;
  context.fillRect(0, 111, STACK_CARD_FACE_WIDTH, 3);
  context.globalAlpha = 1;

  context.font = `700 84px ${font}`;
  context.textAlign = 'left';
  context.fillText(name, 240, 238, 486);
}
