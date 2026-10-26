import { useState } from 'react'
import styles from './App.module.css'
import ImageUploader from './components/ImageUploader'
import OCRResult from './components/OCRResult'
import { runOCR } from './services/ocrService'
import { detectScript } from './services/scriptDetectionService'
import { transliterate, getSupportedScripts } from './services/transliterationService'
import { cropToDataUrl } from './utils/cropImage'

function App() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [crop, setCrop] = useState(null) // { rect, displaySize } in CSS px of the shown image, or null = whole image
  const [selectedLanguage, setSelectedLanguage] = useState('hin')
  const [ocrResult, setOcrResult] = useState(null)
  const [ocrImage, setOcrImage] = useState(null) // the exact image that was sent to OCR (whole or cropped)
  const [detectedScript, setDetectedScript] = useState(null)
  const [targetScript, setTargetScript] = useState(null)
  const [transliterationResult, setTransliterationResult] = useState(null)
  const [lineTransliterations, setLineTransliterations] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrProgress, setOcrProgress] = useState('')
  const [error, setError] = useState(null)

  const resetResults = () => {
    setOcrResult(null)
    setOcrImage(null)
    setDetectedScript(null)
    setTargetScript(null)
    setTransliterationResult(null)
    setLineTransliterations(null)
    setError(null)
  }

  const handleImageSelect = (imageData) => {
    setSelectedImage(imageData)
    setCrop(null)
    resetResults()
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
    resetResults()

    try {
      let input = selectedImage
      if (crop && crop.rect) {
        setOcrProgress('Cropping selection...')
        input = (await cropToDataUrl(selectedImage, crop.rect, crop.displaySize)).dataUrl
      }

      const result = await runOCR(input, selectedLanguage, (message) => setOcrProgress(message))

      // Detect script from OCR text
      const script = detectScript(result.text)

      setOcrImage(input)
      setOcrResult(result)
      setDetectedScript(script)
      setOcrProgress('')
    } catch (err) {
      setError(err.message || 'OCR processing failed')
      setOcrProgress('')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTransliterate = (selectedTargetScript) => {
    if (!ocrResult || !detectedScript || detectedScript === 'Unknown') {
      return
    }

    setTargetScript(selectedTargetScript)

    try {
      const result = transliterate(ocrResult.text, selectedTargetScript, detectedScript)
      setTransliterationResult(result)
      // Per-line text for the image overlay
      setLineTransliterations(
        (ocrResult.lines || []).map((line) => transliterate(line.text, selectedTargetScript, detectedScript))
      )
    } catch (err) {
      setTransliterationResult(`❌ Transliteration failed: ${err.message}`)
      setLineTransliterations(null)
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
          Capture → Recognize → Transliterate → Display → Speak · works offline
        </div>

        <ImageUploader
          onImageSelect={handleImageSelect}
          onLanguageChange={handleLanguageChange}
          onOCRStart={handleOCRStart}
          onCropChange={setCrop}
          crop={crop}
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

        <OCRResult
          result={ocrResult}
          ocrImage={ocrImage}
          detectedScript={detectedScript}
          targetScript={targetScript}
          transliterationResult={transliterationResult}
          lineTransliterations={lineTransliterations}
          onTransliterate={handleTransliterate}
          supportedScripts={getSupportedScripts()}
        />
      </main>
    </div>
  )
}

export default App
