# SIH25155 — FORENSIC AUDIT & RECOVERY ANALYSIS

**Team:** Word Weavers  
**Problem Statement:** SIH25155 — Transliteration Tool for Street Signs  
**Project Name:** LipiSathi: Internet Free Transliteration  
**Repository:** `Indian_Transliteration`  
**Audit Date:** September 7, 2026  
**Auditor:** AI Technical Analyst  
**Status:** AUDIT ONLY — NO MODIFICATIONS MADE

---

## 1. EXECUTIVE SUMMARY

**Word Weavers** developed **LipiSathi**, a proposed offline transliteration tool for Indian street signs, for the Smart India Hackathon 2025 (SIH25155). The team reached the **Top-7/waitlist stage** during the internal hackathon.

### Current Reality (Evidence-Based)

**What Actually Exists:**
- ✅ Working Python transliteration notebook (text-to-text, hub-and-spoke architecture)
- ✅ Comprehensive research documentation
- ✅ Official SIH presentation (PDF, 3.3 MB)
- ✅ Well-documented project vision and roadmap

**What Is Missing:**
- ❌ OCR implementation
- ❌ Mobile application source code (Flutter/Dart)
- ❌ Camera integration
- ❌ Text-to-speech (TTS)
- ❌ Image preprocessing pipeline
- ❌ Trained OCR models
- ❌ Complete end-to-end system
- ❌ APK file in repository (external Google Drive link only)

### Project Maturity: **CONCEPT + CORE PROTOTYPE (20-25%)**

The project successfully demonstrates **the transliteration logic** but lacks the complete application pipeline (OCR → Transliteration → Display/TTS) that was proposed.

---

## 2. ORIGINAL WORD WEAVERS VISION

### Problem Statement
**People cannot read local scripts on signboards when traveling across India.**

Example:
- A Telugu speaker from Andhra Pradesh visits Punjab
- Sees signboard: **"ਲੁਧਿਆਣਾ"** (Gurumukhi script)
- Cannot read it → navigation difficulty

### Proposed Solution: LipiSathi

**Five-Step Technical Approach:**

1. **STEP 01: Capture** — Camera/Snapshot with auto-crop and perspective correction
2. **STEP 02: Recognize** — OCR + Script Identification
3. **STEP 03: Transliterate** — Phonetic-preserving script conversion
4. **STEP 04: Display** — Overlay or full-text render with copy/share
5. **STEP 05: Speak** — Text-to-speech pronunciation

### Target Users
- Travelers across Indian states
- Pilgrims visiting religious sites
- Students studying in different regions
- General public navigating unfamiliar areas

### Key Innovation
**Offline-first** approach — no internet required, mobile-ready, preserves pronunciation (transliteration, NOT translation)

---

## 3. WHAT THE REPOSITORY CONTAINS

### File Structure
```
Indian_Transliteration/
├── README.md                                    # Comprehensive project overview
├── LICENSE.md                                   # MIT License
├── SIH25Team8058920250930052829.pdf            # Official SIH presentation (3.3 MB)
├── SIH_2025_Word_Weavers_Transliteration.md    # Research notes (8451 lines)
├── transliteration_algorithm.ipynb             # Core implementation (426 lines)
└── Docs&APKs/
    └── README.md                                # Google Drive link to APK
```

### Detailed File Analysis

#### A. `transliteration_algorithm.ipynb` — ✅ WORKING IMPLEMENTATION

**What It Does:**
- **Script Detection:** Unicode range-based automatic detection
- **Hub-and-Spoke Architecture:** All scripts → Devanagari → Target script
- **Supported Scripts:** Telugu, Devanagari, Tamil, Kannada, Malayalam, Gurmukhi, Bengali, Gujarati, Odia
- **Exception Dictionary:** Handles loanwords (e.g., "LipiSathi", "Google")
- **Language Rules:** Schwa deletion for Hindi
- **Interactive Demo:** Terminal-based transliteration tool

**Example Output:**
```python
Input:  నమస్కారం (Telugu)
Output: नमस्कारं (Devanagari with Hindi rules)

Input:  मेरा नाम मोहन है (Devanagari)
Output: మేరా నామ మోహన హై (Telugu)
```

**Technical Quality:** ✅ **Solid implementation, properly structured, working code**

**Limitation:** Text-to-text only. No OCR, no images, no camera, no mobile integration.

---

#### B. `SIH_2025_Word_Weavers_Transliteration.md` — 📚 RESEARCH NOTES

**Content Type:** ChatGPT/AI conversation dumps + research + terminal logs

**What It Contains:**
1. **Problem explanation and examples**
2. **Team member details**
3. **ChatGPT conversations** about OCR implementation
4. **Terminal command logs** from attempting to set up IndicSTR12 (OCR research project)
5. **CRNN training logs** — showing training attempts with **0.0000% accuracy** (failed attempts)
6. **Research references:**
   - IndicSTR12 (GitHub + dataset)
   - Academic papers (OCR, transliteration)
   - Government data sources (OGD)
   - Kaggle datasets (Indian signboards)
7. **Documentation guides** for different OCR models (CRNN, STAR-Net, PARSeq)
8. **Workflow instructions** (never fully executed)

**Technical Quality:** 📚 **Comprehensive research, but no working OCR implementation**

