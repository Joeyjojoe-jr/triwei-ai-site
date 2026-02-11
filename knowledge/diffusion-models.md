---
layout: page
title: "Diffusion Models"
permalink: /knowledge/diffusion-models/
description: Core ideas behind denoising-based image generation.
---
<!-- Knowledge pages should focus on one topic each for easier expansion. -->
Diffusion models learn to reverse a noising process, turning random noise into coherent data such as images.

## Key Ideas

- Forward process: gradually add noise to training data.
- Reverse process: train a model to remove noise step by step.
- Sampling quality is influenced by scheduler, step count, and guidance scale.

## Why It Matters

Diffusion is currently one of the most practical approaches for controllable image synthesis.
