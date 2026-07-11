---
layout: page
title: "Python Environments"
description: Simple, repeatable environment management for AI projects.
---
Consistent Python environments prevent silent dependency drift and reduce debug time.

## Naming Convention

Use one environment per project or per major experiment track.

Example:

```text
triwei-llm-core
triwei-diffusion-lab
triwei-rag-stack
```

## Base Workflow

1. Create the environment.
2. Install only required dependencies.
3. Freeze versions after successful runs.
4. Record upgrades in a short changelog section.

## Reset Rule

If dependency conflicts stack up, create a fresh environment instead of patching repeatedly.