**Key Finding:** The CRNN training logs show:
```
✓ Val Loss: 0.2815, Accuracy: 0.0000, CRR: 0.0000
🌟 New best model saved! Accuracy: 0.0000
```
This indicates **OCR training was attempted but did not succeed**.

---

#### C. `README.md` — 📋 PROJECT DOCUMENTATION

**Quality:** ✅ **Professional, well-structured, honest about current state**

**Key Statement:**
> "Note: Current repository implementation is notebook-first transliteration logic.  
> OCR/camera overlay/TTS are part of the broader SIH solution direction."

**Roadmap (Honest Assessment):**
- [ ] Strengthen script mapping quality
- [ ] Package notebook into modular Python
- [ ] **Integrate OCR + script-ID pipeline for camera input**
- [ ] **Add UI rendering options**
- [ ] **Integrate text-to-speech**
- [ ] **Prepare mobile-first deployment path**

✅ **The README clearly indicates these are future goals, not current implementations.**

---

#### D. `SIH25Team8058920250930052829.pdf` — 📊 PRESENTATION

**Size:** 3.3 MB  
**Created:** March 1, 2026 (earliest commit)

**Content (from PDF analysis):**
- Problem statement explanation
- 5-step technical approach (Capture → Recognize → Transliterate → Display → Speak)
- Technology stack diagrams
- Feasibility justification
- Impact and benefits
- Research references

**Status:** ✅ **Professional presentation of the proposed solution**

---

#### E. `Docs&APKs/README.md` — ⚠️ EXTERNAL REFERENCE ONLY

**Content:**
```markdown
## Google Drive
Project Files & APK:  
https://drive.google.com/drive/folders/1Si_GzsD3hwRHa9RlDLQtPJjII9nSx_9N?usp=sharing
```

**Critical Finding:** ❌ **NO APK FILE EXISTS IN THE GITHUB REPOSITORY**

The APK is hosted externally on Google Drive. Without access to verify it, we cannot determine:
- What the APK actually contains
- Whether it's a working application or a prototype/mock
- What functionality is actually implemented
- Whether Flutter source code was actually written

---

## 4. GIT HISTORY ANALYSIS

### Complete Development Timeline

| Date | Commit | Description | Significance |
|------|--------|-------------|--------------|
| **Mar 1, 2026** | `fd5a35a` | Initial commit | Repository creation |
| **Mar 1, 2026** | `9a65fee` | Add files via upload | **PDF presentation uploaded** |
| **May 19, 2026** | `73f20da` | Add MIT License | License added |
| **May 20, 2026** | `b40f284` | Add files via upload | **Transliteration notebook uploaded** |
| **May 20, 2026** | `99888c2` | Add files via upload | **Research markdown uploaded (8451 lines)** |
| **May 20, 2026** | `b59c3de` | Copilot: README rewrite | Copilot-generated README improvements |
| **May 20, 2026** | `8de0f96` | Copilot: Revamp README | More Copilot improvements |
| **May 20, 2026** | `ab64609` | Copilot: Add profile README | Profile documentation |
| **May 20, 2026** | `bcc6717` | Move README to Docs&APKs | **Docs&APKs directory created** |
| **Sep 7, 2026** | `eedea75` | Update README.md | **Latest commit (today)** |

### Key Observations

1. **Major Implementation Window:** May 20, 2026 (single day)
   - Notebook and research markdown uploaded together
   - This appears to be a consolidation of prior work

2. **No Flutter Source Code Was Ever Committed**
   - Git history shows only 7 files were ever added
   - No `lib/`, `android/`, `ios/`, `pubspec.yaml`, or any Flutter artifacts
   - The Flutter source code either:
     - Never existed in this repository
     - Exists in a separate (missing) repository
     - Was never version-controlled

3. **No Continuous Development**
   - Large gaps between commits (Mar 1 → May 19 → May 20 → Sep 7)
   - No iterative commits showing gradual progress
   - Uploads are "bulk adds" rather than feature development

4. **Recent Activity is Documentation Only**
   - Since May 20, 2026: Only README updates
   - No code changes since May 20
   - Sep 7, 2026 update: Minor README edit only

---

## 5. PPT ANALYSIS

**File:** `SIH25Team8058920250930052829.pdf` (3.3 MB)

### What the PPT Claimed

Based on PDF content analysis:

**Architecture:**
```
Image → OCR + Script ID → Transliteration → UI Render → TTS
```

**Technology Stack:**
- **App/UI Framework:** (Flutter mentioned in research notes)
- **Mobile Optimization:** Android/iOS compatibility
- **AI Models:** Transformers, Seq2Seq, Neural Networks
- **Backend Development:** API support
- **Image Processing:** OCR, Text Detection, Pre-processing

**Feasibility Claims:**
1. ✅ Research Availability — OCR and transliteration research exists
2. ✅ Lightweight Deployment — On-device processing
3. ✅ Mobile Integration — Android and iOS
4. ✅ Technology Availability — Proven technologies
5. ✅ Cost Efficiency — Low compute, mobile-friendly
6. ✅ Real-time Processing — Less than 1 second
7. ✅ Scalability — Cloud-ready and expandable

---

## 6. PPT vs REPOSITORY vs APK

