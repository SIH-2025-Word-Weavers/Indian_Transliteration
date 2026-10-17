# M8: Human Verification of Ground-Truth Transcriptions

**Phase:** M8 Phase 2 - Human Verification  
**Created:** 2026-09-08  
**Status:** ✅ Human verification attested by the project owner (2026-10-17). See `ground-truth.json` (`human_verification`). Reviewer name, fluency and per-record notes were not recorded; the checklist below was not filled in per record.

---

## Purpose

This document guides the human verification process for ground-truth transcriptions of 12 validation images (8 Hindi, 4 Telugu) used in M8 OCR quality evaluation.

**Goal:** Verify that each transcription accurately reflects the target-language text visible in the corresponding image.

**Why This Matters:** Ground-truth accuracy is critical for calculating meaningful Character Error Rate (CER) and Word Error Rate (WER) metrics. Incorrect ground truth will produce misleading OCR quality measurements.

---

## Current Status

**Initial Transcriptions:** ✅ Complete (2026-09-08)  
**Transcription Method:** AI-assisted manual visual inspection  
**Verification Status:** Verified by user attestation (2026-10-17); `verified_text` equals the final AI-reviewed text (no corrections reported)  
**Next Step:** Human verification by fluent Hindi and Telugu speakers

---

## Verification Rules

### Target Text
✅ **Transcribe ONLY target-language script:**
- Hindi images → Devanagari script only
- Telugu images → Telugu script only

❌ **Do NOT transcribe:**
- English text (even if present on bilingual signs)
- Numerals (unless explicitly part of a word)
- Background elements, symbols, decorations

### Accuracy Standards
✅ **Character-for-character accuracy:**
- Preserve exact spelling, including:
  - Vowel marks (matras)
  - Conjuncts (joint characters)
  - Halant/virama
  - Anusvara (ं) and Visarga (ः)
  - Candrabindu (ँ)

✅ **Preserve formatting:**
- Meaningful whitespace (spaces between words)
- Line breaks (use `\n` to indicate multiple lines)
- Punctuation visible in the image

### Illegible Text
- If a character or word is **genuinely unreadable** (blur, damage, obstruction), use: `[ILLEGIBLE]`
- Do NOT guess or infer missing text
- Do NOT use OCR output to fill gaps

### Mixed-Script Signs
- Many signs contain both Hindi/Telugu and English
- Transcribe ONLY the target script
- Document in notes if the sign is bilingual

---

## Verification Process

For each of the 12 images:

1. **Open the actual image file:**
   - Location: `lipisathi-app/validation/dataset/{language}/{filename}`
   - View at full resolution

2. **Review the proposed ground-truth transcription:**
   - See table below for current transcription

3. **Compare character-by-character:**
   - Does the transcription match the visible text?
   - Are all matras, conjuncts, and diacritics correct?
   - Is the whitespace/line break structure preserved?

4. **Record your decision:**
   - **VERIFIED:** Transcription is correct as-is
   - **CORRECTED:** Transcription had errors; corrected version provided
   - **NEEDS_REVIEW:** Uncertain, requires additional review or discussion

5. **Document changes:**
   - If corrected, provide the corrected text
   - Explain what was wrong in the reviewer notes

6. **Sign and date:**
   - Provide reviewer name/role
   - Record verification date

---

## Images for Verification

### Hindi Images (8)

#### Image 1: hindi_01.jpg
- **Image ID:** hindi_01
- **Language:** Hindi
- **Script:** Devanagari
- **Condition:** clear_front_facing
- **Image Path:** `validation/dataset/hindi/hindi_01.jpg`
- **Description:** Bilingual board in Hindi and English, clear text, front-facing

**Proposed Transcription:**
```
कृपया रेलिंग से दूरी बनाये रखें
```

**Transcription Notes:** Clear bilingual sign. Only Hindi text transcribed, English text excluded.

**Verification:**
- [ ] VERIFIED
- [ ] CORRECTED
- [ ] NEEDS_REVIEW

**Corrected Text (if applicable):**
```
[Leave blank if verified; provide corrected text if incorrect]
```

**Reviewer Notes:**
```
[Your observations, corrections, or concerns]
```

