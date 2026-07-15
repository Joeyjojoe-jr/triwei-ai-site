# Codex Task: TriWei AI Reality Ledger — Autonomous Coding Agents Public Demo v0.5

## Controlling instruction

Build a static public demo page for **TriWei AI Reality Ledger — Autonomous Coding Agents** in this repository.

This is a Codex implementation task. Do **not** deploy. Do **not** merge. Do **not** push to `main`. Work on the current task branch and stop after creating the local demo page plus a completion report.

## Repository context

This repository is the TriWei AI GitHub Pages / Jekyll site. The README describes it as a self-updating Jekyll site for `triwei.ai`.

Prefer a Jekyll-compatible static implementation. If the project structure makes another path clearly better, document the reason in `CODEX_COMPLETION_REPORT.md`.

Recommended output path:

```text
ai-reality-ledger/autonomous-coding-agents/index.html
```

If Jekyll/GitHub Pages routing requires a different path, use the repo convention and document it.

## Hard scope limits

Build **one page only**:

```text
TriWei AI Reality Ledger — Autonomous Coding Agents
```

Do not add:

- more capability pages,
- public leaderboards,
- rankings of people,
- comments,
- user voting,
- automated scraping,
- automated forecast scoring,
- deployment changes,
- secrets,
- external API calls.

## Product goal

The page must help a non-expert understand this in about 60 seconds:

> Autonomous coding agents moved from real-world software-engineering benchmarks in 2023, to high-profile demos in 2024, to public productization in 2025, and early adoption or impact evidence in 2026. The evidence supports that the capability is real and useful for bounded software tasks under human review. It does **not** prove broad replacement of software engineers.

## Required page sections, in order

### 1. Hero / status card

Include:

```text
Title: AI Reality Ledger: Autonomous Coding Agents
Current status: Public products + early adoption evidence; not proven software-engineer replacement.
Maturity: Productized, but reliability- and measurement-constrained.
Evidence strength: Moderate-high, with vendor/adoption caveats.
Last updated: July 2026
```

### 2. 60-second summary

Use this copy, or a very close improvement:

```text
Autonomous coding agents moved from real-world software-engineering benchmarks in 2023, to high-profile demos in 2024, to public productization in 2025, and early adoption or impact evidence in 2026. The evidence supports that the capability is real and useful for bounded software tasks under human review. It does not prove broad replacement of software engineers.
```

### 3. Stage-lane lifecycle visualization

This is the main object on the page. It must not feel like ordinary prose with decorative cards.

Required visual grammar:

```text
X-axis = time from 2022 to 2026
Y-axis = lifecycle stage lanes
Node = dated evidence-backed event
Cluster = dense period, especially 2025 productization
Warning marker = setback / caveat / limitation
Badge = source grade and evidence type
Forecast lane = placeholder only; no people are scored yet
```

Required lanes:

```text
Precursor / adjacent
Research / benchmark
Prototype / demo
Productization
Setbacks / limits
Adoption / impact
Forecast overlay
```

The chart must make these facts visually obvious:

```text
2023 = research / benchmark anchor
2024 = demo / prototype moment
2025 = productization cluster
2025–2026 = caveats and measurement limits
2026 = early adoption / impact evidence
```

Do not rely on color alone. Use lane labels, text labels, node shapes, icons/symbols, and badges.

### 4. Clickable evidence details

Each node or cluster must reveal details through an accessible drawer, expandable panel, or `<details>` element.

Each event detail must include:

```text
Event title
Date
Lifecycle stage
Why it matters
Source type
Evidence grade
Confidence
Freshness
Caveat
What this does not prove
```

### 5. What this does not prove

Include exactly these bullets:

```text
- AI has broadly replaced software engineers.
- Agents can reliably handle all real-world codebases.
- Product launches equal durable adoption.
- Vendor-reported usage equals independent proof.
- More merged pull requests always means more business value.
```

### 6. Source audit table

Include a table with these columns:

```text
Date
Event
Stage
Source type
Evidence grade
Confidence
Freshness
Caveat
Source link or citation label
```

### 7. Correction / review policy

Use this copy, or a very close improvement:

```text
If a source, stage assignment, caveat, or interpretation appears wrong, TriWei should review primary evidence, update the event record, and preserve a visible changelog. This page scores evidence about a capability, not the worth or intelligence of any person.
```

### 8. Footer

Include a note that forecast scoring is intentionally deferred until exact public quotes are collected and reviewed.

## Minimum event dataset

Use this dataset directly unless the repo already contains a better reviewed event ledger.

