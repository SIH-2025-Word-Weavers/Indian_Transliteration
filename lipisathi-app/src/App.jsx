import { useState } from 'react'
import styles from './App.module.css'
import ImageUploader from './components/ImageUploader'
import OCRResult from './components/OCRResult'
import { runOCR } from './services/ocrService'

function App() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState('hin')
  const [ocrResult, setOcrResult] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrProgress, setOcrProgress] = useState('')
  const [error, setError] = useState(null)

  const handleImageSelect = (imageData) => {
    setSelectedImage(imageData)
    setOcrResult(null)
    setError(null)
  }

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language)
  }

  const handleOCRStart = async () => {
    if (!selectedImage) {
      setError('Please select an image first')
      return
    }

    setIsProcessing(true)
    setOcrProgress('Starting OCR...')
    setOcrResult(null)
    setError(null)

    try {
      const result = await runOCR(
        selectedImage,
        selectedLanguage,
        (message) => setOcrProgress(message)
      )

      setOcrResult(result)
      setOcrProgress('')
    } catch (err) {
      setError(err.message || 'OCR processing failed')
      setOcrProgress('')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>LipiSathi</h1>
        <p>Transliteration Tool for Street Signs</p>
        <p className={styles.subtitle}>SIH25155 — Team Word Weavers</p>
      </header>

      <main className={styles.main}>
        <div className={styles.status}>
          Phase 1 — Milestone 2: OCR Integration
        </div>

        <ImageUploader
          onImageSelect={handleImageSelect}
          onLanguageChange={handleLanguageChange}
          onOCRStart={handleOCRStart}
          isProcessing={isProcessing}
        />

        {isProcessing && (
          <div className={styles.progress}>
            <div className={styles.spinner}></div>
            <p className={styles.progressText}>{ocrProgress}</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p className={styles.errorText}>❌ {error}</p>
          </div>
        )}

        <OCRResult result={ocrResult} />
      </main>
    </div>
  )
}

export default App