| Component | PPT Proposal | Repository Evidence | APK Status | Current Status |
|-----------|--------------|---------------------|------------|----------------|
| **Transliteration Engine** | ✅ Proposed | ✅ **COMPLETE** (notebook) | ❓ Unknown | ✅ **WORKING** |
| **Script Detection** | ✅ Proposed | ✅ **COMPLETE** (Unicode-based) | ❓ Unknown | ✅ **WORKING** |
| **Hub-Spoke Architecture** | ✅ Proposed | ✅ **COMPLETE** (via Devanagari) | ❓ Unknown | ✅ **WORKING** |
| **OCR / Text Recognition** | ✅ Proposed | ❌ **MISSING** (attempted, failed) | ❓ Unknown | ❌ **MISSING** |
| **Camera Integration** | ✅ Proposed | ❌ **MISSING** | ❓ Unknown | ❌ **MISSING** |
| **Image Preprocessing** | ✅ Proposed | ❌ **MISSING** | ❓ Unknown | ❌ **MISSING** |
| **Mobile UI** | ✅ Proposed | ❌ **MISSING** (no source) | ❓ Unknown | ❌ **MISSING** |
| **Text-to-Speech** | ✅ Proposed | ❌ **MISSING** | ❓ Unknown | ❌ **MISSING** |
| **Flutter Source Code** | ✅ Implied | ❌ **MISSING** | ❓ Unknown | ❌ **MISSING** |
| **APK Build** | ✅ Implied | ❌ Not in repo | ⚠️ **External link only** | ❓ **UNKNOWN** |
| **Trained Models** | ✅ Proposed | ❌ **MISSING** | ❓ Unknown | ❌ **MISSING** |
| **Datasets** | ✅ Referenced | ❌ **MISSING** | ❓ Unknown | ❌ **MISSING** |
| **Backend/API** | ✅ Proposed | ❌ **MISSING** | ❓ Unknown | ❌ **MISSING** |

**Legend:**
- ✅ = Complete and working
- ❌ = Missing or non-functional
- ❓ = Cannot verify without access
- ⚠️ = Exists but not accessible for audit

---

## 7. RECOVERABLE ASSETS

### A. DIRECTLY RECOVERABLE (Existing & Working)

1. **Transliteration Logic** ✅
   - Hub-and-spoke architecture
   - 9 Indian script mappings
   - Script detection
   - Exception dictionary
   - Language-specific rules
   - **Reusability:** 100% — can be directly integrated into new system

2. **Research Knowledge** ✅
   - IndicSTR12 references
   - OCR model options (CRNN, STAR-Net, PARSeq)
   - Dataset sources
   - Academic paper references
   - **Reusability:** High — guides OCR implementation

3. **Project Vision & UX Flow** ✅
   - 5-step user experience defined
   - Use cases documented
   - Target users identified
   - **Reusability:** 100% — clear product requirements

4. **Branding** ✅
   - Name: "LipiSathi"
   - Team: "Word Weavers"
   - Clear positioning
   - **Reusability:** 100% — can continue with same identity

---

### B. PARTIALLY RECOVERABLE (Needs Reconstruction)

1. **OCR Training Attempts** 🟡
   - Training scripts were attempted (IndicSTR12)
   - Failed to achieve accuracy
   - **Reusability:** 30% — lessons learned, but no working model
   - **Action Required:** Start OCR training from scratch with better approach

2. **APK/Mobile App** 🟡
   - APK exists on Google Drive (unverified)
   - No source code in repository
   - **Reusability:** 10-20% — can reverse-engineer UI/UX, but cannot modify
   - **Action Required:** Rebuild mobile application from scratch

---

### C. NOT RECOVERABLE (Must Be Built)

1. **OCR Implementation** ❌
   - No working OCR pipeline
   - Training attempts failed
   - **Must build:** Complete OCR system for Indic scripts

2. **Camera Integration** ❌
   - No code exists
   - **Must build:** Camera capture, auto-crop, perspective correction

3. **Image Preprocessing** ❌
   - No pipeline exists
   - **Must build:** Image enhancement, binarization, denoising

4. **Mobile Application Source Code** ❌
   - Flutter/Dart source missing
   - **Must build:** Complete mobile application

5. **Text-to-Speech** ❌
   - No TTS integration
   - **Must build:** TTS for Indic scripts

6. **UI/UX Implementation** ❌
   - No interface code
   - **Must build:** Camera view, overlay, result display

7. **Backend/API** ❌
   - No backend exists
   - **Must build:** If cloud processing is needed

---

## 8. MISSING COMPONENTS

### Critical Missing Pieces (Required for MVP)

| Component | Current Status | Effort to Build | Priority |
|-----------|----------------|-----------------|----------|
| **OCR Engine** | ❌ Missing | High (4-6 weeks) | **P0** |
| **Script Identification** | ⚠️ Post-OCR detection missing | Medium (1-2 weeks) | **P0** |
| **Image Preprocessing** | ❌ Missing | Medium (2-3 weeks) | **P0** |
| **Mobile UI** | ❌ Missing | High (4-5 weeks) | **P0** |
| **Camera Integration** | ❌ Missing | Low (1 week) | **P0** |
| **Integration Layer** | ❌ Missing | Medium (2-3 weeks) | **P0** |
| **Text-to-Speech** | ❌ Missing | Medium (1-2 weeks) | **P1** |
| **Overlay Rendering** | ❌ Missing | Medium (2 weeks) | **P1** |
| **Trained Models** | ❌ Missing | High (3-4 weeks) | **P0** |
| **Testing & Validation** | ❌ Missing | Medium (2 weeks) | **P1** |

