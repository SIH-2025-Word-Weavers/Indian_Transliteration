# SIH25155 — Asset Inventory & Recovery Guide

**Project:** LipiSathi  
**Team:** Word Weavers  
**Audit Date:** September 7, 2026

---

## 📦 Complete Asset Inventory

### Repository Contents

```
Indian_Transliteration/
├── README.md                                 [4.9 KB]  ✅ USEFUL
├── LICENSE.md                                [1.0 KB]  ✅ STANDARD
├── SIH25Team8058920250930052829.pdf         [3.3 MB]  ✅ USEFUL
├── SIH_2025_Word_Weavers_Transliteration.md [850 KB]  📚 REFERENCE
├── transliteration_algorithm.ipynb          [27 KB]   ✅ CRITICAL
└── Docs&APKs/
    └── README.md                             [1.3 KB]  ⚠️ EXTERNAL LINK
```

**Total Repository Size:** ~4.2 MB  
**Critical Code:** 27 KB (notebook only)  
**Documentation:** ~855 KB

---

## 🔍 File-by-File Analysis

### 1. `transliteration_algorithm.ipynb` — ✅ **CRITICAL ASSET**

**Size:** 27 KB (426 lines)  
**Status:** ✅ WORKING CODE  
**Reusability:** 100%

#### What It Contains

**A. Script Detection (Unicode-based)**
```python
SCRIPT_RANGES = {
    "Telugu": (0x0C00, 0x0C7F),
    "Devanagari": (0x0900, 0x097F),
    "Tamil": (0x0B80, 0x0BFF),
    "Malayalam": (0x0D00, 0x0D7F),
    "Gurmukhi": (0x0A00, 0x0A7F),
    "Kannada": (0x0C80, 0x0CFF),
    "Bengali": (0x0980, 0x09FF),
    "Gujarati": (0x0A80, 0x0AFF),
    "Odia": (0x0B00, 0x0B7F),
}
```

**B. Hub-and-Spoke Mappings**
- 9 scripts → Devanagari (hub)
- Devanagari → 9 scripts (reverse mappings auto-generated)

**C. Exception Dictionary**
```python
EXCEPTION_DICTIONARY = {
    "lipisathi": {"Devanagari": "लिपिसाथी", "Telugu": "లిపిసాథి"},
    "google": {"Devanagari": "गूगल", "Telugu": "గూగుల్"},
}
```

**D. Language Rules**
- Schwa deletion for Hindi
- Character approximations for Tamil

**E. Interactive Demo**
- Terminal-based transliteration tool
- Example inputs and outputs

#### How to Recover/Use

**Step 1: Extract to Python Module**
```bash
# Create clean Python module
mkdir lipisathi_core
cd lipisathi_core

# Extract from notebook
jupyter nbconvert --to python transliteration_algorithm.ipynb
# OR manually copy-paste functions

# Create module structure:
lipisathi_core/
├── __init__.py
├── script_detection.py
├── mappings.py
├── transliterate.py
└── exceptions.py
```

**Step 2: Add Tests**
```python
# test_transliteration.py
def test_telugu_to_devanagari():
    input = "నమస్కారం"
    expected = "नमस्कारं"
    result = transliterate(input, "Devanagari", "Telugu")
    assert result == expected
```

**Step 3: Create API Wrapper**
```python
# api.py (FastAPI)
from fastapi import FastAPI
from lipisathi_core import transliterate

app = FastAPI()

@app.post("/transliterate")
def transliterate_text(text: str, target_script: str):
    return {"result": transliterate(text, target_script)}
```

#### Recovery Priority: **P0 (HIGHEST)**

---

### 2. `README.md` — ✅ **DOCUMENTATION**

**Size:** 4.9 KB (163 lines)  
**Status:** ✅ WELL-WRITTEN  
**Reusability:** 100%

#### What It Contains
- Project overview ("LipiSathi")
- Problem statement
- Current implementation status
- Team information
- Roadmap (honest about missing features)
- Quick start guide
- Links to resources

