<div align="center">

# 🇮🇳 Word Weavers — SIH 2025

**Team Word Weavers** · Smart India Hackathon 2025 · Problem ID **SIH25155**

[![SIH 2025](https://img.shields.io/badge/Smart%20India%20Hackathon-2025-orange?style=for-the-badge)](https://sih.gov.in/)
[![Problem ID](https://img.shields.io/badge/Problem%20ID-SIH25155-blue?style=for-the-badge)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](https://github.com/SIH-2025-Word-Weavers/Indian_Transliteration/blob/main/LICENSE.md)

</div>

---

## 🔤 What We're Building — LipiSathi

> **Read any Indian signboard in your familiar script — instantly and offline.**

India has **22 official languages** written in **13 different scripts**.  
A Tamil speaker visiting Odisha, or a Bengali traveller in Kerala, cannot read local signboards.  
**LipiSathi** bridges that gap by converting text between Indian scripts while perfectly preserving the original pronunciation — no internet required.

| Transliteration ≠ Translation |
|-------------------------------|
| **Translation** changes the *meaning* to another language. |
| **Transliteration** keeps the *sound* and changes only the *script*. |

---

## 🚀 Project at a Glance

| Feature | Status |
|---------|--------|
| Offline-first transliteration engine | ✅ Implemented |
| Automatic script detection (Unicode-range based) | ✅ Implemented |
| Hub-and-spoke via Devanagari pivot | ✅ Implemented |
| 9 Indian scripts supported | ✅ Implemented |
| Exception dictionary for loan words | ✅ Implemented |
| OCR + camera overlay pipeline | 🔜 Roadmap |
| Text-to-speech output | 🔜 Roadmap |
| Mobile-first deployment | 🔜 Roadmap |

### Scripts Supported

`Devanagari` · `Telugu` · `Tamil` · `Kannada` · `Malayalam` · `Gurmukhi` · `Bengali / Assamese` · `Odia` · `Gujarati`

---

## 🗺️ How It Works

```
Input Text
    │
    ▼
Script Detection          ← Unicode range analysis
    │
    ▼
Source → Devanagari       ← Character mapping table
    │
    ▼
Devanagari → Target       ← Character mapping table
    │
    ▼
Language Post-processing  ← Phonetic rules & exception dictionary
    │
    ▼
Output Text (your script)
```

**Full vision (SIH solution):**
`Capture Signboard → OCR → Script Identification → Transliteration Engine → Render in User Script → Text-to-Speech`

---

## 📦 Repository

| Repository | Description |
|---|---|
| [**Indian_Transliteration**](https://github.com/SIH-2025-Word-Weavers/Indian_Transliteration) | Core transliteration engine (Jupyter Notebook + documentation) |

### Quick Start

```bash
git clone https://github.com/SIH-2025-Word-Weavers/Indian_Transliteration.git
cd Indian_Transliteration
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install --upgrade pip notebook
jupyter notebook
```

Open `transliteration_algorithm.ipynb` and run all cells.

---

## 👥 Team

| Role | Name | Dept |
|------|------|------|
| Team Leader | Adhimulam Bhargav Sai Viswanath | CSM |
| Member | Bathula Mohana Sri Hari | CSM |
| Member | Bitra Bhavani | CSM |
| Member | Bitra Jaya Sri | CSM |
| Member | Bolagani Baby Prasanna | CSM |
| Member | Jaggarapu Venkata Sai | AI&DS |

**Institution:** Vasireddy Venkatadri Institute of Technology (VVIT), Andhra Pradesh  
**Hackathon:** Smart India Hackathon 2025 · Theme: Heritage & Culture · Org: AICTE

---

## 🤝 Get Involved

We welcome contributions in:

- 📸 **Indic OCR** — improving text extraction from signboard images
- 🔡 **Script-specific phonetic rules** — refining transliteration accuracy
- 📊 **Benchmarks & evaluation datasets** — building standard test suites
- 📱 **Mobile / productization** — bringing LipiSathi to end users

👉 [Open an issue](https://github.com/SIH-2025-Word-Weavers/Indian_Transliteration/issues) or submit a pull request to collaborate!

---

<div align="center">

Made with ❤️ for Bharat · MIT Licensed · SIH 2025

</div>