---

## 9. EXACT POINT WHERE PROJECT STOPPED

```
[Idea & Research] ───✅───> [Architecture Design] ───✅───> [Core Logic Prototype] ───✅───> [PPT/Presentation]
                                                                     │
                                                                     └───❌───> [OCR Implementation]
                                                                     └───❌───> [Mobile App Development]
                                                                     └───❌───> [Complete Integration]
                                                                     └───❓───> [APK Build (external)]
```

### Development Stage Analysis

| Stage | Status | Evidence |
|-------|--------|----------|
| **1. Problem Identification** | ✅ **COMPLETE** | Clear problem statement |
| **2. Research** | ✅ **COMPLETE** | Comprehensive research notes |
| **3. Solution Architecture** | ✅ **COMPLETE** | 5-step approach defined |
| **4. Transliteration Core** | ✅ **COMPLETE** | Working Python notebook |
| **5. Presentation/Pitch** | ✅ **COMPLETE** | Professional PDF |
| **6. OCR Research** | 🟡 **PARTIAL** | Researched but training failed |
| **7. OCR Implementation** | ❌ **MISSING** | No working OCR |
| **8. Mobile UI/UX** | ❓ **UNKNOWN** | APK exists externally, no source |
| **9. Camera Integration** | ❌ **MISSING** | Not implemented |
| **10. TTS Integration** | ❌ **MISSING** | Not implemented |
| **11. Complete System** | ❌ **MISSING** | No end-to-end pipeline |
| **12. Testing** | ❌ **MISSING** | No evidence of testing |
| **13. Deployment** | ❌ **MISSING** | Not production-ready |

### Where Did Word Weavers Stop?

**ANSWER:** After completing the **core transliteration logic** and **presentation**, development stopped before:
- Implementing working OCR
- Building complete mobile application with source control
- Integrating all components into end-to-end system

**Last Meaningful Implementation:** May 20, 2026 (transliteration notebook)

**Estimated Project Completion:** **20-25%**

---

## 10. CURRENT PROJECT MATURITY

### Honest Classification

**Category:** **PROOF-OF-CONCEPT PROTOTYPE**

**What This Means:**
- ✅ Core idea validated (transliteration logic works)
- ✅ Technical feasibility demonstrated (for transliteration component)
- ❌ Not a working end-to-end solution
- ❌ Not production-ready
- ❌ Cannot be deployed as-is

### Comparison to SIH Expectations

**What SIH25155 Expected:**
> "Develop an app that can transliterate any script of Bharat into another script"

**What Word Weavers Delivered:**
- ✅ Transliteration engine (text-to-text)
- ❌ Complete "app" (OCR + camera + UI + TTS)

**Gap:** The **application shell** (camera, OCR, UI, integration) is missing.

---

## 11. MINIMUM VIABLE SOLUTION (MVP)

To create a **convincing demonstration** of the SIH25155 solution:

### MVP Feature List

1. **Image to Text (OCR)** — P0
   - Upload or capture image of signboard
   - Extract text using Indic OCR
   - Detect source script

2. **Text Transliteration** — P0 (✅ Already exists)
   - Convert extracted text to user's chosen script
   - Use existing hub-and-spoke logic

3. **Display Result** — P0
   - Show transliterated text clearly
   - Copy-to-clipboard functionality

4. **Basic UI** — P0
   - Image upload button OR camera capture
   - Script selection dropdown
   - Result display area

### MVP Does NOT Need:
- ❌ AR overlay (nice-to-have)
- ❌ Advanced image preprocessing
- ❌ Text-to-speech (P1, not P0)
- ❌ Offline model caching
- ❌ Complex UI animations
- ❌ Multi-language UI

**Estimated MVP Timeline:** 8-10 weeks (if focused)

---

## 12. COMPLETE SOLUTION

For a **production-ready** SIH25155 solution:

### Phase 1: Core MVP (8-10 weeks)
- OCR implementation
- Basic mobile UI
- Transliteration integration
- Camera capture

### Phase 2: Enhancement (4-6 weeks)
- Image preprocessing (auto-crop, perspective correction)
- Improved OCR accuracy
- Better UI/UX
- Error handling

### Phase 3: Advanced Features (4-6 weeks)
- Text-to-speech
- Offline model optimization
- Multiple script support refinement
- AR overlay (optional)

### Phase 4: Production (2-3 weeks)
- Testing and validation
- Performance optimization
- App store deployment
- Documentation

**Total Estimated Timeline:** 18-25 weeks (4-6 months)

---

## 13. RECOMMENDED TECHNOLOGY STACK

### Option A: Modern Python + Mobile (Recommended)

**Backend/Processing:**
- **OCR:** PaddleOCR (best for Indic scripts, actively maintained)
  - Alternative: Tesseract with Indic language packs
  - Alternative: Google ML Kit (mobile-native)
- **Transliteration:** Existing notebook logic (port to Python module)
- **Image Processing:** OpenCV (perspective correction, preprocessing)

**Mobile Frontend:**
- **Framework:** Flutter (cross-platform, good camera support)
  - Alternative: React Native
  - Alternative: Native Android (Kotlin)
