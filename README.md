# TriWei AI

A lightweight Jekyll site for a blog plus small, replayable games. Built to run on free GitHub Pages with a custom domain.

## Publish a new post

1. Create a Markdown file in `_posts/` named `YYYY-MM-DD-title.md`.
2. Include front matter like this:

```yaml
---
layout: post
title: "Your Post Title"
date: 2026-02-09
categories: update
---
```

3. Commit and push. GitHub Pages will rebuild automatically.

## Add a new game

1. Create a folder under `games/` with an `index.html`.
2. Add front matter so Jekyll renders it:

```yaml
---
layout: default
title: Your Game Title
permalink: /games/your-game/
---
```

3. Link it from `games/index.md`.

## Local preview (optional)

If you want to preview locally, install Ruby + Jekyll and run:

```bash
bundle exec jekyll serve
```

## Custom domain

`CNAME` is set to `www.triwei.ai`. Point your domain to GitHub Pages and enable Pages in the repo settings.

## Repo layout

- `_layouts/`, `_includes/` - Jekyll templates
- `assets/` - styles, images, and local fonts
- `_posts/` - blog posts
- `games/` - mini-games
