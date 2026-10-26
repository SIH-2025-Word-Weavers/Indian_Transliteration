import { displayRectToNatural, padRect } from './cropGeometry';

/** Padding added around a user crop. M8 measured crops with 5% padding. */
export const CROP_PADDING = 0.05;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode the image'));
    img.src = src;
  });
}

/**
 * Crop `src` (a data URL / object URL) to a display-space rectangle and return a PNG data URL.
 * The crop is drawn from the browser-decoded image, so EXIF orientation of phone photos is already applied
 * and the selection (made on the displayed image) lines up with what is cut out.
 *
 * @param {string} src
 * @param {{x:number,y:number,width:number,height:number}} displayRect rectangle in CSS px of the shown image
 * @param {{width:number,height:number}} displaySize CSS size of the shown image
 * @returns {Promise<{dataUrl:string,width:number,height:number}>}
 */
export async function cropToDataUrl(src, displayRect, displaySize) {
  const img = await loadImage(src);
  const natural = { width: img.naturalWidth, height: img.naturalHeight };
  const rect = padRect(displayRectToNatural(displayRect, displaySize, natural), CROP_PADDING, natural);
  if (rect.width < 1 || rect.height < 1) throw new Error('Crop area is empty');
  const canvas = document.createElement('canvas');
  canvas.width = rect.width;
  canvas.height = rect.height;
  canvas.getContext('2d').drawImage(img, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
  return { dataUrl: canvas.toDataURL('image/png'), width: rect.width, height: rect.height };
}
