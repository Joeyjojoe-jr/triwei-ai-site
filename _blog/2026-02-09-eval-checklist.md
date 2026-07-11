---
layout: post
title: "Model Eval Checklist"
date: 2026-02-09
tags:
  - evaluation
  - quality
---
Before shipping any workflow update, I run a lightweight evaluation pass to prevent regressions.

## Baseline Steps

1. Test against a fixed set of representative prompts.
2. Track correctness, latency, and failure modes.
3. Compare against the previous known-good version.

## Rule

If a change improves one metric while harming another, document the tradeoff before adopting it.
