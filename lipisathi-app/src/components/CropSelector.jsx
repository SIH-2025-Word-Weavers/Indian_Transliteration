import { useRef, useState } from 'react';
import styles from './CropSelector.module.css';
import { rectFromPoints, isUsableCrop } from '../utils/cropGeometry';

/**
 * Shows the image and lets the user drag a rectangle around the sign (mouse or touch).
 * Reports the selection in CSS pixels of the displayed image plus that image's display size, so the caller can map it
 * to natural pixels (see utils/cropImage.js). Passing `null` means "use the whole image".
 */
function CropSelector({ src, crop, disabled, onCropChange }) {
  const imgRef = useRef(null);
  const startRef = useRef(null);
  const [dragRect, setDragRect] = useState(null);

  const point = (e) => {
    const box = imgRef.current.getBoundingClientRect();
    return { x: e.clientX - box.left, y: e.clientY - box.top, w: box.width, h: box.height };
  };

  const handlePointerDown = (e) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = point(e);
    startRef.current = p;
    setDragRect({ x: p.x, y: p.y, width: 0, height: 0 });
  };

  const handlePointerMove = (e) => {
    if (!startRef.current) return;
    const p = point(e);
    setDragRect(rectFromPoints(startRef.current, p, p.w, p.h));
  };

  const handlePointerUp = (e) => {
    if (!startRef.current) return;
    const p = point(e);
    const rect = rectFromPoints(startRef.current, p, p.w, p.h);
    startRef.current = null;
    setDragRect(null);
    if (isUsableCrop(rect)) onCropChange({ rect, displaySize: { width: p.w, height: p.h } });
  };

  const shown = dragRect || (crop && crop.rect);
  const hasCrop = !!(crop && crop.rect);

  return (
    <div className={styles.wrapper}>
      <p className={styles.hint}>
        {hasCrop
          ? 'Only the selected area will be read. Drag again to change it.'
          : 'Tip: drag on the image to select just the sign. Whole photos give poor OCR results.'}
      </p>
      <div
        className={styles.stage}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          startRef.current = null;
          setDragRect(null);
        }}
        data-testid="crop-stage"
      >
        <img ref={imgRef} src={src} alt="Selected" className={styles.image} draggable={false} />
        {shown && (
          <div
            className={styles.selection}
            data-testid="crop-selection"
            style={{ left: shown.x, top: shown.y, width: shown.width, height: shown.height }}
          />
        )}
      </div>
      <div className={styles.actions}>
        {hasCrop && (
          <button type="button" className={styles.linkButton} onClick={() => onCropChange(null)} disabled={disabled}>
            Use whole image
          </button>
        )}
      </div>
    </div>
  );
}

export default CropSelector;
