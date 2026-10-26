import { useEffect, useRef, useState } from 'react';
import styles from './TransliterationOverlay.module.css';
import { bboxToPercent } from '../utils/cropGeometry';

/**
 * Draws each transliterated line over the image region where OCR found it.
 * Positions come from the OCR line boxes (in the OCR input image's pixels), converted to percentages so they scale
 * with the display size; font size follows the line height at the current display scale.
 * Quality depends entirely on how well OCR located the lines.
 */
function TransliterationOverlay({ image, lines, transliterations }) {
  const imgRef = useRef(null);
  const [natural, setNatural] = useState(null);
  const [displayWidth, setDisplayWidth] = useState(0);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => setDisplayWidth(img.clientWidth));
    ro.observe(img);
    return () => ro.disconnect();
  }, [image]);

  if (!image || !lines || !transliterations) return null;

  const scale = natural && displayWidth ? displayWidth / natural.width : 0;

  return (
    <div className={styles.wrapper} data-testid="translit-overlay">
      <div className={styles.stage}>
        <img
          ref={imgRef}
          src={image}
          alt="OCR input with transliteration overlay"
          className={styles.image}
          onLoad={(e) => {
            setNatural({ width: e.target.naturalWidth, height: e.target.naturalHeight });
            setDisplayWidth(e.target.clientWidth);
          }}
        />
        {natural &&
          scale > 0 &&
          lines.map((line, i) => {
            const text = transliterations[i];
            if (!text || !text.trim() || !line.bbox) return null;
            const p = bboxToPercent(line.bbox, natural.width, natural.height);
            const lineHeightPx = (line.bbox.y1 - line.bbox.y0) * scale;
            return (
              <div
                key={i}
                className={styles.label}
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  width: `${p.width}%`,
                  height: `${p.height}%`,
                  fontSize: `${Math.max(8, lineHeightPx * 0.7)}px`,
                }}
              >
                {text}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default TransliterationOverlay;
