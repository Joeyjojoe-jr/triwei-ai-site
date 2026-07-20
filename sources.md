---
layout: page
title: Sources & Method
permalink: /sources/
description: Where TriWei AI's news comes from and how trending topics and the ethics lens are computed.
---
TriWei AI is an automated tracker for AI news, trends, and hot topics. It refreshes on its own and reads every story through an ethics lens.

## How it works

A scheduled job runs every six hours (via GitHub Actions). It pulls headlines from a spread of AI sources, removes exact and near-duplicate articles across all folders, ranks the topics appearing most often, tags each story with any ethical dimensions it touches, and writes the results to a data file the site renders. The duplicate check is deliberately conservative: lightly rewritten or syndicated copies are collapsed, while reporting that adds a distinct angle—such as safety, copyright, pricing, or impact—can remain. No story is written by hand — the page reflects whatever the feeds are surfacing right now.

## What it tracks

- **Labs & Industry** — releases and moves from OpenAI, Anthropic, Google DeepMind, Meta, Mistral, Nvidia and others, plus mainstream tech press.
- **Research & Papers** — new work from arXiv (cs.AI, cs.LG, cs.CL) and coverage of notable models and benchmarks.
- **Community & Discussion** — what practitioners are talking about on Hacker News and machine-learning forums.
- **Business & Funding** — startups, funding rounds, acquisitions, chips, and market moves.
- **Ethics & Society** — regulation, copyright, safety, privacy, bias, labor, and governance.

## The ethics lens

Each story is screened against a set of ethical themes: Bias & Fairness, Privacy & Surveillance, Safety & Alignment, Misinformation & Deepfakes, Copyright & IP, Labor & Jobs, Energy & Environment, Regulation & Governance, Transparency & Accountability, and Autonomy & Weapons. Stories that match one or more are collected on the Ethics Watch page and tagged inline everywhere they appear.

## A note on automation

Topic ranking and ethics tagging are keyword-based, so they are a fast first pass, not a substitute for judgment. Treat the tags as signposts pointing you toward stories worth a closer, critical read.

## Industry Atlas data

The [AI Industry Atlas](/industry/) keeps coverage signals and industry measures visibly separate:

- **Momentum and industry stack** use TriWei's deduplicated story sample. They describe this site's coverage, not market share or company performance. Daily topic aggregates are retained for up to 90 days.
- **Business adoption** comes from the U.S. Census Bureau's [Business Trends and Outlook Survey](https://www.census.gov/hfp/btos/data_downloads). The chart uses the latest sector estimates under the AI question wording introduced in November 2025 and does not splice them onto the older series.
- **Model value** uses the reproducible dataset behind Epoch AI's [LLM inference price analysis](https://epoch.ai/data-insights/llm-inference-price-trends). Price is a 3:1 weighted average of input and output token prices; benchmark performance is informative but not a complete measure of model usefulness.
- **Lab economics** uses Epoch AI's [AI Companies dataset](https://epoch.ai/data/ai-companies). Private-company revenue, funding, and staffing figures may combine disclosures and credible public estimates, so confidence and comparability are limited.

## Frontier Diffusion Watch

The strategic watch tracks China-based labs, model distillation, output extraction claims, capability convergence, and open-weight releases. A dedicated news query expands the live coverage sample, while a rolling one-year aggregate preserves the signal over time.

The evidence timeline uses primary sources and keeps four classes separate:

- **Developer disclosure** records teacher models or training methods identified by the developer, such as the [DeepSeek-R1 distillation releases](https://github.com/deepseek-ai/DeepSeek-R1).
- **Provider-attributed claim** records a named provider's published attribution, including [Anthropic's distillation-attack report](https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks) and [OpenAI's U.S. House committee submission](https://cdn.openai.com/pdf/045aa967-ee96-4a09-94ee-3098ddf6db2c/OpenAI-US-House-Select-Cmte-Update-%5B021226%5D.pdf). These are labeled claims, not independent adjudications.
- **Weights released** requires publicly downloadable checkpoints, as with [Kimi K2](https://github.com/MoonshotAI/Kimi-K2).
- **Weights announced** records a developer commitment that has not yet been verified as a completed release, such as [Kimi K3's July 27 weight-release target](https://www.kimi.com/blog/kimi-k3).

Benchmark similarity, answer style, or release timing alone is never treated as proof of model lineage.

External sections keep the last successfully retrieved snapshot if a source is temporarily unavailable. Every chart shows its definition, source, freshness, and a tabular alternative.