- **Camera:** flutter_camera / image_picker
- **TTS:** flutter_tts

**Architecture:**
```
Mobile App (Flutter)
    ↓
[Camera] → [Capture Image]
    ↓
[Preprocessing] → OpenCV (local)
    ↓
[OCR] → PaddleOCR (local or API)
    ↓
[Script Detection] → Unicode analysis
    ↓
[Transliteration] → Python logic (API or embedded)
    ↓
[Display] → Flutter UI
    ↓
[TTS] → flutter_tts (optional)
```

### Why This Stack?

1. **PaddleOCR:**
   - ✅ Excellent Indic language support
   - ✅ Actively maintained
   - ✅ Mobile-optimized models available
   - ✅ Better than Tesseract for complex scripts

2. **Flutter:**
   - ✅ Single codebase for Android + iOS
   - ✅ Good camera integration
   - ✅ Fast development
   - ✅ Team may have prior experience (APK suggests Flutter)

3. **Python Backend (Optional):**
   - ✅ Existing transliteration logic is in Python
   - ✅ Easy to wrap as FastAPI endpoint
   - ✅ Can run locally or on cloud

---

### Option B: Fully On-Device Mobile

**Advantages:**
- ✅ True offline operation
- ✅ No API latency
- ✅ Privacy-friendly
- ✅ Lower cost

**Implementation:**
- **OCR:** Google ML Kit Text Recognition (on-device)
- **Transliteration:** Port Python logic to Dart or use FFI
- **Framework:** Flutter

**Trade-off:** Lower OCR accuracy for complex Indic scripts compared to PaddleOCR

---

### Option C: Web-First MVP (Fastest Prototype)

**Quick Demonstration:**
- **Frontend:** React + HTML5 Camera API
- **Backend:** Python (FastAPI) + PaddleOCR
- **Deployment:** Hosted on Render/Railway/Vercel

**Advantages:**
- ✅ Fastest to build (2-3 weeks for MVP)
- ✅ Easy to demonstrate
- ✅ No app store approval delays

**Disadvantages:**
- ❌ Not truly mobile-native
- ❌ Requires internet (unless PWA with service workers)

---

## 14. REBUILD STRATEGY

### Should We Recover or Rebuild?

| Approach | Effort | Risk | Recommendation |
|----------|--------|------|----------------|
| **A. Recover APK** | Low | High | ❌ **NOT RECOMMENDED** |
| **B. Rebuild from Scratch** | High | Low | ✅ **RECOMMENDED** |
| **C. Hybrid (reuse logic)** | Medium | Low | ✅ **RECOMMENDED** |

### Why Rebuild?

1. **Flutter Source Code is Missing**
   - Cannot modify or extend existing APK
   - Cannot fix bugs or add features
   - Cannot verify what the APK actually does

2. **OCR Was Never Working**
   - Training logs show 0% accuracy
   - No trained models exist
   - Must build OCR pipeline from scratch anyway

3. **Technology Has Improved**
   - Better OCR options available now (PaddleOCR, ML Kit)
   - More mobile-friendly models
   - Better tools and frameworks

### Recommended Rebuild Strategy

**Phase 0: Preparation (1 week)**
- Set up development environment
- Install PaddleOCR and test with sample images
- Port transliteration notebook to Python module
- Create project repository structure

**Phase 1: Backend OCR + Transliteration (3-4 weeks)**
- Build OCR pipeline with PaddleOCR
- Integrate existing transliteration logic
- Create FastAPI wrapper
- Test with sample street sign images

**Phase 2: Mobile MVP (4-5 weeks)**
- Set up Flutter project
- Implement camera capture
- Create basic UI (upload → process → display)
- Integrate with backend API
- Test end-to-end flow

**Phase 3: Enhancement (3-4 weeks)**
- Add image preprocessing
- Improve OCR accuracy
- Refine UI/UX
- Add error handling
- Implement script selection

**Phase 4: Advanced Features (Optional, 3-4 weeks)**
- Text-to-speech
- Offline mode (embed models)
- AR overlay
- History/favorites

**Phase 5: Testing & Deployment (2 weeks)**
- User testing
- Bug fixes
- Performance optimization
- App store submission

**Total Timeline:** 13-18 weeks (3-4.5 months) for complete solution

---

## 15. WHAT WE SHOULD NOT BUILD

### Unnecessary Complexity (Avoid These)

1. **Custom OCR Training from Scratch** ❌
   - Use PaddleOCR or ML Kit instead
   - Training a production-quality OCR model requires:
     - Large labeled datasets (10,000+ images)
     - Significant compute resources (GPU cluster)
     - 6-12 months of iteration
   - **Reality:** This is a research-level effort, not a hackathon project

2. **Multiple OCR Models** ❌
   - Don't try CRNN + STAR-Net + PARSeq simultaneously
   - Pick ONE proven solution (PaddleOCR)
   - Focus on integration, not research

3. **Advanced AR Features** ❌
   - AR overlays are impressive but not essential
   - Significantly increase complexity
   - Save for Phase 4 or later

4. **Backend/Cloud Infrastructure** ❌ (initially)
   - Start with local/on-device processing
   - Add cloud support only if needed for performance

