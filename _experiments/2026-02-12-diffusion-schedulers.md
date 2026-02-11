---
layout: post
title: "Diffusion Schedulers: A Quick Comparison"
date: 2026-02-12
permalink: /experiments/diffusion-schedulers/
tags:
  - diffusion
  - sampling
  - image-generation
---
<!-- Keep this template style for future diffusion tests. -->
This note compares DDIM, Euler, and DPM++ schedulers on image quality, speed, and prompt consistency for the same checkpoint and seed set.

## Goal

Identify a scheduler default that balances quality and generation speed for daily experimentation.

## Test Setup

- Model: SDXL base checkpoint
- Prompt set: 20 prompts across portrait, product, and environment categories
- Seed policy: fixed seed list for cross-scheduler comparison
- Step counts tested: 20, 30, 40

## Early Readout

Euler produced faster iterations for ideation, while DPM++ gave more consistent fine detail at higher step counts.

## Next Step

Add a prompt adherence scoring rubric and compare results across two CFG ranges.
