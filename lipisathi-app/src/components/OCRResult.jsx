import { useState } from 'react';
import styles from './OCRResult.module.css';
import TransliterationOverlay from './TransliterationOverlay';
import { speak, getSpeechLangForScript, isSpeechSupported } from '../services/speechService';

function OCRResult({
  result,
  ocrImage,
  detectedScript,
  targetScript,
  transliterationResult,
  lineTransliterations,
  onTransliterate,
  supportedScripts,
}) {
  const [copied, setCopied] = useState(false);
  const [copiedTranslit, setCopiedTranslit] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [speechMessage, setSpeechMessage] = useState('');

  const handleSpeak = async (text, script) => {
    setSpeechMessage('');
    const res = await speak(text, getSpeechLangForScript(script));
    if (!res.ok) setSpeechMessage(res.reason);
  };

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

  const handleCopyTranslit = async () => {
    try {
      await navigator.clipboard.writeText(transliterationResult);
      setCopiedTranslit(true);
      setTimeout(() => setCopiedTranslit(false), 2000);
    } catch (error) {
      alert('Failed to copy text');
    }
  };

  const handleTargetChange = (e) => {
    setSelectedTarget(e.target.value);
  };

  const handleTransliterateClick = () => {
    if (selectedTarget && onTransliterate) {
      onTransliterate(selectedTarget);
    }
  };

  const characterCount = result.text.trim().length;
  const canTransliterate = detectedScript && detectedScript !== 'Unknown';

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
        <div className={styles.stat}>
          <span className={styles.statLabel}>Detected Script:</span>
          <span className={styles.statValue}>{detectedScript || '—'}</span>
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
          {isSpeechSupported() && canTransliterate && result.text.trim() && (
            <button
              onClick={() => handleSpeak(result.text, detectedScript)}
              className={styles.copyButton}
              title="Read the recognized text aloud"
            >
              🔊 Speak
            </button>
          )}
        </div>
        <div className={styles.text}>
          {result.text || '(No text detected)'}
        </div>
      </div>

      {/* Transliteration Section */}
      {canTransliterate && (
        <div className={styles.transliterationSection}>
          <h4 className={styles.sectionTitle}>Transliteration</h4>
          
          <div className={styles.translitControls}>
            <label htmlFor="targetScript" className={styles.label}>
              Target Script:
            </label>
            <select
              id="targetScript"
              value={selectedTarget}
              onChange={handleTargetChange}
              className={styles.select}
            >
              <option value="">-- Select Target Script --</option>
              <option value="Devanagari">Devanagari</option>
              {supportedScripts && supportedScripts.map(script => (
                <option key={script} value={script}>
                  {script}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleTransliterateClick}
              disabled={!selectedTarget}
              className={styles.translitButton}
            >
              Transliterate
            </button>
          </div>

          {transliterationResult && (
            <div className={styles.translitResult}>
              <div className={styles.textHeader}>
                <span className={styles.textLabel}>
                  Transliterated Text ({targetScript}):
                </span>
                {!transliterationResult.startsWith('❌') && (
                  <button
                    onClick={handleCopyTranslit}
                    className={styles.copyButton}
                    title="Copy to clipboard"
                  >
                    {copiedTranslit ? '✓ Copied' : 'Copy Text'}
                  </button>
                )}
                {!transliterationResult.startsWith('❌') && isSpeechSupported() && (
                  <button
                    onClick={() => handleSpeak(transliterationResult, targetScript)}
                    className={styles.copyButton}
                    title="Read the transliterated text aloud"
                  >
                    🔊 Speak
                  </button>
                )}
              </div>
              <div className={transliterationResult.startsWith('❌') ? styles.errorText : styles.text}>
                {transliterationResult}
              </div>
              {speechMessage && <p className={styles.warningText}>🔇 {speechMessage}</p>}
              {!transliterationResult.startsWith('❌') && lineTransliterations && result.lines?.length > 0 && (
                <>
                  <p className={styles.textLabel}>Transliteration on the image:</p>
                  <TransliterationOverlay image={ocrImage} lines={result.lines} transliterations={lineTransliterations} />
                </>
              )}
            </div>
          )}
        </div>
      )}

      {!canTransliterate && detectedScript === 'Unknown' && result.text && (
        <div className={styles.transliterationSection}>
          <p className={styles.warningText}>
            ⚠️ Transliteration not available: Source script could not be detected
          </p>
        </div>
      )}
    </div>
  );
}

export default OCRResult;
