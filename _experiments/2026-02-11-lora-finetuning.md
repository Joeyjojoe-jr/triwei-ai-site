---
layout: post
title: "LoRA Fine-Tuning Baseline"
date: 2026-02-11
permalink: /experiments/lora-finetuning/
tags:
  - lora
  - finetuning
  - workflow
---
<!-- Duplicate this file pattern to add new experiments in _experiments/. -->
This experiment establishes a baseline LoRA fine-tuning workflow for a small instruction model, with emphasis on repeatability and evaluation quality.

## Goal

Define a small, stable recipe that can be reused for future domain adaptation runs.

## Setup Snapshot

- Base model: 7B instruction-tuned checkpoint
- Dataset size: 5k curated question-answer pairs
- LoRA rank: 16
- Learning rate: 2e-4
- Epochs: 3

## Notes

The first run improved response relevance but overfit style in a few categories. The next iteration should reduce learning rate and introduce stronger validation slicing.

## Next Step

Compare rank 16 vs rank 32 with the same data split and report inference latency impact.