#### Key Insight
> "Note: Current repository implementation is notebook-first transliteration logic.  
> OCR/camera overlay/TTS are part of the broader SIH solution direction."

**✅ README honestly indicates current state vs. future goals**

#### How to Use
- Keep as base documentation
- Update with rebuild progress
- Use as template for new README

#### Recovery Priority: **P1**

---

### 3. `SIH25Team8058920250930052829.pdf` — ✅ **PRESENTATION**

**Size:** 3.3 MB (6 slides)  
**Status:** ✅ PROFESSIONAL  
**Reusability:** 80%

#### What It Contains
- Problem statement explanation
- 5-step technical approach:
  1. Capture (Camera/Snapshot)
  2. Recognize (OCR + Script ID)
  3. Transliterate (Script → Script)
  4. Display (Render & UI)
  5. Speak (Text-to-Speech)
- Technology stack diagram
- Feasibility summary
- Research references

#### How to Use
- Reference for UX flow
- Use diagrams in new documentation
- Product requirements source

#### Recovery Priority: **P1**

---

### 4. `SIH_2025_Word_Weavers_Transliteration.md` — 📚 **RESEARCH NOTES**

**Size:** 850 KB (8,451 lines)  
**Status:** 📚 COMPREHENSIVE BUT CHAOTIC  
**Reusability:** 30-40% (reference only)

#### What It Contains

**Section 1: Problem Explanation** (Lines 1-200)
- Use case examples
- Team information
- Problem restatement

**Section 2: Command Logs** (Lines 200-700)
- Terminal history from setting up IndicSTR12
- Python package installations
- LMDB dataset creation attempts

**Section 3: Training Logs** (Lines 700-2600)
- CRNN training output
- **Critical Finding:** All epochs show 0.0000 accuracy
- Training failed completely

**Section 4: Documentation** (Lines 2600-8451)
- Project analysis reports
- Workflow guides
- Model architecture comparisons
- Dataset troubleshooting
- Learning paths

#### Key Findings

**Failed OCR Training:**
```
EPOCH 1/30 → Val Loss: 0.2815, Accuracy: 0.0000, CRR: 0.0000
EPOCH 2/30 → Val Loss: 0.2831, Accuracy: 0.0000, CRR: 0.0000
...
EPOCH 30/30 → Val Loss: 0.2307, Accuracy: 0.0000, CRR: 0.0000
```

**Conclusion:** OCR training was attempted but failed to learn anything.

#### How to Use
- Reference for OCR model options
- Dataset links (IndicSTR12, Kaggle)
- Academic paper references
- **Do NOT attempt to replicate failed training approach**

#### Recovery Priority: **P2 (Reference only)**

---

### 5. `Docs&APKs/README.md` — ⚠️ **EXTERNAL LINK**

**Size:** 1.3 KB  
**Status:** ⚠️ POINTS TO EXTERNAL RESOURCE  
**Reusability:** Cannot verify without access

#### What It Contains
```markdown
## Google Drive
Project Files & APK:  
https://drive.google.com/drive/folders/1Si_GzsD3hwRHa9RlDLQtPJjII9nSx_9N?usp=sharing
```

#### Critical Questions

**Can you access this Google Drive?**
- ✅ Yes → Download APK and inspect
- ❌ No → Cannot recover mobile app

**If APK is accessible, what to check:**
1. **Package name:** What is the app ID?
2. **Version info:** When was it built?
3. **APK size:** Indicates complexity (small = UI mockup, large = includes models)
4. **Install and test:**
   - Does it actually work?
   - What functionality exists?
   - Is OCR included?
   - What screens exist?
   - Is it Flutter (check app structure)?

**If APK is NOT accessible:**
- ❌ Cannot recover mobile application
- ✅ Must rebuild from scratch

#### Recovery Priority: **P0 (IF ACCESSIBLE)**

---

### 6. `LICENSE.md` — ✅ **STANDARD**

