/**
 * Pure geometry helpers for the crop selector and the overlay.
 * Rectangles are {x, y, width, height}. "display" = CSS pixels of the shown <img>; "natural" = pixels of the decoded image.
 */

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/** Rectangle spanned by two drag points, clamped to the display box. */
export function rectFromPoints(a, b, displayWidth, displayHeight) {
  const x1 = clamp(Math.min(a.x, b.x), 0, displayWidth);
  const y1 = clamp(Math.min(a.y, b.y), 0, displayHeight);
  const x2 = clamp(Math.max(a.x, b.x), 0, displayWidth);
  const y2 = clamp(Math.max(a.y, b.y), 0, displayHeight);
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

/** Map a display rectangle to natural-image pixels, rounded and clamped. */
export function displayRectToNatural(rect, display, natural) {
  const sx = natural.width / display.width;
  const sy = natural.height / display.height;
  const x = clamp(Math.round(rect.x * sx), 0, natural.width);
  const y = clamp(Math.round(rect.y * sy), 0, natural.height);
  const right = clamp(Math.round((rect.x + rect.width) * sx), 0, natural.width);
  const bottom = clamp(Math.round((rect.y + rect.height) * sy), 0, natural.height);
  return { x, y, width: right - x, height: bottom - y };
}

/** Grow a natural-pixel rectangle by a fraction of its size on every side (M8 used 5%), clamped to the image. */
export function padRect(rect, fraction, natural) {
  const px = rect.width * fraction;
  const py = rect.height * fraction;
  const x = clamp(Math.floor(rect.x - px), 0, natural.width);
  const y = clamp(Math.floor(rect.y - py), 0, natural.height);
  const right = clamp(Math.ceil(rect.x + rect.width + px), 0, natural.width);
  const bottom = clamp(Math.ceil(rect.y + rect.height + py), 0, natural.height);
  return { x, y, width: right - x, height: bottom - y };
}

/** A selection smaller than this (display px) is treated as an accidental click, not a crop. */
export const MIN_CROP_DISPLAY_PX = 12;

export function isUsableCrop(rect) {
  return !!rect && rect.width >= MIN_CROP_DISPLAY_PX && rect.height >= MIN_CROP_DISPLAY_PX;
}

/**
 * Convert an OCR bounding box ({x0,y0,x1,y1} in the OCR input image) to percentages of that image,
 * so an overlay can be positioned with CSS regardless of the display size.
 */
export function bboxToPercent(bbox, imageWidth, imageHeight) {
  return {
    left: (bbox.x0 / imageWidth) * 100,
    top: (bbox.y0 / imageHeight) * 100,
    width: ((bbox.x1 - bbox.x0) / imageWidth) * 100,
    height: ((bbox.y1 - bbox.y0) / imageHeight) * 100,
  };
}
