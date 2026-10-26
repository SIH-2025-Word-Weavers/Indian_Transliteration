# M8 closure: OCR model and crop-upscale experiments

Exploratory, not a benchmark. References are owner-attested (see the ground-truth metadata). CER/WER are error rates, not accuracy; CER above 1 is valid because insertions dominate. Models: `default` is what the app loads (`.../4.0.0/`), `fast` = `4.0.0_fast`, `best` = `4.0.0_best`. Models were swapped inside the test by request interception; the app code is unchanged.

## Telugu

| Model | Crop | CER | filtered CER | reading errors (sub+del) / ref chars | word recall (found/ref) | chars emitted | mean conf | mean time s |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| default | oriented | 2.91 | 2.11 | 146 / 295 | 0.02 (1/41) | 1001 | 24.1 | 0.30 |
| default | upscale2x | 8.37 | 6.28 | 121 / 295 | 0.10 (4/41) | 2807 | 32.0 | 0.71 |
| fast | oriented | 2.72 | 2.25 | 135 / 295 | 0.05 (2/41) | 944 | 16.6 | 0.28 |
| fast | upscale2x | 8.14 | 6.80 | 114 / 295 | 0.07 (3/41) | 2739 | 22.1 | 0.62 |
| best | oriented | 2.95 | 2.27 | 145 / 295 | 0.02 (1/41) | 1012 | 24.9 | 0.39 |
| best | upscale2x | 8.28 | 6.43 | 118 / 295 | 0.10 (4/41) | 2782 | 28.8 | 0.91 |

Paired per-image CER (first lower = better): n = 14

| Comparison | metric | first lower | first higher | equal |
|---|---|---:|---:|---:|
| best vs default (crop) | unfiltered | 3 | 4 | 7 |
| best vs fast (crop) | unfiltered | 3 | 8 | 3 |
| default vs fast (crop) | unfiltered | 4 | 5 | 5 |
| default: upscale2x vs crop | unfiltered | 0 | 11 | 3 |
| fast: upscale2x vs crop | unfiltered | 1 | 10 | 3 |
| best: upscale2x vs crop | unfiltered | 0 | 10 | 4 |
| best vs default (crop) | filtered | 2 | 6 | 6 |
| best vs fast (crop) | filtered | 5 | 6 | 3 |
| default vs fast (crop) | filtered | 7 | 4 | 3 |
| default: upscale2x vs crop | filtered | 1 | 9 | 4 |
| fast: upscale2x vs crop | filtered | 1 | 9 | 4 |
| best: upscale2x vs crop | filtered | 1 | 10 | 3 |

## Hindi

| Model | Crop | CER | filtered CER | reading errors (sub+del) / ref chars | word recall (found/ref) | chars emitted | mean conf | mean time s |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| default | oriented | 5.42 | 4.42 | 379 / 967 | 0.25 (49/194) | 6349 | 30.7 | 0.77 |
| default | upscale2x | 9.26 | 7.71 | 381 / 967 | 0.22 (42/194) | 10425 | 27.5 | 1.58 |
| fast | oriented | 5.62 | 4.07 | 418 / 967 | 0.19 (37/194) | 6534 | 30.4 | 0.68 |
| fast | upscale2x | 9.66 | 7.05 | 411 / 967 | 0.20 (38/194) | 10840 | 29.3 | 1.60 |
| best | oriented | 5.23 | 4.41 | 377 / 967 | 0.23 (44/194) | 6134 | 28.6 | 1.20 |
| best | upscale2x | 9.04 | 7.84 | 367 / 967 | 0.20 (38/194) | 10202 | 27.0 | 2.19 |

Paired per-image CER (first lower = better): n = 31

| Comparison | metric | first lower | first higher | equal |
|---|---|---:|---:|---:|
| best vs default (crop) | unfiltered | 19 | 10 | 2 |
| best vs fast (crop) | unfiltered | 25 | 4 | 2 |
| default vs fast (crop) | unfiltered | 20 | 7 | 4 |
| default: upscale2x vs crop | unfiltered | 10 | 19 | 2 |
| fast: upscale2x vs crop | unfiltered | 6 | 24 | 1 |
| best: upscale2x vs crop | unfiltered | 8 | 23 | 0 |
| best vs default (crop) | filtered | 13 | 14 | 4 |
| best vs fast (crop) | filtered | 15 | 14 | 2 |
| default vs fast (crop) | filtered | 12 | 18 | 1 |
| default: upscale2x vs crop | filtered | 9 | 19 | 3 |
| fast: upscale2x vs crop | filtered | 8 | 21 | 2 |
| best: upscale2x vs crop | filtered | 8 | 21 | 2 |