**Reviewer:** ______________________  
**Date:** ______________________

---

#### Image 2: hindi_02.jpg
- **Image ID:** hindi_02
- **Language:** Hindi
- **Script:** Devanagari
- **Condition:** road_sign_perspective
- **Image Path:** `validation/dataset/hindi/hindi_02.jpg`
- **Description:** Road sign in Bikaner with Hindi text, slight perspective angle

**Proposed Transcription:**
```
जयपुर
आगरा
श्री गंगानगर
जोधपुर
```

**Transcription Notes:** Road sign with multiple destinations. Only Hindi place names transcribed, English and numerals excluded. Line breaks preserved to indicate separate destinations.

**Verification:**
- [ ] VERIFIED
- [ ] CORRECTED
- [ ] NEEDS_REVIEW

**Corrected Text (if applicable):**
```
[Leave blank if verified; provide corrected text if incorrect]
```

**Reviewer Notes:**
```
[Your observations, corrections, or concerns]
```

**Reviewer:** ______________________  
**Date:** ______________________

---

#### Image 3: hindi_03.jpg
- **Image ID:** hindi_03
- **Language:** Hindi
- **Script:** Devanagari
- **Condition:** railway_station_clear
- **Image Path:** `validation/dataset/hindi/hindi_03.jpg`
- **Description:** Dahisar Railway Station board, clear Hindi text

**Proposed Transcription:**
```
दहिसर
```

**Transcription Notes:** Railway station sign with motion blur but main text is readable. Only Hindi station name transcribed, English excluded.

**Verification:**
- [ ] VERIFIED
- [ ] CORRECTED
- [ ] NEEDS_REVIEW

**Corrected Text (if applicable):**
```
[Leave blank if verified; provide corrected text if incorrect]
```

**Reviewer Notes:**
```
[Your observations, corrections, or concerns]
```

**Reviewer:** ______________________  
**Date:** ______________________

---

#### Image 4: hindi_04.jpg
- **Image ID:** hindi_04
- **Language:** Hindi
- **Script:** Devanagari
- **Condition:** metro_vertical_sign
- **Image Path:** `validation/dataset/hindi/hindi_04.jpg`
- **Description:** Dwarka Mor metro signboard, vertical orientation

**Proposed Transcription:**
```
द्वारका मोड़
```

**Transcription Notes:** Metro station sign. Clear Hindi text. English excluded.

**Verification:**
- [ ] VERIFIED
- [ ] CORRECTED
- [ ] NEEDS_REVIEW

**Corrected Text (if applicable):**
```
[Leave blank if verified; provide corrected text if incorrect]
```

**Reviewer Notes:**
```
[Your observations, corrections, or concerns]
```

**Reviewer:** ______________________  
**Date:** ______________________

---

#### Image 5: hindi_05.jpg
- **Image ID:** hindi_05
- **Language:** Hindi
- **Script:** Devanagari
- **Condition:** railway_wide_angle
- **Image Path:** `validation/dataset/hindi/hindi_05.jpg`
- **Description:** Gurgaon railway station, wide-angle shot

**Proposed Transcription:**
```
गुड़गांव
समुद्र तल से ऊंचाई
```

**Transcription Notes:** Railway station sign. Main station name 'Gurgaon' and elevation text transcribed. English and numerals excluded.

**Verification:**
- [ ] VERIFIED
- [ ] CORRECTED
- [ ] NEEDS_REVIEW

**Corrected Text (if applicable):**
```
[Leave blank if verified; provide corrected text if incorrect]
```

**Reviewer Notes:**
```
[Your observations, corrections, or concerns]
```

**Reviewer:** ______________________  
**Date:** ______________________

---

#### Image 6: hindi_06.jpg
- **Image ID:** hindi_06
- **Language:** Hindi
- **Script:** Devanagari
- **Condition:** junction_signboard
- **Image Path:** `validation/dataset/hindi/hindi_06.jpg`
- **Description:** Indore Junction station board, prominent Hindi text

**Proposed Transcription:**
```
इन्दौर जंक्शन
```

