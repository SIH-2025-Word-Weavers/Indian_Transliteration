# LipiSathi — Indian Transliteration Toolkit

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![Notebook](https://img.shields.io/badge/Jupyter-Notebook-orange)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

An offline-first Indian script transliteration project built by **Team Word Weavers** for **Smart India Hackathon 2025 (SIH25155)**.

This repository currently contains a notebook-based transliteration engine that focuses on **script-to-script transliteration** (not translation), preserving pronunciation while changing script.

## Project Overview

India uses many scripts, and people often struggle to read local signboards outside their home region. This project targets that problem by converting text from one Indian script to another while preserving phonetic sound.

Current repository scope:
- Rule-based transliteration core in a Jupyter Notebook
- Script detection using Unicode ranges
- Multi-script mapping through a Devanagari hub
- Language-aware post-processing (initial Hindi rules)
- Exception dictionary for special words/loanwords

## Main Features

- **Automatic script detection** for input text
- **Hub-and-spoke transliteration architecture** (source script → Devanagari → target script)
- **Supported scripts in current implementation**:
  - Devanagari
  - Telugu
  - Tamil
  - Kannada
  - Malayalam
  - Gurmukhi
  - Bengali (incl. Assamese block coverage)
  - Odia
  - Gujarati
- **Exception dictionary support** for manually curated word mappings
- **Language-specific post-processing hooks** (currently Hindi schwa/orthographic handling)
- **Interactive CLI loop** in the notebook code for quick trials

## Technical Approach / Architecture

The transliteration logic in `transliteration_algorithm.ipynb` uses a deterministic approach:

1. **Detect source script** using Unicode block counts
2. **Normalize via hub** by converting source text into Devanagari
3. **Convert to target script** using reverse mappings generated from base maps
4. **Apply optional language rules** for orthographic refinements
5. **Return transliterated output** (or clear unsupported-script messages)

### High-Level Flow

`Input Text -> Script Detection -> Source→Devanagari Mapping -> Devanagari→Target Mapping -> Language Rules -> Output`

## Repository Structure

- `transliteration_algorithm.ipynb` — main transliteration implementation and demo logic
- `SIH25Team8058920250930052829.pdf` — project submission/supporting document
- `LICENSE.md` — MIT license
- `README.md` — project documentation

## Setup & Installation

> This project is notebook-first and currently uses Python standard library imports in the transliteration code.

### Prerequisites
- Python 3.8+
- Jupyter Notebook or JupyterLab

### Local Setup

```bash
git clone https://github.com/SIH-2025-Word-Weavers/Indian_Transliteration.git
cd Indian_Transliteration
python -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate
python -m pip install --upgrade pip notebook
```

## Usage

### Option A: Run in Jupyter Notebook (recommended)

```bash
jupyter notebook
```

Then open:
- `transliteration_algorithm.ipynb`

Run all cells, then:
- Use the provided demo sample cases, or
- Use the interactive input loop in the final cell

### Option B: Run logic as a Python script (quick test)

Export notebook cells as `.py` and run:

```bash
python transliteration_algorithm.py
```

(If you do not have an exported `.py`, run directly in notebook mode.)

### Example Calls (from notebook functions)

- Telugu -> Devanagari
- Devanagari -> Telugu
- Kannada -> Telugu
- Bengali -> Devanagari

The notebook includes such examples in its demo section.

## Contribution Guidelines

Contributions are welcome, especially for:
- More accurate script mappings
- Better language-specific phonetic rules
- OCR + Script-ID integration for end-to-end signboard flow
- Evaluation datasets and benchmarks
- Packaging the notebook logic into modular Python files/API

Suggested workflow:
1. Fork the repo
2. Create a feature branch
3. Make focused changes with clear commit messages
4. Open a pull request with test/demo evidence

## License

This project is licensed under the **MIT License**.
See [`LICENSE.md`](./LICENSE.md).

## Credits

Developed by **Team Word Weavers** under **Smart India Hackathon 2025**.

## Further Documentation / References

- SIH project document in this repository:
  - [`SIH_2025_Word_Weavers_Transliteration.md`](https://github.com/SIH-2025-Word-Weavers/Indian_Transliteration/blob/main/SIH_2025_Word_Weavers_Transliteration.md)
- Original Google Doc reference:
  - <https://docs.google.com/document/d/1Fmq2n86K9uBkNmv5ycIz7S0hz6U68hVjWErxddlB_Ro/edit?usp=sharing>

---

If you want, I can next split the notebook logic into a clean Python package structure (`src/`, tests, and CLI) while keeping behavior identical.