5. **Comprehensive Testing Framework** ❌ (initially)
   - Start with manual testing
   - Add automated tests after MVP works

6. **Multi-Language UI** ❌ (initially)
   - Start with English UI
   - Add localization later

7. **Complex State Management** ❌
   - Use simple state management (Provider/Riverpod)
   - Don't over-engineer with Redux/Bloc initially

---

## 16. RISKS

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **OCR accuracy too low** | Medium | High | Use PaddleOCR; test early with real images |
| **Flutter learning curve** | Low | Medium | Use templates; extensive documentation available |
| **On-device performance** | Medium | Medium | Use optimized models; consider cloud fallback |
| **Camera permissions** | Low | Low | Standard Flutter plugins handle this |
| **Script detection errors** | Low | Medium | Existing Unicode-based detection is reliable |
| **Image quality issues** | High | High | Implement preprocessing; guide users on image capture |
| **Transliteration errors** | Low | Low | Existing logic is tested and working |
| **APK size (model files)** | Medium | Low | Use quantized models; lazy loading |

### Project Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Original APK is not accessible** | Medium | Medium | Already planning rebuild; not dependent on APK |
| **Team availability** | Unknown | High | Define clear milestones and responsibilities |
| **Scope creep** | High | High | Strictly follow MVP feature list |
| **Integration challenges** | Medium | Medium | Build modular components; test integration early |
| **Dataset availability** | Low | Medium | IndicSTR12 and Indian signboard datasets exist |
| **Time estimation errors** | High | Medium | Add 30% buffer to estimates |

### Specific Concerns

1. **Missing Flutter Source Code**
   - **Risk:** Cannot verify what was actually built
   - **Impact:** Must rebuild UI from scratch
   - **Mitigation:** Already planned in rebuild strategy

2. **OCR Training Never Succeeded**
   - **Risk:** Word Weavers attempted CRNN training and failed
   - **Impact:** No in-house OCR expertise
   - **Mitigation:** Use proven third-party OCR (PaddleOCR)

3. **No Datasets in Repository**
   - **Risk:** No training or testing data available
   - **Impact:** Must source datasets externally
   - **Mitigation:** IndicSTR12 dataset is publicly available

4. **Image Quality Variance**
   - **Risk:** Real-world signboards vary greatly (lighting, angle, wear)
   - **Impact:** OCR accuracy may be inconsistent
   - **Mitigation:** Image preprocessing + user guidance + iterative improvement

---

## 17. PRIORITY ORDER

### P0 — Absolutely Required (MVP)

1. **OCR Engine Integration** (Week 1-4)
   - Use PaddleOCR or Google ML Kit
   - Test with sample Indic script images
   - Achieve >80% accuracy on clean images

2. **Transliteration Module** (Week 1-2)
   - Port notebook logic to Python module
   - Create API wrapper
   - Test all script pairs

3. **Mobile App Skeleton** (Week 3-5)
   - Flutter project setup
   - Camera/upload functionality
   - Basic UI layout

4. **Integration** (Week 6-7)
   - Connect mobile app to OCR + transliteration
   - End-to-end testing
   - Error handling

5. **Basic Deployment** (Week 8)
   - APK build
   - Basic testing
   - Demo preparation

### P1 — Important (Post-MVP)

6. **Image Preprocessing** (Week 9-10)
   - Auto-crop
   - Perspective correction
   - Brightness/contrast adjustment

7. **Improved UI/UX** (Week 9-10)
   - Better visual design
   - Loading states
   - Result history

8. **Text-to-Speech** (Week 11-12)
   - Integrate TTS library
   - Script-specific pronunciation
   - Volume/speed controls

9. **Error Handling & Edge Cases** (Week 11-12)
   - Handle poor image quality
   - Fallback mechanisms
   - User guidance messages

### P2 — Optional Enhancements (Future)

10. **AR Overlay**
11. **Offline Model Caching**
12. **Advanced Image Filters**
13. **Multi-Language UI**
14. **User Accounts / History Sync**
15. **Batch Processing**

---

## 18. PROPOSED DEVELOPMENT PHASES

### Phase 0: Recovery & Setup (Week 0-1)
**Goal:** Establish foundation and verify existing assets

**Tasks:**
- ✅ Audit complete (this document)
- Set up Git repository (new or cleaned)
- Install PaddleOCR and dependencies
- Port transliteration notebook to `lipisathi_core` Python module
- Create basic FastAPI wrapper for testing
- Test transliteration logic with all script pairs
- Verify PaddleOCR works with sample Indic images

**Deliverable:** Working transliteration API + confirmed OCR capability

---

### Phase 1: OCR Pipeline (Week 2-4)
**Goal:** Build reliable OCR for Indic scripts

**Tasks:**
- Integrate PaddleOCR with Indic language models
- Implement image preprocessing:
  - Grayscale conversion
  - Noise reduction
  - Contrast enhancement
- Create OCR → Script Detection → Transliteration pipeline
- Test with IndicSTR12 dataset
- Optimize for accuracy and speed
- Build basic CLI tool for testing

**Deliverable:** Python script that takes image → returns transliterated text

**Success Metric:** >75% accuracy on IndicSTR12 test set

---

### Phase 2: Mobile App Foundation (Week 5-7)
**Goal:** Build Flutter app with core functionality

