---
layout: page
title: "GPU Setup"
description: Baseline checklist for local GPU readiness.
---
This guide tracks a stable local GPU setup process for AI experimentation.

## Driver and Runtime

1. Install the latest stable GPU driver.
2. Confirm CUDA toolkit and runtime compatibility with your framework.
3. Verify support with:

```bash
nvidia-smi
```

## Python Package Alignment

1. Pin PyTorch build for your CUDA version.
2. Pin critical libraries (`transformers`, `accelerate`, `bitsandbytes`) per project.
3. Save versions in a project `requirements.txt`.

## Validation Script

Run a quick tensor operation on GPU before any training session.