**Transcription Notes:** Railway junction sign. Main Hindi text clearly visible. English excluded. Small text on left side is difficult to read reliably at this resolution.

**Verification:**
- [ ] VERIFIED
- [ ] CORRECTED
- [ ] NEEDS_REVIEW

**Corrected Text (if applicable):**
```
[Leave blank if verified; provide corrected text if incorrect]
```

**Reviewer Notes:**
```
[Your observations, corrections, or concerns]
```

**Reviewer:** ______________________  
**Date:** ______________________

---

#### Image 7: hindi_07.jpg
- **Image ID:** hindi_07
- **Language:** Hindi
- **Script:** Devanagari
- **Condition:** metro_indoor_lighting
- **Image Path:** `validation/dataset/hindi/hindi_07.jpg`
- **Description:** Delhi metro signage, indoor lighting conditions

**Proposed Transcription:**
```
यह परिसर सी सी टी वी कैमरे की निगरानी में हैं।
```

**Transcription Notes:** CCTV surveillance sign. Clear Hindi text. Note: 'सी सी टी वी' is the Hindi rendering of CCTV. English text excluded.

**Verification:**
- [ ] VERIFIED
- [ ] CORRECTED
- [ ] NEEDS_REVIEW

**Corrected Text (if applicable):**
```
[Leave blank if verified; provide corrected text if incorrect]
```

**Reviewer Notes:**
```
[Your observations, corrections, or concerns]
```

**Reviewer:** ______________________  
**Date:** ______________________

---

#### Image 8: hindi_08.jpg
- **Image ID:** hindi_08
- **Language:** Hindi
- **Script:** Devanagari
- **Condition:** street_sign_natural
- **Image Path:** `validation/dataset/hindi/hindi_08.jpg`
- **Description:** Street sign with Hindi text, natural outdoor conditions

**Proposed Transcription:**
```
प्रसव पूर्व भ्रूण का लिंग प्रकट करना कानूनी अपराध है।
```

**Transcription Notes:** Legal notice sign about prenatal sex determination. Clear Hindi text. English excluded.

**Verification:**
- [ ] VERIFIED
- [ ] CORRECTED
- [ ] NEEDS_REVIEW

**Corrected Text (if applicable):**
```
[Leave blank if verified; provide corrected text if incorrect]
```

**Reviewer Notes:**
```
[Your observations, corrections, or concerns]
```

**Reviewer:** ______________________  
**Date:** ______________________

---

### Telugu Images (4)

#### Image 9: telugu_01.jpg
- **Image ID:** telugu_01
- **Language:** Telugu
- **Script:** Telugu
- **Condition:** highway_sign_clear
- **Image Path:** `validation/dataset/telugu/telugu_01.jpg`
- **Description:** Highway sign in Telangana with Telugu text, clear and front-facing

**Proposed Transcription:**
```
హైదరాబాద్
ఉప్పల్
```

**Transcription Notes:** Highway direction sign showing Hyderabad and Uppal. Only Telugu text transcribed, English excluded.

**Verification:**
- [ ] VERIFIED
- [ ] CORRECTED
- [ ] NEEDS_REVIEW

**Corrected Text (if applicable):**
```
[Leave blank if verified; provide corrected text if incorrect]
```

**Reviewer Notes:**
```
[Your observations, corrections, or concerns]
```

**Reviewer:** ______________________  
**Date:** ______________________

---

#### Image 10: telugu_02.jpg
- **Image ID:** telugu_02
- **Language:** Telugu
- **Script:** Telugu
- **Condition:** metro_warning_notice
- **Image Path:** `validation/dataset/telugu/telugu_02.jpg`
- **Description:** Warning notice at Lakdi-ka-pul metro station with Telugu text

**Proposed Transcription:**
```
హెచ్చరిక
ఫ్లాట్ ఫారం ఎమర్జెన్సీ స్టాప్ బటన్ (పి.ఇ.యస్.బి)
యొక్క దుర్వినియోగం నిషేధం
4 సంవత్సరాల కాలం పాటు ఖైదు (లేదా)
రూ. 5000/- జరిమానా (లేదా) రెండు శిక్షలకు అర్హులు
```