**Size:** 1.0 KB  
**Status:** ✅ MIT LICENSE  
**Reusability:** 100%

#### What It Contains
- Standard MIT License
- Copyright: ADHIMULAM BHARGAV SAI VISWANATH

#### How to Use
- Keep same license for rebuild
- No changes needed

#### Recovery Priority: **P3**

---

## 🔄 Asset Recovery Strategy

### Phase 1: Extract Core Logic (Day 1)

**Task:** Convert notebook to production-ready module

**Actions:**
```bash
# 1. Create module structure
mkdir -p lipisathi_core/{tests,data}

# 2. Extract functions from notebook
# Copy to lipisathi_core/transliterate.py

# 3. Add dependencies
cat > requirements.txt << EOF
numpy>=1.21.0
pandas>=1.3.0
EOF

# 4. Test extraction
python -c "from lipisathi_core import transliterate; print(transliterate('నమస్కారం', 'Devanagari'))"
```

**Expected Output:** `नमस्कारं`

**Deliverable:** Clean Python module

---

### Phase 2: Validate OCR Approach (Day 2-3)

**Task:** Test PaddleOCR with sample images

**Actions:**
```bash
# 1. Install PaddleOCR
pip install paddleocr paddlepaddle

# 2. Download sample images
# Get 10-20 Indian signboard images from:
# - IndicSTR12 dataset
# - Kaggle Indian Signboard dataset
# - Google Images (for testing only)

# 3. Test OCR
python test_ocr.py
```

**Test Script:**
```python
from paddleocr import PaddleOCR

ocr = PaddleOCR(lang='en')  # Start with English
result = ocr.ocr('sample_signboard.jpg')
print(result)

# Test with Hindi
ocr_hi = PaddleOCR(lang='hi')
result_hi = ocr_hi.ocr('hindi_signboard.jpg')
print(result_hi)
```

**Success Criteria:** >70% text extraction accuracy

**Deliverable:** OCR validation report

---

### Phase 3: Create Standalone Demo (Week 1)

**Task:** Build Python script: image → transliterated text

**Actions:**
```bash
# demo_pipeline.py
from paddleocr import PaddleOCR
from lipisathi_core import transliterate, detect_script

def process_image(image_path, target_script):
    # 1. OCR
    ocr = PaddleOCR(lang='hi')  # or multi-language
    result = ocr.ocr(image_path)
    extracted_text = " ".join([line[1][0] for line in result[0]])
    
    # 2. Detect script
    source_script = detect_script(extracted_text)
    
    # 3. Transliterate
    output_text = transliterate(extracted_text, target_script, source_script)
    
    return output_text

# Test
result = process_image('test_image.jpg', 'Telugu')
print(result)
```

**Deliverable:** Working Python demo script

---

### Phase 4: Build API (Week 2)

**Task:** Create FastAPI backend

**Actions:**
```bash
# api.py
from fastapi import FastAPI, UploadFile
from demo_pipeline import process_image

app = FastAPI()

@app.post("/transliterate")
async def transliterate_image(file: UploadFile, target_script: str):
    # Save uploaded file
    with open("temp.jpg", "wb") as f:
        f.write(await file.read())
    
    # Process
    result = process_image("temp.jpg", target_script)
    
    return {"result": result}

# Run: uvicorn api:app --reload
```

**Test:**
```bash
curl -X POST "http://localhost:8000/transliterate?target_script=Telugu" \
  -F "file=@test_image.jpg"
```

**Deliverable:** Working API endpoint

---

## 📊 Asset Quality Assessment

| Asset | Quality | Completeness | Usability | Priority |
|-------|---------|--------------|-----------|----------|
| **Transliteration Notebook** | ⭐⭐⭐⭐⭐ | 100% | ✅ HIGH | **P0** |
| **README** | ⭐⭐⭐⭐⭐ | 100% | ✅ HIGH | P1 |
| **PDF Presentation** | ⭐⭐⭐⭐ | 100% | ✅ MEDIUM | P1 |
| **Research Markdown** | ⭐⭐⭐ | 80% | 🟡 LOW | P2 |
| **LICENSE** | ⭐⭐⭐⭐⭐ | 100% | ✅ HIGH | P3 |
| **APK (External)** | ❓ | ❓ | ❓ | **P0** |