| Date | Event | Stage | Source type | Evidence grade | Confidence | Freshness | Caveat | What this does not prove |
|---|---|---|---|---|---|---|---|---|
| 2021-06 | GitHub Copilot technical preview | Precursor / adjacent | Vendor product announcement | A | High | Historical | Copilot-style assistance is a precursor, not an autonomous coding agent. | Does not prove delegated autonomous software work. |
| 2023-10 | SWE-bench introduced | Research / benchmark | Academic / benchmark paper | A | High | Historical anchor | Benchmark performance is not product adoption. | Does not prove users can rely on agents in production. |
| 2024-03 | Devin demo / early access | Prototype / demo | Vendor demo / early access | A | Medium-high | Historical | Demo and early access are not broad adoption. | Does not prove general replacement of engineers. |
| 2025-05 | Codex research preview | Productization | Vendor product preview | A | High | Historical | Research preview; human review remains required. | Does not prove mature autonomy. |
| 2025-05 | Claude Code general availability | Productization | Vendor product announcement | A | High | Historical | General availability is not independent adoption proof. | Does not prove labor replacement. |
| 2025-09 | GitHub Copilot coding agent generally available | Productization | Vendor product announcement | A | High | Historical | Paid availability is not broad labor impact. | Does not prove replacement of software teams. |
| 2025-07 | METR early-2025 slowdown result | Setbacks / limits | Independent measurement study | A | Medium | Historical / time-sensitive | Result was time-bounded and fast-moving tools may make it stale. | Does not prove AI tools are generally harmful or useless. |
| 2026-02 | METR update | Setbacks / limits | Independent measurement update | A | Medium | Current-ish / time-sensitive | Measurement became harder as tools changed and adoption broadened. | Does not prove precise current productivity impact. |
| 2026-06 | Claude Code usage report | Adoption / impact | Vendor telemetry / report | A for company report; Medium for generalization | Medium | Current-ish | Company-reported usage is not neutral third-party evidence. | Does not prove independent productivity gains. |
| 2026-07 | Microsoft rollout study | Adoption / impact | Organizational rollout study | A | Medium-high | Current | Merged PRs are a proxy for output/value, not full business impact. | Does not prove net value in every environment. |

## Suggested source links

Use normal outbound links in the source audit table where appropriate:

```text
GitHub Copilot preview: https://github.blog/2021-06-29-introducing-github-copilot-ai-pair-programmer/
SWE-bench: https://www.swebench.com/original.html
Devin demo: https://www.cognition.ai/blog/introducing-devin
Codex preview: https://openai.com/index/introducing-codex/
Claude Code GA: https://www.anthropic.com/news/claude-4
GitHub Copilot coding agent GA: https://github.blog/changelog/2025-09-25-copilot-coding-agent-is-now-generally-available/
METR early-2025 study: https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
METR update: https://metr.org/blog/2026-02-24-uplift-update/
Claude Code usage report: https://www.anthropic.com/research/claude-code-expertise
Microsoft rollout study: https://arxiv.org/abs/2607.01418
```

If a link is unavailable or not used, document that in `CODEX_COMPLETION_REPORT.md`.

## Visual quality requirements

The visualization must be the main object, not decoration.

Requirements:

- Stage lanes are immediately visible.
- Timeline years are clearly visible.
- 2025 productization appears as a cluster or visually dense transition.
- Setbacks appear as caveats, not total regression.
- Adoption / impact is visually separate from product launch.
- Forecast lane is explicitly a placeholder.
- Labels are readable on desktop and mobile.
- Do not show all explanatory text directly inside the chart if it harms readability; use expandable details.

## Accessibility requirements

- Keyboard-accessible expansion for every node or cluster.
- Visible focus styles.
- Responsive mobile and desktop layout.
- Text labels for all stage markers.
- Sufficient contrast.
- No information conveyed by color alone.
- No tiny unreadable labels.

## Verification commands

Inspect the repo before choosing commands:

```bash
ls
cat README.md
find . -maxdepth 2 -name 'package.json' -o -name 'Gemfile' -o -name '_config.yml'
```

Then run the relevant available checks. Likely for this Jekyll site:

```bash
bundle exec jekyll build
```

If dependencies are missing, try the repo’s documented setup first. Do not invent success. Capture the actual command outputs or failures in `CODEX_COMPLETION_REPORT.md`.

## Required completion report

Create this file:

```text
codex_tasks/ai-reality-ledger-autonomous-coding-agents/CODEX_COMPLETION_REPORT.md
```

It must include:

```text
1. Files changed
2. What was built
3. Source artifacts found or missing
4. Verification commands run
5. Command outputs or summarized results
6. Known limitations
7. Whether the page is ready for human review
8. Any risks or questions
```

## Acceptance criteria

Before finishing, self-check against this list:

```text
[ ] Page exists and can be opened locally.
[ ] Stage-lane lifecycle visualization is visible without excessive desktop scrolling.
[ ] 2025 productization cluster is visually obvious.
[ ] Setbacks appear as caveats, not total regression.
[ ] Adoption / impact is visually separate from product launch.
[ ] Forecast lane is explicitly a placeholder and does not score people.
[ ] Every event has an evidence detail panel/drawer/expandable block.
[ ] Page includes the required “what this does not prove” section.
[ ] Page includes source audit table.
[ ] Page includes correction/review policy.
[ ] Page is keyboard-accessible enough for review.
[ ] Build/check command was run or failure was documented.
[ ] Completion report was created.
```

If any acceptance criterion fails, fix it before finishing, or mark it clearly in the completion report.

## Final instruction

Stop after implementing the local demo page and completion report. Do not deploy, merge, or expand scope.
