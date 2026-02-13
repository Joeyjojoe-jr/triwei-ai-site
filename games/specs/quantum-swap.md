---
layout: game_spec
title: "Quantum Swap - Mini Spec"
slug: quantum-swap
kind: game
game_url: /games/quantum-swap/
permalink: /games/specs/quantum-swap/
tags: ['matrix', 'permutation', 'puzzle']
difficulty: medium
session_length: "3-7 min"
last_reviewed: 2026-02-13
asset_budget:
  initial_transfer_kb: 300
  interactive_transfer_kb: 1200
  max_runtime_ram_mb: 150
  max_gpu_tex_mb: 64
---

## Overview
Rotate rows and columns to match a target matrix.

## Learning Lens
Focus on matrix, permutation, puzzle and how local actions shape global behavior.

## Controls
Controls are provided by page-level buttons/inputs and support keyboard + pointer/touch where implemented.

## Core Loop
Initialize state, process user input, update simulation/model state, and render metrics for immediate feedback.

## Scoring and Metrics
Primary score/loss metrics are shown in each page HUD or metrics panel and should remain stable across resets.

## Failure States
Failure is either explicit run termination (arcade style) or numerical/logic divergence in labs. Recovery is via reset.

## Determinism and Randomness
Manifest flag: uses_randomness=true. Pages with randomness should expose seeded reset behavior via TWGame hooks.

## Instrumentation Contract
Expose compact JSON-safe metrics through `TWGame.setInspector(() => ({ ... }))` and keep payload lightweight.

## Accessibility Notes
- Keep focus-visible styles enabled for all interactive controls.
- Keep status text in polite live regions where metrics update rapidly.
- Preserve keyboard parity for core interactions.
- Validate controls on narrow mobile widths (~390px).

## Asset Packs
### Required Packs
- `core-ui`

### Optional Packs (after_start)
- Cosmetic and non-critical assets should remain deferred until after first playable moment.

### Largest Single Asset
- Declared unique asset: `games/quantum-swap/index.html`

## Test Checklist
- [ ] Load page and verify no console errors.
- [ ] Run one full interaction cycle (play/train/solve).
- [ ] Verify reset works without page reload.
- [ ] Verify keyboard-only interaction for primary controls.
- [ ] Toggle inspector with I and confirm payload updates.
- [ ] Check mobile viewport (~390px width).
- [ ] Validate reduced-motion behavior if animations are present.
- [ ] Validate Back to Games and Specs navigation links.
