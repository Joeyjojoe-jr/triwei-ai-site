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

External sections keep the last successfully retrieved snapshot if a source is temporarily unavailable. Every chart shows its definition, source, freshness, and a tabular alternative.
