---
layout: page
title: Sources & Method
permalink: /sources/
description: How TriWei separates reviewed evidence records, source-attributed claims, editorial synthesis, uncertainty, and automated news leads.
---

TriWei AI is a two-layer public information site:

1. The **Evidence Desk** contains small, manually reviewed, source-linked records about specific dated events.
2. The **automated coverage inbox** collects current headlines and tags them as leads for inspection.

The two layers are deliberately separate. A topic appearing frequently in the coverage inbox does not make it true, important, ethical, unethical, safe, unsafe, or worthy of promotion.

## Evidence Desk publication standard

A homepage Evidence Desk record must identify:

- a concrete dated event rather than only a person, organization, or broad topic;
- the type and role of the source;
- a concise independently written factual record;
- a clearly labeled **TriWei system context**;
- an explicit statement of what the record does **not** establish;
- the date TriWei last checked the source; and
- a link to the original source and any deeper TriWei tracker.

Automated feeds can surface candidates, but they cannot publish an Evidence Desk record. A record is added only after its source, wording, attribution, date, and limits are reviewed.

### Evidence classes

- **Developer announcement** — records what a developer states or promises. It is not treated as independent verification.
- **Released artifact** — records a cited public checkpoint, repository, paper, filing, or comparable artifact that was available when checked.
- **Provider-attributed claim** — records an allegation or attribution by the named organization. It is not presented as an independent adjudication.
- **Public law or regulation** — records a legal or regulatory event from a public institution. TriWei does not provide individualized legal advice.
- **Company project disclosure** — records a company's statement about a physical project, investment, status, or target. Future schedules, output, and economics remain contingent.

Inclusion is not endorsement, ranking, prediction, investment advice, legal advice, or a declaration that a disputed matter has been finally resolved.

## Attribution and responsible use of sources

TriWei links to the original source and writes concise original summaries. It does not copy article bodies, imply publisher or author endorsement, or claim ownership of third-party research, reporting, names, logos, or marks.

Direct quotations should be used sparingly and only when the exact wording is necessary. Most entries should paraphrase the source while preserving attribution and uncertainty. Links are provided so readers can inspect the underlying material and context.

## AI-assisted work

TriWei uses AI-assisted research and coding in parts of site development. AI tools may help locate candidate sources, structure records, test data, draft language, and identify possible omissions. AI assistance is disclosed because it can introduce errors.

No live model decides truth, importance, legal merit, ethical merit, or source reliability when the page loads. Reviewed static records and explicit rules control the published Evidence Desk.

## Automated coverage inbox

A scheduled GitHub Actions job refreshes the coverage inbox. It pulls headlines from a range of feeds, removes exact and near-duplicate articles, identifies recurring terms, and applies keyword-based ethics tags.

The coverage inbox is a discovery tool, not an editorial verdict:

- recurrence measures this site's collected sample, not real-world importance;
- multiple links do not prove source independence;
- an ethics tag is a signpost, not a finding of wrongdoing;
- a headline or feed summary may omit material context;
- folder placement does not endorse or condemn the subject; and
- automated collection does not convert reporting into a TriWei factual record.

## What the automated inbox tracks

- **Labs & Industry** — releases and moves from AI developers and the surrounding technology industry.
- **Research & Papers** — work from arXiv and coverage of models, methods, and benchmarks.
- **Community & Discussion** — practitioner and public discussion from selected forums.
- **Business & Funding** — companies, funding, acquisitions, chips, and market activity.
- **Ethics & Society** — regulation, copyright, safety, privacy, bias, labor, governance, and related human impacts.

## The ethics lens

Each collected story is screened against themes including Bias & Fairness, Privacy & Surveillance, Safety & Alignment, Misinformation & Deepfakes, Copyright & IP, Labor & Jobs, Energy & Environment, Regulation & Governance, Transparency & Accountability, and Autonomy & Weapons.

The screening is keyword-based. It is a fast first pass that helps readers locate relevant material; it is not a legal conclusion, moral judgment, or factual determination.

## Industry Atlas data

The [AI Industry Atlas](/industry/) keeps coverage signals and industry measures visibly separate:

- **Momentum and industry stack** use TriWei's deduplicated story sample. They describe this site's coverage, not market share or company performance.
- **Business adoption** comes from the U.S. Census Bureau's [Business Trends and Outlook Survey](https://www.census.gov/hfp/btos/data_downloads).
- **Current model API cost** uses source-dated first-party price pages. Price is not equated with capability, quality, safety, or value.
- **Historical model value** retains the reproducible dataset behind Epoch AI's [LLM inference price analysis](https://epoch.ai/data-insights/llm-inference-price-trends) and labels its historical endpoint.
- **Lab economics** uses Epoch AI's [AI Companies dataset](https://epoch.ai/data/ai-companies), with visible limits around private-company estimates and comparability.

## Physical AI Supply-Chain Watch

The supply-chain map follows critical materials, silicon wafers, fab tools, accelerator dies, HBM, advanced packaging, servers and computers, and destination markets. It is a dated evidence ledger, not a claim that every vendor or shipment follows one route.

Current institutional, geological, company, and regulatory sources are linked in the ledger. Representative companies illustrate a production stage; they are not a complete supplier list or market-share estimate.

## Frontier Diffusion Watch

The diffusion watch keeps evidence classes separate:

- developer-disclosed distillation;
- provider-attributed extraction claims;
- publicly released checkpoints;
- future release announcements; and
- current media coverage.

Benchmark similarity, answer style, timing, or media repetition alone is never treated as proof of model lineage.

## Signal History

[Signal History](/signals/) is an AI-assisted, curated lookback ledger, not an automated verdict on who predicted the future.

Later events may **strengthen**, **complicate**, or **redirect** an earlier framing. Those relationship labels are TriWei synthesis. They do not mean the earlier author was simply right or wrong, and they do not imply publisher, author, or independent fact-checker endorsement.

## AI Hardware intelligence

[AI Hardware](/hardware/) separates memory capacity, memory bandwidth, compute engines, interconnect, power and cooling, and software support. It does not collapse unlike products into one universal score.

Product specifications, materials, and fab projects are stored in a dated static ledger with verification deadlines. Vendor specifications and schedules do not certify actual application performance, street price, availability, future output, or project completion.

## Corrections and revisions

TriWei treats correction as part of the evidence record, not as an embarrassment to hide.

Material changes should be classified as one of the following:

- **Correction** — a published factual statement was wrong.
- **Clarification** — the wording was technically defensible but materially ambiguous or incomplete.
- **Source update** — the underlying source changed, disappeared, or was superseded.
- **Evidence update** — later evidence strengthened, complicated, redirected, or resolved part of a record.
- **Expiry** — a current-data ledger passed its review deadline and must no longer appear current.

A material correction should identify what changed, why it changed, the date of the revision, and the affected record. Minor spelling, formatting, and accessibility repairs may be corrected without a formal log when they do not alter meaning.

The absence of a listed correction is not a claim that the site is error-free. Readers should inspect the original sources and report material problems through the public project repository.
