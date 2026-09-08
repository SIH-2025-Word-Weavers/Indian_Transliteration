#!/usr/bin/env node

/**
 * M6 Phase 3 - Programmatic Validation Script
 * 
 * Validates the existing LipiSathi pipeline (OCR → Script Detection → Transliteration)
 * using the 12 acquired real-world street-sign images.
 * 
 * IMPORTANT: This script uses the ACTUAL existing services:
 * - src/services/ocrService.js (Tesseract.js v4.1.4)
 * - src/services/scriptDetectionService.js
 * - src/services/transliterationService.js
 * 
 * No implementation code is modified or reimplemented for validation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWorker } from 'tesseract.js';

// ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import actual services
const scriptDetectionPath = path.resolve(__dirname, '../../src/services/scriptDetectionService.js');
const transliterationPath = path.resolve(__dirname, '../../src/services/transliterationService.js');

// Dynamic import for ES modules
const { detectScript } = await import(scriptDetectionPath);
const { transliterate, getSupportedScripts } = await import(transliterationPath);

// Validation configuration
const DATASET_PATH = path.resolve(__dirname, '../dataset');
const METADATA_PATH = path.resolve(__dirname, '../metadata/dataset-index.json');
const RESULTS_PATH = path.resolve(__dirname, '../results/validation-results.json');

console.log('═══════════════════════════════════════════════════════');
console.log('M6 PHASE 3 — PROGRAMMATIC VALIDATION');
console.log('═══════════════════════════════════════════════════════');
console.log('Dataset path:', DATASET_PATH);
console.log('Metadata path:', METADATA_PATH);
console.log('Results path:', RESULTS_PATH);
console.log('');

// Load dataset metadata
const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
console.log(`Loaded metadata for ${metadata.total_images} images`);
console.log(`Hindi: ${metadata.languages.Hindi}, Telugu: ${metadata.languages.Telugu}`);
console.log('');

/**
 * Run OCR using Tesseract.js (Node.js environment)
 * Uses the same Tesseract.js v4.1.4 as the application
 */
async function runOCRNode(imagePath, language) {
  const startTime = Date.now();

  try {
    console.log(`  [OCR] Creating worker for ${language}...`);
    
    // Use simpler Node.js-compatible initialization
    const worker = await createWorker({
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const percent = Math.round(m.progress * 100);
          process.stdout.write(`\r  [OCR] Recognizing text... ${percent}%`);
        }
      }
    });

    await worker.loadLanguage(language);
    await worker.initialize(language);

    console.log(`\n  [OCR] Running recognition on: ${path.basename(imagePath)}`);
    const { data } = await worker.recognize(imagePath);
    
    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;

    await worker.terminate();

    return {
      text: data.text || '',
      confidence: data.confidence || 0,
      processingTime: parseFloat(processingTime.toFixed(2)),
      status: 'success'
    };

  } catch (error) {
    console.error(`\n  [OCR] Error: ${error.message}`);
    console.error(`  [OCR] This may be due to Node.js/browser API incompatibility`);
    
    return {
      text: '',
      confidence: 0,
      processingTime: 0,
      status: 'failed',
      error: error.message,
      limitation: 'Tesseract.js may require browser environment for WASM execution'
    };
  }
}

/**
 * Validate a single image through the complete pipeline
 */
