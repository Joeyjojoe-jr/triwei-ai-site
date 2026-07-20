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
- **Current model API cost** uses prices checked against first-party pages from [OpenAI](https://developers.openai.com/api/docs/pricing), [Anthropic](https://platform.claude.com/docs/en/about-claude/pricing), [Google](https://ai.google.dev/gemini-api/docs/pricing), [xAI](https://docs.x.ai/developers/pricing), [DeepSeek](https://api-docs.deepseek.com/quick_start/pricing/), [Kimi](https://www.kimi.com/blog/kimi-k3), and [Mistral](https://docs.mistral.ai/models/model-cards/mistral-medium-3-5-26-04). The interactive chart changes the input/output token mix but never equates price with capability. A freshness guard pauses the current ranking after 30 days unless the ledger is re-verified.
- **Historical model value** retains the reproducible dataset behind Epoch AI's [LLM inference price analysis](https://epoch.ai/data-insights/llm-inference-price-trends), clearly labeled with its February 2025 endpoint. It is available for historical analysis only, not current buying guidance. For continuously measured independent performance, use the [Artificial Analysis live model index](https://artificialanalysis.ai/models).
- **Lab economics** uses Epoch AI's [AI Companies dataset](https://epoch.ai/data/ai-companies). Private-company revenue, funding, and staffing figures may combine disclosures and credible public estimates, so confidence and comparability are limited.

## Physical AI Supply-Chain Watch

The supply-chain map follows eight production stages: critical materials, silicon wafers, fab tools, accelerator dies, HBM, advanced packaging, servers and computers, and destination markets. It is a dated evidence ledger—not a claim that every vendor or shipment follows one route.

- Critical-material concentration uses the IEA's 2026 [Rare Earth Elements](https://www.iea.org/reports/rare-earth-elements/executive-summary) and [Global Critical Minerals Outlook](https://www.iea.org/reports/global-critical-minerals-outlook-2026/executive-summary). Rare earths are shown as inputs to fab equipment, power, cooling, motors, and related systems; they are not mislabeled as the silicon substrate in a GPU.
- Wafer demand and locations use [SEMI's 2025 shipment report](https://www.semi.org/en/semi-press-release/semi-reports-2025-annual-worldwide-silicon-wafer-shipments-and-revenue-results), [SUMCO](https://www.sumcosi.com/english/), and [Siltronic's 2025 annual report](https://www.siltronic.com/fileadmin/investorrelations/2025/Q4/260312_Siltronic_Annual_Report_2025_safe.pdf).
- Tool, foundry, memory, packaging, and system routes use [ASML's EUV documentation](https://www.asml.com/products/euv-lithography-systems), [TSMC's 2025 annual report](https://investor.tsmc.com/static/annualReports/2025/english/index.html), [NVIDIA's FY2026 Form 10-K](https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm), and supplier disclosures. Representative companies indicate the cluster; they are not a complete supplier list or market-share estimate.
- Destination bars use NVIDIA's disclosed FY2026 revenue by end market as an AI-accelerator demand proxy, not the whole semiconductor market. Its customer-headquarters geography is shown separately because billing address, shipment location, cloud operator, and final end user can differ. Current export-policy gates link to the U.S. Bureau of Industry and Security's [January 2026 China licensing policy](https://www.bis.gov/press-release/department-commerce-revises-license-review-policy-semiconductors-exported-china).

## Frontier Diffusion Watch

The strategic watch tracks China-based labs, model distillation, output extraction claims, capability convergence, and open-weight releases. A dedicated news query expands the live coverage sample, while a rolling one-year aggregate preserves the signal over time.

The evidence timeline uses primary sources and keeps four classes separate:

- **Developer disclosure** records teacher models or training methods identified by the developer, such as the [DeepSeek-R1 distillation releases](https://github.com/deepseek-ai/DeepSeek-R1).
- **Provider-attributed claim** records a named provider's published attribution, including [Anthropic's distillation-attack report](https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks) and [OpenAI's U.S. House committee submission](https://cdn.openai.com/pdf/045aa967-ee96-4a09-94ee-3098ddf6db2c/OpenAI-US-House-Select-Cmte-Update-%5B021226%5D.pdf). These are labeled claims, not independent adjudications.
- **Weights released** requires publicly downloadable checkpoints, as with [Kimi K2](https://github.com/MoonshotAI/Kimi-K2).
- **Weights announced** records a developer commitment that has not yet been verified as a completed release, such as [Kimi K3's July 27 weight-release target](https://www.kimi.com/blog/kimi-k3).

Benchmark similarity, answer style, or release timing alone is never treated as proof of model lineage.

External sections keep the last successfully retrieved snapshot if a source is temporarily unavailable, but current API prices expire visibly instead of silently masquerading as live data. Every chart shows its definition, source, freshness, and a tabular alternative.

## Signal History

The [Signal History](/signals/) is an AI-assisted, curated lookback ledger, not an automated verdict on who predicted the future. Its seed dataset was assembled during site development with an AI research and coding assistant using the sources linked on every node. It is static data: no live model decides truth, confidence, or relevance when the page loads. Each thread begins with an early paper, article, analysis, or opinion and connects it to later events using four editorial relationships: **early signal**, **strengthens**, **complicates**, and **redirects**. A relationship is editorial synthesis meaning the later evidence bears materially on the earlier framing; it does not mean the author was simply “right” or “wrong,” and TriWei does not claim independent fact-checker or publisher endorsement.

Coverage begins in 2010 with [DeepMind's founding history](https://deepmind.google/about/) and includes primary research such as [Attention Is All You Need](https://arxiv.org/abs/1706.03762), early specialist explanations such as Distill's [Attention and Augmented Recurrent Neural Networks](https://distill.pub/2016/augmented-rnns/), reported analysis from outlets including WIRED and Quanta Magazine, product releases, and regulation. The current ledger is a documented seed set, not a claim to index every article published since 2010. Threads and “durable early reads” are selected for specificity, timing, source quality, and the strength of the later evidence trail—not fame or hindsight-friendly wording.

## AI Hardware intelligence

The [AI Hardware](/hardware/) page separates six questions that a single GPU number cannot answer: memory capacity, memory bandwidth, compute engines, interconnect, power and cooling, and software support. Its initial static ledger was researched and structured with AI assistance during site development. Product specifications were checked against first-party sources, including [NVIDIA's GeForce RTX 40 Series specifications](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/), [NVIDIA H200](https://www.nvidia.com/en-us/data-center/h200/), [Apple M4 Max](https://www.apple.com/newsroom/2024/10/apple-introduces-m4-pro-and-m4-max/), and [NVIDIA Grace Hopper](https://developer.nvidia.com/blog/nvidia-grace-hopper-superchip-architecture-in-depth/). The comparator uses fixed browser-side rules: numeric bars are normalized only within the selected pair, text fields receive no synthetic score, and workload buttons highlight manually encoded factors. These displays explain resource gates; they are not workload benchmarks or buying recommendations.

The material ledger uses current institutional and geological sources, including the IEA's [Rare Earth Elements](https://www.iea.org/reports/rare-earth-elements/executive-summary) analysis and the USGS [Mineral Commodity Summaries 2026](https://pubs.usgs.gov/publication/mcs2026). Fab timelines use current company disclosures from TSMC, Intel, Micron, and SK hynix. Announced investment and target dates can move with demand, financing, permitting, construction, tool delivery, qualification, and yield. The page shows its verification date and a 90-day re-check deadline. After that deadline, the rendered page labels the reference as expired, while the strict repository validator rejects it until the ledger is re-checked.
