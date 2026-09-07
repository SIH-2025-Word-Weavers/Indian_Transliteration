import { useState } from 'react';
import styles from './OCRResult.module.css';

function OCRResult({ result }) {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('Failed to copy text');
    }
  };

  const characterCount = result.text.trim().length;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>OCR Result</h3>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Confidence:</span>
          <span className={styles.statValue}>{result.confidence.toFixed(1)}%</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Processing Time:</span>
          <span className={styles.statValue}>{result.processingTime}s</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Characters:</span>
          <span className={styles.statValue}>{characterCount}</span>
        </div>
      </div>

      <div className={styles.textContainer}>
        <div className={styles.textHeader}>
          <span className={styles.textLabel}>Extracted Text:</span>
          <button
            onClick={handleCopy}
            className={styles.copyButton}
            title="Copy to clipboard"
          >
            {copied ? '✓ Copied' : 'Copy Text'}
          </button>
        </div>
        <div className={styles.text}>
          {result.text || '(No text detected)'}
        </div>
      </div>
    </div>
  );
}

export default OCRResult;