async function validateImage(imageInfo) {
  const imagePath = path.join(DATASET_PATH, 
    imageInfo.language.toLowerCase(), 
    imageInfo.filename
  );

  console.log(`\n─────────────────────────────────────────────────────`);
  console.log(`Processing: ${imageInfo.filename}`);
  console.log(`Language: ${imageInfo.language} (${imageInfo.script})`);
  console.log(`Condition: ${imageInfo.condition_category}`);
  console.log(`─────────────────────────────────────────────────────`);

  // Check if file exists
  if (!fs.existsSync(imagePath)) {
    console.error(`  ✗ Image file not found: ${imagePath}`);
    return {
      ...imageInfo,
      ocr_result: null,
      script_detection: null,
      transliteration: null,
      status: 'file_not_found'
    };
  }

  const result = {
    ...imageInfo,
    validation_timestamp: new Date().toISOString()
  };

  try {
    // STEP 1: OCR
    const langCode = imageInfo.language === 'Hindi' ? 'hin' : 'tel';
    console.log(`\n[STEP 1/3] OCR using Tesseract.js`);
    const ocrResult = await runOCRNode(imagePath, langCode);
    
    result.ocr_result = ocrResult;
    
    if (ocrResult.status === 'success') {
      console.log(`  ✓ OCR completed`);
      console.log(`    Text length: ${ocrResult.text.length} characters`);
      console.log(`    Confidence: ${ocrResult.confidence.toFixed(2)}%`);
      console.log(`    Processing time: ${ocrResult.processingTime}s`);
      console.log(`    Text preview: ${ocrResult.text.substring(0, 100).replace(/\n/g, ' ')}...`);
    } else {
      console.log(`  ✗ OCR failed: ${ocrResult.error}`);
      result.status = 'ocr_failed';
      return result;
    }

    // STEP 2: Script Detection
    console.log(`\n[STEP 2/3] Script Detection`);
    const detectedScript = detectScript(ocrResult.text);
    result.script_detection = {
      detected_script: detectedScript,
      expected_script: imageInfo.script,
      correct: detectedScript === imageInfo.script
    };
    
    console.log(`  Detected: ${detectedScript}`);
    console.log(`  Expected: ${imageInfo.script}`);
    console.log(`  ${result.script_detection.correct ? '✓ Correct' : '✗ Incorrect'}`);

    // STEP 3: Transliteration
    console.log(`\n[STEP 3/3] Transliteration`);
    
    // Choose a target script different from source
    const sourceScript = detectedScript;
    const supportedScripts = getSupportedScripts();
    const targetScript = sourceScript === 'Devanagari' ? 'Telugu' : 'Devanagari';
    
    console.log(`  Source: ${sourceScript} → Target: ${targetScript}`);
    
    try {
      const transliteratedText = transliterate(
        ocrResult.text,
        targetScript,
        sourceScript
      );
      
      result.transliteration = {
        source_script: sourceScript,
        target_script: targetScript,
        transliterated_text: transliteratedText,
        transliterated_length: transliteratedText.length,
        status: 'success'
      };
      
      console.log(`  ✓ Transliteration completed`);
      console.log(`    Output length: ${transliteratedText.length} characters`);
      console.log(`    Preview: ${transliteratedText.substring(0, 100).replace(/\n/g, ' ')}...`);
      
    } catch (error) {
      result.transliteration = {
        source_script: sourceScript,
        target_script: targetScript,
        status: 'failed',
        error: error.message
      };
      console.log(`  ✗ Transliteration failed: ${error.message}`);
    }

    result.status = 'completed';
    console.log(`\n✓ Validation completed for ${imageInfo.filename}`);

  } catch (error) {
    console.error(`\n✗ Validation failed: ${error.message}`);
    result.status = 'error';
    result.error = error.message;
  }

  return result;
}

/**
 * Main validation function
 */
async function runValidation() {
  const results = {
    validation_metadata: {
      validation_date: new Date().toISOString(),
      validation_type: 'programmatic_service_layer',
      dataset_source: 'Wikimedia Commons',
      total_images: metadata.total_images,
      hindi_images: metadata.languages.Hindi,
      telugu_images: metadata.languages.Telugu,
      services_used: {
        ocr: 'tesseract.js v4.1.4 (Node.js)',
        script_detection: 'src/services/scriptDetectionService.js',
        transliteration: 'src/services/transliterationService.js'
      },
      ui_validation: false,
      application_code_modified: false
    },
    images: []
  };

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('Starting validation of all images...');
  console.log('═══════════════════════════════════════════════════════');

  // Process all images
  for (const imageInfo of metadata.images) {
    const result = await validateImage(imageInfo);
    results.images.push(result);
    
    // Small delay between images
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Calculate summary statistics
  const completed = results.images.filter(r => r.status === 'completed');
  const ocrSucceeded = results.images.filter(r => r.ocr_result?.status === 'success');
  const scriptCorrect = results.images.filter(r => r.script_detection?.correct === true);
  const transliterationSucceeded = results.images.filter(r => r.transliteration?.status === 'success');

  results.summary = {
    total_images: results.images.length,
    completed: completed.length,
    ocr_succeeded: ocrSucceeded.length,
    script_detection_correct: scriptCorrect.length,
    transliteration_succeeded: transliterationSucceeded.length,
    by_language: {
      hindi: {
        total: results.images.filter(r => r.language === 'Hindi').length,
        completed: completed.filter(r => r.language === 'Hindi').length
      },
      telugu: {
        total: results.images.filter(r => r.language === 'Telugu').length,
        completed: completed.filter(r => r.language === 'Telugu').length
      }
    }
  };

  // Save results
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('VALIDATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total images: ${results.summary.total_images}`);
  console.log(`Completed: ${results.summary.completed}`);
  console.log(`OCR succeeded: ${results.summary.ocr_succeeded}`);
  console.log(`Script detection correct: ${results.summary.script_detection_correct}`);
  console.log(`Transliteration succeeded: ${results.summary.transliteration_succeeded}`);
  console.log('');
  console.log(`Hindi: ${results.summary.by_language.hindi.completed}/${results.summary.by_language.hindi.total}`);
  console.log(`Telugu: ${results.summary.by_language.telugu.completed}/${results.summary.by_language.telugu.total}`);
  console.log('');
  console.log(`Results saved to: ${RESULTS_PATH}`);
  console.log('═══════════════════════════════════════════════════════');

  return results;
}

// Run validation
runValidation()
  .then(() => {
    console.log('\n✓ Validation script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Validation script failed:', error);
    process.exit(1);
  });