**Transcription Notes:** Metro platform emergency stop button warning. Telugu text transcribed from lower yellow section. English excluded.

**Verification:**
- [ ] VERIFIED
- [ ] CORRECTED
- [ ] NEEDS_REVIEW

**Corrected Text (if applicable):**
```
[Leave blank if verified; provide corrected text if incorrect]
```

**Reviewer Notes:**
```
[Your observations, corrections, or concerns]
```

**Reviewer:** ______________________  
**Date:** ______________________

---

#### Image 11: telugu_03.jpg
- **Image ID:** telugu_03
- **Language:** Telugu
- **Script:** Telugu
- **Condition:** metro_information_board
- **Image Path:** `validation/dataset/telugu/telugu_03.jpg`
- **Description:** Information board at Sultan Bazaar metro station with Telugu text

**Proposed Transcription:**
```
వృద్ధుల కోచ్
```

**Transcription Notes:** Senior Citizens Coach sign at metro station. Clear Telugu text. English excluded.

**Verification:**
- [ ] VERIFIED
- [ ] CORRECTED
- [ ] NEEDS_REVIEW

**Corrected Text (if applicable):**
```
[Leave blank if verified; provide corrected text if incorrect]
```

**Reviewer Notes:**
```
[Your observations, corrections, or concerns]
```

**Reviewer:** ______________________  
**Date:** ______________________

---

#### Image 12: telugu_04.jpg
- **Image ID:** telugu_04
- **Language:** Telugu
- **Script:** Telugu
- **Condition:** highway_rural_road
- **Image Path:** `validation/dataset/telugu/telugu_04.jpg`
- **Description:** Highway and rural road sign near Alampur temples, Telugu text

**Proposed Transcription:**
```
ఆలంపూర్
శాంతినగర్
రాయచూర్
```

**Transcription Notes:** Highway direction sign showing three destinations: Alampur, Shantinagar, Raichur. Only Telugu text transcribed, English excluded.

**Verification:**
- [ ] VERIFIED
- [ ] CORRECTED
- [ ] NEEDS_REVIEW

**Corrected Text (if applicable):**
```
[Leave blank if verified; provide corrected text if incorrect]
```

**Reviewer Notes:**
```
[Your observations, corrections, or concerns]
```

**Reviewer:** ______________________  
**Date:** ______________________

---

## After Verification

### Update ground-truth.json

Once human verification is complete for an image:

1. Update the corresponding record in `validation/metadata/ground-truth.json`
2. Set `verification_status` to one of:
   - `"verified"` - Transcription confirmed correct
   - `"corrected"` - Transcription was incorrect and has been corrected
   - `"needs_review"` - Requires additional review
3. If corrected, update `verified_text` with the corrected transcription
4. Record `reviewer` name/role
5. Record `verification_date` (YYYY-MM-DD format)
6. Add any relevant `reviewer_notes`

### Verification Completion Criteria

M8 Phase 2 (Ground Truth) is complete when:

✅ All 12 images verified by fluent Hindi/Telugu speakers  
✅ All `verification_status` fields updated in `ground-truth.json`  
✅ Any corrections applied and documented  
✅ Reviewer information recorded

---

## Important Notes

### Do NOT Use OCR Output for Verification

- The M7 OCR results in `validation/results/ocr-validation-results.json` should **NOT** be used to verify or correct ground truth
- Ground truth must come from **human visual inspection** of the images only
- OCR output is what we will **measure against** ground truth

### Handling Ambiguity

If you encounter:
- **Unclear character:** Mark as `[ILLEGIBLE]` rather than guessing
- **Uncertainty about correct spelling:** Document in reviewer notes and mark as `NEEDS_REVIEW`
- **Multiple valid interpretations:** Document in reviewer notes

### Language Fluency Requirement

- **Hindi images:** Must be verified by someone fluent in Hindi (can read Devanagari script accurately)
- **Telugu images:** Must be verified by someone fluent in Telugu (can read Telugu script accurately)

---

## Contact

For questions about the verification process or M8 experiment design, refer to:
- `validation/M8_EXPERIMENT_PLAN.md`
- `validation/metadata/ground-truth.json`
- `validation/README.md`