---

## ✅ Recovery Checklist

### Immediate Actions (Day 1)

- [ ] Extract transliteration logic from notebook
- [ ] Create `lipisathi_core` Python module
- [ ] Write unit tests for all script pairs
- [ ] Test that transliteration still works
- [ ] Document module API

### Short-term (Week 1)

- [ ] Install PaddleOCR
- [ ] Download IndicSTR12 dataset (sample)
- [ ] Test OCR with 20 sample images
- [ ] Measure accuracy and speed
- [ ] **Decision: Proceed with rebuild? Yes/No**

### Medium-term (Weeks 2-4)

- [ ] Build OCR + transliteration pipeline
- [ ] Create FastAPI wrapper
- [ ] Test end-to-end (image → transliterated text)
- [ ] Measure performance metrics
- [ ] Document API

### Long-term (Weeks 5+)

- [ ] Build Flutter mobile app
- [ ] Integrate with backend API
- [ ] Test on real devices
- [ ] Deploy and distribute

---

## 🎯 What Can Be Recovered vs. Must Be Rebuilt

### ✅ RECOVERABLE (Existing & Usable)

| Asset | Location | Action Required |
|-------|----------|----------------|
| **Transliteration Logic** | `transliteration_algorithm.ipynb` | Port to Python module |
| **Script Mappings** | Notebook cells | Extract to `mappings.py` |
| **Exception Dictionary** | Notebook cells | Extract to `exceptions.py` |
| **Language Rules** | Notebook cells | Extract to `rules.py` |
| **Script Detection** | Notebook cells | Extract to `detection.py` |
| **Project Branding** | README, PDF | Reuse directly |
| **UX Flow** | PDF | Reference for rebuild |
| **Research Links** | Research markdown | Reference for datasets |

**Estimated Recovery Effort:** 1-2 days

---

### 🔧 MUST BE REBUILT (Missing or Non-Functional)

| Component | Why Rebuild | Recommended Approach |
|-----------|-------------|---------------------|
| **OCR Engine** | Training failed (0% accuracy) | Use PaddleOCR |
| **Mobile App** | Source code missing | Rebuild in Flutter |
| **Camera Integration** | Never implemented | Use `flutter_camera` |
| **Image Preprocessing** | Never implemented | Use OpenCV |
| **Text-to-Speech** | Never implemented | Use `flutter_tts` |
| **Backend API** | Never implemented | Build with FastAPI |
| **Testing Framework** | Never implemented | Use pytest + Flutter test |
| **CI/CD** | Never implemented | GitHub Actions |

**Estimated Rebuild Effort:** 16-20 weeks

---

## 📁 Recommended File Structure for Rebuild

```
lipisathi/
├── backend/
│   ├── lipisathi_core/           # Recovered transliteration logic
│   │   ├── __init__.py
│   │   ├── transliterate.py      # Main transliteration function
│   │   ├── mappings.py           # Script mappings
│   │   ├── detection.py          # Script detection
│   │   ├── rules.py              # Language-specific rules
│   │   └── exceptions.py         # Exception dictionary
│   ├── ocr/
│   │   ├── __init__.py
│   │   ├── paddle_ocr.py         # PaddleOCR wrapper
│   │   └── preprocessing.py      # Image preprocessing
│   ├── api/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI app
│   │   └── routes.py             # API routes
│   ├── tests/
│   │   ├── test_transliterate.py
│   │   ├── test_ocr.py
│   │   └── test_api.py
│   ├── requirements.txt
│   └── README.md
├── mobile/
│   ├── lib/
│   │   ├── main.dart
│   │   ├── screens/
│   │   │   ├── home_screen.dart
│   │   │   ├── camera_screen.dart
│   │   │   └── result_screen.dart
│   │   ├── services/
│   │   │   ├── api_service.dart
│   │   │   └── camera_service.dart
│   │   └── widgets/
│   ├── pubspec.yaml
│   └── README.md
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEVELOPMENT.md
├── assets/
│   ├── sample_images/
│   └── test_data/
├── .gitignore
├── README.md
└── LICENSE.md
```

