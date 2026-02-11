---
layout: page
title: "Diffusion Models"
description: Core ideas behind denoising-based image generation.
---
Diffusion models learn to reverse a noising process, turning random noise into coherent data such as images.

## Key Ideas

- Forward process: gradually add noise to training data.
- Reverse process: train a model to remove noise step by step.
- Sampling quality depends on scheduler, step count, and guidance scale.

## Why It Matters

Diffusion remains one of the most practical approaches for controllable image synthesis.
