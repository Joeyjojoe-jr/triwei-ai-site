# TriWei AI — AI news & trends tracker

A self-updating [Jekyll](https://jekyllrb.com/) site (GitHub Pages) that tracks
the hot topics and trends in AI news, and reads every story through an **ethics
lens**. Live at [triwei.ai](https://triwei.ai).

## How it updates itself

A GitHub Action (`.github/workflows/update-news.yml`) runs every 6 hours:

1. `scripts/fetch_news.py` pulls AI feeds across five categories
   (Labs & Industry, Research & Papers, Community, Business & Funding, Ethics),
   dedupes them, ranks trending topics, and tags each story with any ethical
   dimensions it touches (bias, safety, privacy, copyright, labor, energy,
   regulation, and more).
2. Results are written to `_data/news.json`; the Industry Atlas builder combines
   that coverage with public Census and Epoch AI datasets, current first-party
   API pricing, and primary-source hardware and Frontier Diffusion watches.
3. The workflow commits the file; GitHub Pages rebuilds the site.

The script uses only the Python standard library, so no extra installs are needed.

## Layout

- `_layouts/home.html` — the live dashboard (trending, ethics watch, categories).
- `industry.md` → `/industry/` — five-part AI Industry Atlas plus physical supply-chain and Frontier Diffusion watches.
- `signals.md` → `/signals/` — source-linked historical threads connecting early signals to later evidence without a prediction scorecard.
- `hardware.md` → `/hardware/` — GPU and memory comparison, material 5W1H, fab timelines, and factory-conversion economics.
- `ethics.md` → `/ethics/` — full Ethics Watch.
- `sources.md` → `/sources/` — sources and methodology.
- `about.md` → `/about/` — what the site is.
- `_data/news.json` — machine-generated data the site renders.
- `_data/industry.json` — generated coverage and industry measures for the atlas.
- `_data/topic_history.json` — rolling 90-day topic aggregates.
- `_data/diffusion_history.json` — rolling one-year model-diffusion coverage signals.
- `_data/model_api_prices.json` — source-dated first-party API price ledger with an explicit freshness limit.
- `_data/signals.json` — curated historical signal threads and early-read profiles.
- `_data/hardware.json` — source-dated hardware specifications, production inputs, and fab projects.
- `scripts/fetch_news.py` — the aggregator.
- `scripts/build_industry_data.py` — the Industry Atlas data builder.

## Running locally

```bash
bundle install
python scripts/fetch_news.py        # refresh _data/news.json
python scripts/build_industry_data.py # refresh Industry Atlas data
bundle exec jekyll serve            # preview the site
```

## Tuning

- Edit the `FEEDS` dict in `scripts/fetch_news.py` to add/remove sources.
- Edit `ETHICS_THEMES` to adjust the ethics lens.
- Change the cron in `.github/workflows/update-news.yml` for a different cadence.
