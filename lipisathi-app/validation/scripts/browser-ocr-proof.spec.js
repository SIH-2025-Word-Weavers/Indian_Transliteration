import { test, expect } from '@playwright/test';
import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load dataset metadata
const metadataPath = resolve(__dirname, '../metadata/dataset-index.json');
const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));

test.describe('M7 Phase 2: Full 12-Image Browser OCR Validation', () => {
  test('should execute OCR on all 12 validation images', async ({ page }) => {
    const allResults = [];
    const validationTimestamp = new Date().toISOString();

    console.log('\n========================================');
    console.log('M7 PHASE 2: 12-IMAGE BROWSER OCR VALIDATION');
    console.log('========================================\n');

    for (const imageMetadata of metadata.images) {
      const result = {
        image_id: imageMetadata.id,
        filename: imageMetadata.filename,
        language: imageMetadata.language,
        expected_script: imageMetadata.script,
        condition_category: imageMetadata.condition_category,
        ocr_status: null,
        ocr_text: null,
        ocr_confidence: null,
        ocr_processing_time_seconds: null,
        detected_script: null,
        script_detection_correct: null,
        transliteration_status: 'not_validated',
        transliteration_output: null,
        error: null,
      };

      try {
        console.log(`\n[${imageMetadata.id}] Starting validation...`);
        console.log(`[${imageMetadata.id}] Language: ${imageMetadata.language}, Expected Script: ${imageMetadata.script}`);

        // Navigate to the application
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Locate the file input
        const fileInput = page.locator('#imageInput');
        await expect(fileInput).toBeAttached();

        // Upload image
        const imagePath = resolve(__dirname, `../dataset/${imageMetadata.language.toLowerCase()}/${imageMetadata.filename}`);
        console.log(`[${imageMetadata.id}] Uploading: ${imagePath}`);
        await fileInput.setInputFiles(imagePath);

        // Wait for preview
        await page.waitForSelector('img[alt="Selected"]', { timeout: 5000 });

        // Select OCR language
        const languageCode = imageMetadata.language === 'Hindi' ? 'hin' : 'tel';
        console.log(`[${imageMetadata.id}] Selecting language: ${languageCode}`);
        const languageSelect = page.locator('#languageSelect');
        await languageSelect.selectOption(languageCode);
        await expect(languageSelect).toHaveValue(languageCode);

        // Click "Run OCR" button
        console.log(`[${imageMetadata.id}] Triggering OCR...`);
        const runButton = page.locator('button:has-text("Run OCR")');
        await expect(runButton).toBeEnabled();
        
        const startTime = Date.now();
        await runButton.click();

        // Wait for OCR to complete
        await page.waitForSelector('text=Extracted Text:', { timeout: 60000 });
        
        const endTime = Date.now();
        const totalTime = ((endTime - startTime) / 1000).toFixed(2);
        console.log(`[${imageMetadata.id}] OCR completed in ${totalTime}s`);

        // Extract OCR text
        const extractedTextLabel = page.locator('span:has-text("Extracted Text:")').first();
        const textParentDiv = extractedTextLabel.locator('../..');
        const textContainer = textParentDiv.locator('div').nth(1);
        const ocrText = await textContainer.textContent();
        result.ocr_text = ocrText.trim();

        // Extract confidence
        const confidenceLabel = page.locator('span:has-text("Confidence:")').first();
        const confidenceValue = confidenceLabel.locator('../span').nth(1);
        const confidenceText = await confidenceValue.textContent();
        const confidenceMatch = confidenceText.match(/[\d.]+/);
        result.ocr_confidence = confidenceMatch ? parseFloat(confidenceMatch[0]) : null;

        // Extract processing time
        const processingTimeLabel = page.locator('span:has-text("Processing Time:")').first();
        const processingTimeValue = processingTimeLabel.locator('../span').nth(1);
        const processingTimeText = await processingTimeValue.textContent();
        const timeMatch = processingTimeText.match(/[\d.]+/);
        result.ocr_processing_time_seconds = timeMatch ? parseFloat(timeMatch[0]) : null;

        // Extract detected script
        const detectedScriptLabel = page.locator('span:has-text("Detected Script:")').first();
        const detectedScriptValue = detectedScriptLabel.locator('../span').nth(1);
        const detectedScriptText = await detectedScriptValue.textContent();
        result.detected_script = detectedScriptText.trim();

        // Check script detection correctness
        result.script_detection_correct = result.detected_script === imageMetadata.script;

        // Verify OCR succeeded
        if (!result.ocr_text || result.ocr_text === '(No text detected)') {
          throw new Error('OCR did not extract any text');
        }

        result.ocr_status = 'success';
        console.log(`[${imageMetadata.id}] ✓ OCR successful`);
        console.log(`[${imageMetadata.id}]   Text: "${result.ocr_text.substring(0, 80)}..."`);
        console.log(`[${imageMetadata.id}]   Confidence: ${result.ocr_confidence}%`);
        console.log(`[${imageMetadata.id}]   Processing Time: ${result.ocr_processing_time_seconds}s`);
        console.log(`[${imageMetadata.id}]   Detected Script: ${result.detected_script} (Expected: ${imageMetadata.script})`);
        console.log(`[${imageMetadata.id}]   Script Detection: ${result.script_detection_correct ? '✓ Correct' : '✗ Incorrect'}`);

      } catch (error) {
        result.ocr_status = 'failed';
        result.error = error.message;
        console.error(`[${imageMetadata.id}] ✗ OCR failed: ${error.message}`);
      }

      allResults.push(result);
    }

    // Save results
    const resultsData = {
      validation_phase: 'M7 Phase 2',
      validation_timestamp: validationTimestamp,
      dataset: {
        total_images: metadata.total_images,
        hindi_images: metadata.languages.Hindi,
        telugu_images: metadata.languages.Telugu,
      },
      results: allResults,
    };

    const resultPath = resolve(__dirname, '../results/ocr-validation-results.json');
    writeFileSync(resultPath, JSON.stringify(resultsData, null, 2));
    console.log(`\n[Validation] Results saved to: ${resultPath}`);

    // Calculate summary statistics
    const successCount = allResults.filter(r => r.ocr_status === 'success').length;
    const failureCount = allResults.filter(r => r.ocr_status === 'failed').length;
    const scriptCorrectCount = allResults.filter(r => r.script_detection_correct === true).length;
    const scriptIncorrectCount = allResults.filter(r => r.script_detection_correct === false).length;

    const successfulResults = allResults.filter(r => r.ocr_status === 'success');
    const confidences = successfulResults.map(r => r.ocr_confidence).filter(c => c !== null);
    const processingTimes = successfulResults.map(r => r.ocr_processing_time_seconds).filter(t => t !== null);

    console.log('\n========================================');
    console.log('VALIDATION SUMMARY');
    console.log('========================================');
    console.log(`Total Images: ${allResults.length}`);
    console.log(`OCR Successes: ${successCount}`);
    console.log(`OCR Failures: ${failureCount}`);
    console.log(`Script Detection Correct: ${scriptCorrectCount}`);
    console.log(`Script Detection Incorrect: ${scriptIncorrectCount}`);
    
    if (confidences.length > 0) {
      const meanConf = (confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(1);
      const minConf = Math.min(...confidences).toFixed(1);
      const maxConf = Math.max(...confidences).toFixed(1);
      console.log(`\nTesseract OCR Confidence Statistics:`);
      console.log(`  Mean: ${meanConf}%`);
      console.log(`  Min: ${minConf}%`);
      console.log(`  Max: ${maxConf}%`);
    }

    if (processingTimes.length > 0) {
      const meanTime = (processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length).toFixed(2);
      const minTime = Math.min(...processingTimes).toFixed(2);
      const maxTime = Math.max(...processingTimes).toFixed(2);
      console.log(`\nProcessing Time Statistics:`);
      console.log(`  Mean: ${meanTime}s`);
      console.log(`  Min: ${minTime}s`);
      console.log(`  Max: ${maxTime}s`);
    }
    console.log('========================================\n');

    // Verify all 12 images were processed
    expect(allResults.length).toBe(12);
    
    // At least some images should succeed (don't fail the test if some OCR fails)
    expect(successCount).toBeGreaterThan(0);
  });
});