**Tasks:**
- Set up Flutter project structure
- Implement camera capture and image upload
- Create basic UI:
  - Home screen with capture/upload buttons
  - Script selection dropdown
  - Result display screen
- Implement API integration (call Python backend)
- Add loading states and error messages
- Test on Android device

**Deliverable:** Working Android APK with camera → API → result flow

**Success Metric:** End-to-end demo works on real device

---

### Phase 3: Integration & Refinement (Week 8-10)
**Goal:** Improve accuracy, UX, and reliability

**Tasks:**
- Add image preprocessing in mobile app:
  - Auto-crop signboard region
  - Perspective correction
  - Brightness adjustment guidance
- Improve OCR accuracy with better preprocessing
- Enhance UI/UX:
  - Better visual design
  - Copy-to-clipboard
  - Share functionality
- Add user guidance (tips for taking good photos)
- Implement result history (local storage)
- Handle edge cases (no text detected, unknown script, etc.)
- Performance optimization

**Deliverable:** Polished Android app with improved accuracy

**Success Metric:** >85% accuracy on real-world signboard images

---

### Phase 4: Advanced Features (Week 11-14)
**Goal:** Add differentiation features

**Tasks:**
- Implement Text-to-Speech:
  - Integrate flutter_tts
  - Script-specific pronunciation
  - Playback controls
- Add offline mode:
  - Embed OCR models in app
  - Local-only processing option
- Implement AR overlay (optional):
  - Camera preview with text overlay
  - Real-time transliteration display
- Add iOS support (if needed)
- Multi-language UI (if needed)

**Deliverable:** Feature-complete app with TTS and offline mode

**Success Metric:** App works without internet connection

---

### Phase 5: Testing & Deployment (Week 15-16)
**Goal:** Production-ready release

**Tasks:**
- Comprehensive testing:
  - Unit tests (transliteration logic)
  - Integration tests (OCR → transliteration)
  - UI tests (Flutter widget tests)
  - Manual testing with real users
- Bug fixes
- Performance optimization:
  - Reduce APK size
  - Optimize model loading time
  - Reduce memory usage
- Documentation:
  - User guide
  - Technical documentation
  - API documentation
- App store preparation:
  - Screenshots
  - App description
  - Privacy policy
- Release:
  - Build signed APK
  - Play Store submission (optional)
  - GitHub release

**Deliverable:** Production-ready APK + documentation

**Success Metric:** App passes testing; ready for distribution

---

## 19. FINAL RECOMMENDATION

**If I were the technical lead responsible for completing Word Weavers' SIH25155 project now, here is what I would do:**

### Immediate Actions (Week 0-1)

1. **Preserve and Port Existing Work** ✅
   - Extract transliteration logic from notebook
   - Create standalone Python module: `lipisathi_core`
   - Write unit tests for all script pairs
   - **Reusability:** 100% of existing work preserved

2. **Validate OCR Approach** ✅
   - Install PaddleOCR
   - Test with 20-30 sample Indian signboard images
   - Measure accuracy and speed
   - **Decision Point:** Confirm PaddleOCR is suitable before proceeding

3. **Set Up Clean Repository** ✅
   - Create new Git repository or clean existing one
   - Structure: `backend/` (Python API) + `mobile/` (Flutter)
   - Add proper .gitignore
   - **Goal:** Professional codebase for future development

---

### What to Reuse ✅

1. **Core Transliteration Logic** — Port to Python module
2. **Project Branding** — Keep "LipiSathi" name and Word Weavers identity
3. **User Experience Flow** — 5-step approach is solid
4. **Research References** — Use IndicSTR12 resources and datasets

---

### What to Discard ❌

1. **Failed OCR Training Attempts** — Don't repeat CRNN from scratch
2. **Unverified APK** — Cannot modify or learn from it without source
3. **Over-Complex Architecture Plans** — Keep it simple for MVP
4. **Academic Research Scope** — Focus on application, not research

---

### What to Build Fresh 🆕

