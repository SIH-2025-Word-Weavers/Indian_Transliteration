import { createWorker } from 'tesseract.js';

/**
 * Run OCR on an image file using Tesseract.js v4.1.4
 * 
 * @param {File|string} imageFile - Image file or data URL
 * @param {string} language - Language code ('hin' or 'tel')
 * @param {function} onProgress - Progress callback (message: string)
 * @returns {Promise<{text: string, confidence: number, processingTime: number}>}
 */
export async function runOCR(imageFile, language, onProgress = () => {}) {
  let worker = null;
  const startTime = performance.now();

  console.log('═══════════════════════════════════════════════════════');
  console.log('[LipiSathi OCR] OCR PIPELINE STARTED');
  console.log('[LipiSathi OCR] Language:', language);
  console.log('[LipiSathi OCR] Image type:', typeof imageFile);
  console.log('[LipiSathi OCR] Image instanceof Blob:', imageFile instanceof Blob);
  console.log('[LipiSathi OCR] Image instanceof File:', imageFile instanceof File);
  if (typeof imageFile === 'string') {
    console.log('[LipiSathi OCR] Image data URL length:', imageFile.length);
    console.log('[LipiSathi OCR] Image data URL prefix:', imageFile.substring(0, 50));
  }
  console.log('═══════════════════════════════════════════════════════');

  try {
    // STEP 1: Create Worker
    console.log('[LipiSathi OCR] STEP 1: createWorker() START');
    console.log('[LipiSathi OCR] - Using default CDN langPath (tessdata.projectnaptha.com/4.0.0)');
    onProgress('Initializing Tesseract worker...');

    worker = await createWorker({
      // Use CDN traineddata (guaranteed compatible with core version v4.0.4)
      // langPath defaults to: 'https://tessdata.projectnaptha.com/4.0.0'
      errorHandler: (err) => {
        console.error('[Tesseract ERROR HANDLER]', err);
      },
      logger: (m) => {
        console.log('[Tesseract Logger]', m);
        // Handle progress messages from Tesseract.js
        if (m.status === 'loading tesseract core') {
          onProgress('Loading Tesseract core...');
        } else if (m.status === 'initializing tesseract') {
          onProgress('Initializing Tesseract...');
        } else if (m.status === 'loading language traineddata') {
          const langName = language === 'hin' ? 'Hindi' : 'Telugu';
          onProgress(`Loading ${langName} model...`);
        } else if (m.status === 'initializing api') {
          onProgress('Initializing OCR API...');
        } else if (m.status === 'recognizing text') {
          const percent = Math.round(m.progress * 100);
          onProgress(`Recognizing text... ${percent}%`);
        }
      }
    });

    console.log('[LipiSathi OCR] STEP 1: createWorker() SUCCESS');
    console.log('[LipiSathi OCR] - Worker object exists:', !!worker);
    console.log('[LipiSathi OCR] - Worker type:', typeof worker);

    // STEP 2: Load Language
    console.log('[LipiSathi OCR] STEP 2: loadLanguage() START');
    console.log('[LipiSathi OCR] - Language code:', language);
    console.log('[LipiSathi OCR] - Expected model: /tessdata/' + language + '.traineddata');
    onProgress('Loading language model...');
    
    await worker.loadLanguage(language);
    
    console.log('[LipiSathi OCR] STEP 2: loadLanguage() SUCCESS');

    // STEP 3: Initialize
    console.log('[LipiSathi OCR] STEP 3: initialize() START');
    console.log('[LipiSathi OCR] - Language code:', language);
    onProgress('Initializing OCR...');
    
    await worker.initialize(language);
    
    console.log('[LipiSathi OCR] STEP 3: initialize() SUCCESS');

    // STEP 4: Recognize
    console.log('[LipiSathi OCR] STEP 4: recognize() START');
    console.log('[LipiSathi OCR] - Image input exists:', !!imageFile);
    console.log('[LipiSathi OCR] - Image input type:', typeof imageFile);
    onProgress('Starting OCR recognition...');

    const { data } = await worker.recognize(imageFile);

    console.log('[LipiSathi OCR] STEP 4: recognize() SUCCESS');
    console.log('[LipiSathi OCR] - Result data exists:', !!data);
    console.log('[LipiSathi OCR] - Text exists:', !!data?.text);
    console.log('[LipiSathi OCR] - Text length:', data?.text?.length || 0);
    console.log('[LipiSathi OCR] - Text preview:', data?.text?.substring(0, 100) || '(empty)');
    console.log('[LipiSathi OCR] - Confidence:', data?.confidence || 0);

    const endTime = performance.now();
    const processingTime = (endTime - startTime) / 1000;

    console.log('[LipiSathi OCR] - Processing time:', processingTime.toFixed(2), 'seconds');

    // STEP 5: Cleanup
    console.log('[LipiSathi OCR] STEP 5: terminate() START');
    await worker.terminate();
    console.log('[LipiSathi OCR] STEP 5: terminate() SUCCESS');

    console.log('═══════════════════════════════════════════════════════');
    console.log('[LipiSathi OCR] OCR PIPELINE COMPLETED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════');

    return {
      text: data.text || '',
      confidence: data.confidence || 0,
      processingTime: parseFloat(processingTime.toFixed(2))
    };

  } catch (error) {
    console.error('═══════════════════════════════════════════════════════');
    console.error('[LipiSathi OCR] OCR PIPELINE FAILED');
    console.error('[LipiSathi OCR] Error object:', error);
    console.error('[LipiSathi OCR] Error name:', error?.name);
    console.error('[LipiSathi OCR] Error message:', error?.message);
    console.error('[LipiSathi OCR] Error stack:', error?.stack);
    console.error('[LipiSathi OCR] Error string:', String(error));
    console.error('═══════════════════════════════════════════════════════');

    // Ensure worker is terminated even on error
    if (worker) {
      try {
        console.log('[LipiSathi OCR] Attempting worker cleanup after error...');
        await worker.terminate();
        console.log('[LipiSathi OCR] Worker cleanup successful');
      } catch (terminateError) {
        console.error('[LipiSathi OCR] Worker cleanup failed:', terminateError);
      }
    }

    // Provide meaningful error message
    const errorMessage = 
      error?.message || 
      error?.toString?.() || 
      String(error) ||
      'Unknown OCR error (no error details available)';
    
    throw new Error(`OCR failed: ${errorMessage}`);
  }
}

/**
 * Get display name for language code
 */
export function getLanguageName(langCode) {
  const names = {
    hin: 'Hindi',
    tel: 'Telugu'
  };
  return names[langCode] || langCode;
}
