import { useState } from 'react';
import styles from './ImageUploader.module.css';
import CropSelector from './CropSelector';
import { OCR_LANGUAGES, getLanguage } from '../config/languages';

function ImageUploader({
  onImageSelect,
  onLanguageChange,
  onOCRStart,
  onCropChange,
  crop,
  isProcessing,
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('hin');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    e.target.value = ''; // allow choosing the same file again
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target.result);
      onImageSelect(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    onLanguageChange(lang);
  };

  const language = getLanguage(selectedLanguage);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.uploadSection}>
          <label htmlFor="imageInput" className={styles.uploadLabel}>
            {previewUrl ? 'Change Image' : 'Upload Image'}
          </label>
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.fileInput}
            disabled={isProcessing}
          />
          <label htmlFor="cameraInput" className={styles.cameraLabel}>
            Take Photo
          </label>
          {/* On phones this opens the camera directly; on desktops it falls back to a file picker. */}
          <input
            id="cameraInput"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className={styles.fileInput}
            disabled={isProcessing}
          />
        </div>

        <div className={styles.languageSection}>
          <label htmlFor="languageSelect" className={styles.label}>
            OCR Language:
          </label>
          <select
            id="languageSelect"
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className={styles.select}
            disabled={isProcessing}
          >
            {OCR_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
                {l.status === 'experimental' ? ' - not tested' : ''}
              </option>
            ))}
          </select>
        </div>

        {language?.status === 'experimental' && (
          <p className={styles.notice}>
            The {language.label.split(' (')[0]} model is bundled but was not tested on real signs; results may be poor.
          </p>
        )}
        {language?.code === 'tel' && (
          <p className={styles.notice}>
            Telugu sign reading is unproven: in our tests the model read almost nothing from street signs.
          </p>
        )}

        <button
          onClick={onOCRStart}
          disabled={!previewUrl || isProcessing}
          className={styles.runButton}
        >
          {isProcessing ? 'Processing...' : 'Run OCR'}
        </button>
      </div>

      {previewUrl && (
        <div className={styles.preview}>
          <p className={styles.previewLabel}>Selected Image:</p>
          <CropSelector
            src={previewUrl}
            crop={crop}
            disabled={isProcessing}
            onCropChange={onCropChange}
          />
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
