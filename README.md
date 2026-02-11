# TriWei AI Explorer Hub

<!-- README guide: edit this file whenever your workflow changes. -->
This repository is a GitHub Pages-compatible Jekyll Explorer Hub designed for Markdown-first updates.

## Structure Overview

```text
_experiments/           # Experiment notes (collection, auto-listed)
blog/                   # Blog notes (Markdown pages)
guides/                 # Step-by-step guides (Markdown pages)
knowledge/              # Concept map pages (Markdown pages)
_layouts/               # Jekyll layouts
_includes/              # Shared header/footer/head
assets/css/style.css    # Global styling
index.md                # Homepage entry point (uses home layout)
```

## Add a New Experiment

1. Create a new file in `_experiments/` named `YYYY-MM-DD-topic.md`.
2. Add front matter:

```yaml
---
layout: post
title: "Your Experiment Title"
date: 2026-02-20
permalink: /experiments/your-experiment-slug/
tags:
  - tag-one
  - tag-two
---
```

3. Write your note in Markdown.
4. Commit and push. It appears in:
   - Homepage Featured Experiment (if most recent)
   - `/experiments/` index page

## Add a New Blog Note

1. Create a Markdown file in `/blog/` (for example: `2026-02-20-iteration-note.md`).
2. Add front matter:

```yaml
---
layout: post
title: "Iteration Note"
date: 2026-02-20
permalink: /blog/iteration-note/
tags:
  - reflection
---
```

3. Commit and push. It appears in:
   - Homepage Latest Notes feed
   - `/blog/` index page

## Add a New Guide

1. Create a Markdown file in `/guides/`.
2. Add front matter:

```yaml
---
layout: page
title: "Guide Title"
permalink: /guides/guide-slug/
description: One-line summary.
---
```

3. Commit and push. It appears in `/guides/` automatically.

## Add a New Knowledge Page

1. Create a Markdown file in `/knowledge/`.
2. Add front matter:

```yaml
---
layout: page
title: "Topic Name"
permalink: /knowledge/topic-name/
description: One-line concept summary.
---
```

3. Commit and push. It appears in:
   - Homepage Knowledge Map grid
   - `/knowledge/` index page

## Customize Design

- Edit `assets/css/style.css` color variables at the top of the file.
- Update nav links in `_includes/header.html`.
- Update homepage section content in `_layouts/home.html`.

## Local Preview (Optional)

If you have Ruby + Bundler + Jekyll installed:

```bash
bundle exec jekyll serve
```

Then open `http://127.0.0.1:4000`.

## GitHub Pages Compatibility Notes

- Uses only GitHub Pages-supported plugins (`jekyll-feed`, `jekyll-seo-tag`, `jekyll-sitemap`).
- No external build tools required.
- All primary content is Markdown-driven.
