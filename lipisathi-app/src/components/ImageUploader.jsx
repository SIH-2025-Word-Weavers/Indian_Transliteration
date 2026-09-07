import { useState } from 'react';
import styles from './ImageUploader.module.css';

function ImageUploader({ onImageSelect, onLanguageChange, onOCRStart, isProcessing }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('hin');
  const [imageFile, setImageFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target.result);
        setImageFile(event.target.result);
        onImageSelect(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    onLanguageChange(lang);
  };

  const handleRunOCR = () => {
    if (imageFile) {
      onOCRStart();
    }
  };

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
            <option value="hin">Hindi (हिन्दी)</option>
            <option value="tel">Telugu (తెలుగు)</option>
          </select>
        </div>

        <button
          onClick={handleRunOCR}
          disabled={!imageFile || isProcessing}
          className={styles.runButton}
        >
          {isProcessing ? 'Processing...' : 'Run OCR'}
        </button>
      </div>

      {previewUrl && (
        <div className={styles.preview}>
          <p className={styles.previewLabel}>Selected Image:</p>
          <img src={previewUrl} alt="Selected" className={styles.previewImage} />
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