---

## 🚨 Critical Asset: APK Investigation

### If APK is Accessible

**Priority Actions:**

1. **Download and Install**
   ```bash
   # Download from Google Drive
   # Install on Android device
   adb install lipisathi.apk
   ```

2. **Functional Testing**
   - [ ] Does it launch?
   - [ ] What screens exist?
   - [ ] Can you capture/upload images?
   - [ ] Does OCR work?
   - [ ] Does transliteration work?
   - [ ] Is it offline-capable?

3. **Technical Analysis**
   ```bash
   # Check package info
   aapt dump badging lipisathi.apk
   
   # Check APK size
   ls -lh lipisathi.apk
   
   # Extract APK (optional)
   unzip lipisathi.apk -d lipisathi_extracted/
   
   # Check for Flutter artifacts
   ls lipisathi_extracted/lib/
   # Look for: libflutter.so, libapp.so
   ```

4. **Recovery Assessment**
   - **If fully functional:** Reverse-engineer UI/UX flow
   - **If partial mockup:** Document what exists, rebuild properly
   - **If Flutter-based:** Consider decompiling for insights (legal/ethical considerations)

5. **Decision Point**
   - Can we learn useful UI/UX patterns? → Document them
   - Can we extract assets (icons, images)? → Reuse if appropriate
   - Can we recover Flutter code? → Unlikely, but check

### If APK is NOT Accessible

**Fallback Plan:**

- ✅ Rebuild mobile app from scratch
- ✅ Use PDF presentation for UX flow guidance
- ✅ Reference README for feature list
- ✅ Design UI based on modern Material Design / iOS guidelines

**Impact:** Medium — Will need to design UI from scratch, but has minimal impact on core functionality

---

## 📋 Final Recovery Summary

### What We Can Recover: ~20-25%

**Directly Usable:**
- ✅ Core transliteration logic (100%)
- ✅ Project vision and branding (100%)
- ✅ Research references (100%)

**Partially Usable:**
- 🟡 Research notes (lessons learned)
- 🟡 Failed training logs (what NOT to do)

**Cannot Recover:**
- ❌ OCR implementation (failed training)
- ❌ Flutter source code (missing)
- ❌ Camera integration (never built)
- ❌ TTS integration (never built)

### What We Must Rebuild: ~75-80%

**Critical Path:**
1. OCR pipeline (PaddleOCR) — 4-6 weeks
2. Mobile app (Flutter) — 4-5 weeks
3. Integration layer — 2-3 weeks
4. Testing and polish — 2-3 weeks

**Total Rebuild Effort:** 12-17 weeks

---

## 🎯 Next Action Items

### Today (Day 0)
1. ✅ **Review audit reports** (this document + full audit)
2. **Decide:** Rebuild or abandon?
3. **If rebuild → Assign roles:** Who does backend? Who does mobile?
4. **Access APK:** Try to access Google Drive link

### Tomorrow (Day 1)
1. **Extract transliteration logic** to Python module
2. **Install PaddleOCR** and test with sample image
3. **Set up clean Git repository**
4. **Create project roadmap**

### Week 1
1. **Build standalone demo:** Image → transliterated text
2. **Validate OCR accuracy:** Test with 50+ images
3. **Create FastAPI wrapper**
4. **Document progress**

---

**End of Asset Inventory**

For complete audit, see: `SIH25155_FORENSIC_AUDIT_REPORT.md`  
For quick summary, see: `SIH25155_AUDIT_SUMMARY.md`

**Audit completed:** September 7, 2026  
**No files were modified during this audit.**