1. **OCR Integration** — Use PaddleOCR (don't train from scratch)
2. **Mobile Application** — Rebuild in Flutter (or React Native)
3. **Image Pipeline** — Preprocessing and camera integration
4. **API Layer** — FastAPI for backend communication
5. **Testing Suite** — Proper validation framework

---

### Development Strategy

**Phase 1: Validate OCR Viability (2 weeks)**
- Build standalone Python script: `image → PaddleOCR → transliterate → output`
- Test with IndicSTR12 dataset
- **Go/No-Go Decision:** If accuracy <70%, reconsider approach

**Phase 2: Build MVP (6 weeks)**
- FastAPI backend (OCR + transliteration)
- Flutter app (camera + API + display)
- Basic UI/UX
- **Target:** Working end-to-end demonstration

**Phase 3: Enhance & Deploy (4 weeks)**
- Improve accuracy with preprocessing
- Add TTS
- Polish UI
- Deploy and test with real users

---

### Success Criteria

**MVP Success:**
- ✅ User can take photo of signboard
- ✅ Text is extracted and transliterated
- ✅ Result is displayed clearly
- ✅ Accuracy >75% on common signboards
- ✅ Response time <3 seconds

**Complete Solution Success:**
- ✅ All MVP criteria met
- ✅ Accuracy >85%
- ✅ Works offline (on-device processing)
- ✅ Text-to-speech functional
- ✅ Professional UI/UX
- ✅ Handles edge cases gracefully
- ✅ Available on Play Store

---

### Budget & Resources

**Development Team (Ideal):**
- 1 × Backend Engineer (Python, OCR, FastAPI) — 3 months
- 1 × Mobile Engineer (Flutter/React Native) — 3 months
- 1 × UI/UX Designer (part-time) — 1 month
- 1 × QA/Testing (part-time) — 1 month

**Compute Resources:**
- Development laptops (existing)
- Android testing device (existing)
- Cloud hosting (optional): ~$20-50/month for API
- **Total Additional Cost:** ~$50-200 for 3 months (minimal)

**Time Investment:**
- **MVP:** 8-10 weeks
- **Complete Solution:** 16-18 weeks
- **Production-Ready:** 20-24 weeks (with testing and deployment)

---

### Risk Mitigation

**Top 3 Risks:**

1. **OCR Accuracy Too Low**
   - **Mitigation:** Test early, iterate on preprocessing, consider hybrid approach (cloud + on-device)

2. **Integration Complexity**
   - **Mitigation:** Build modular components, test integration points frequently

3. **Scope Creep**
   - **Mitigation:** Strict adherence to MVP feature list, phase-based development

---

### Final Decision

**Recommended Path: REBUILD WITH ASSET REUSE**

**Rationale:**
- ✅ Existing transliteration logic is solid and reusable
- ✅ Modern tools (PaddleOCR) make OCR tractable
- ✅ Flutter enables rapid mobile development
- ✅ Project is 20-25% complete; realistic to finish in 3-4 months
- ✅ Original vision is sound; just needs execution

**First Step Tomorrow:**
1. Create `lipisathi_core` Python module from notebook
2. Install PaddleOCR and test with 10 signboard images
3. Set up clean Git repository with proper structure
4. Create technical roadmap with weekly milestones

**Confidence Level:** **High** — The project is completable with focused effort and realistic scope.

---

## 20. AUDIT CONCLUSION

### Summary

**Word Weavers** created a **solid conceptual foundation** and **working core logic** for LipiSathi, an offline Indian script transliteration tool. The team successfully demonstrated:
- ✅ Clear problem understanding
- ✅ Well-researched solution approach
- ✅ Working transliteration engine (hub-and-spoke architecture)
- ✅ Professional documentation and presentation

However, the project **stopped at ~20-25% completion**. The **application infrastructure** (OCR, camera, mobile UI, TTS) was never implemented or has been lost (Flutter source code missing).

### Current State

**What Exists:**
- Working Python transliteration notebook
- Comprehensive research documentation
- Professional SIH presentation
- Project branding and vision

**What's Missing:**
- OCR implementation
- Mobile application source code
- Camera integration
- Image preprocessing
- Text-to-speech
- Complete end-to-end system

### Path Forward

**Recommendation:** **REBUILD** the application while **REUSING** the transliteration logic and project vision.

**Estimated Effort:** 16-20 weeks for complete solution, 8-10 weeks for MVP

**Confidence:** **High** — With modern tools (PaddleOCR, Flutter) and clear requirements, the project is completable.

**Next Step:** Validate OCR approach with PaddleOCR before committing to full rebuild.

---

## APPENDIX

### A. Repository Metrics

- **Total Commits:** 14
- **Total Files:** 6 (excluding .git)
- **Lines of Code:** ~9,000 (mostly markdown documentation)
- **Python Code:** ~400 lines (notebook)
- **Commit Frequency:** Irregular (bulk uploads)
- **Last Meaningful Code Change:** May 20, 2026
- **Latest Activity:** September 7, 2026 (documentation only)

### B. Technology References

**OCR Options Researched:**
- IndicSTR12 (research project)
- CRNN (attempted, failed)
- STAR-Net (researched, not attempted)
- PARSeq (researched, not attempted)
- Tesseract (mentioned)

**Datasets Referenced:**
- IndicSTR12 dataset (CVIT IIIT)
- Indian Signboard Image Dataset (Kaggle)
- Transliteration Dataset (21 Indic Languages) (Kaggle)

**Academic Papers Referenced:**
- IndicSTR12 paper (Springer)
- MATra paper (arXiv)
- Importance of Transliteration paper (Taylor & Francis)

### C. Contact Information

**Team:** Word Weavers  
**Institution:** Vasireddy Venkatadri Institute of Technology (VVIT)  
**Team Leader:** ADHIMULAM BHARGAV SAI VISWANATH  
**Department:** Computer Science & Engineering (CSM)  
**Team ID:** 80589  
**Problem Statement:** SIH25155

### D. External Resources

**Google Drive Link (APK):**
https://drive.google.com/drive/folders/1Si_GzsD3hwRHa9RlDLQtPJjII9nSx_9N?usp=sharing

**Documentation Reference:**
https://docs.google.com/document/d/1Fmq2n86K9uBkNmv5ycIz7S0hz6U68hVjWErxddlB_Ro/edit?usp=sharing

**GitHub Repository:**
https://github.com/SIH-2025-Word-Weavers/Indian_Transliteration

---

**END OF FORENSIC AUDIT REPORT**

**Audit Completed:** September 7, 2026  
**No files were modified during this audit.**  
**Next action:** Review this report and decide on rebuild approach.
