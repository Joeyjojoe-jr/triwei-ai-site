# Site Structure

This document describes the current repository layout for `triwei.ai`.

## Top-Level Structure

```text
/
|-- _blog/
|-- _experiments/
|-- _guides/
|-- _knowledge/
|-- _posts/
|-- _includes/
|-- _layouts/
|-- assets/
|-- games/
|-- scripts/          (excluded from Jekyll build)
|-- src/              (excluded from Jekyll build)
|-- public/           (excluded from Jekyll build)
|-- _config.yml
|-- index.md
|-- experiments.md
|-- guides.md
|-- knowledge.md
|-- blog.md
|-- about.md
|-- contact.md
|-- 404.html
|-- CNAME
|-- robots.txt
|-- site.webmanifest
|-- README.md
|-- CONTRIBUTING.md
|-- DEVELOPER_GUIDE.md
```

## Jekyll Runtime Areas

- `_config.yml`: Jekyll config, collections, defaults, and excludes.
- `_includes/`: shared partials used across layouts.
  - `head.html`
  - `header.html`
  - `footer.html`
- `_layouts/`: page templates.
  - `default.html`
  - `home.html`
  - `page.html`
  - `post.html`
- `assets/`: shared static assets.
  - `assets/css/style.css`
  - `assets/fonts/*`
  - `assets/images/*`

## Content Collections

- `_experiments/` -> `/experiments/.../`
- `_guides/` -> `/guides/.../`
- `_knowledge/` -> `/knowledge/.../`
- `_blog/` -> `/blog/.../`

## Entry Pages

- `index.md` -> `/`
- `experiments.md` -> `/experiments/`
- `guides.md` -> `/guides/`
- `knowledge.md` -> `/knowledge/`
- `blog.md` -> `/blog/`
- `about.md` -> `/about/`
- `contact.md` -> `/contact/`

## Games Section

Hub:

- `games/index.md` -> `/games/`
- `games/manifest.json` -> canonical game list for local test tooling

Game directories (each contains `index.html` with permalink `/games/<slug>/`):

- `games/orbit-runner/`
- `games/circuit-flip/`
- `games/signal-drift/`
- `games/vector-vault/`
- `games/logic-lattice/`
- `games/flux-line/`
- `games/pulse-stack/`
- `games/grid-hopper/`
- `games/echo-trace/`
- `games/pattern-relay/`
- `games/tempo-matrix/`
- `games/quantum-swap/`

## Navigation Control Points

- Primary nav: `_includes/header.html`
- Footer nav: `_includes/footer.html`
- Shared page wrapper and global scripts: `_layouts/default.html`

## Tooling Files (Not Used by Jekyll Output)

These exist in the repo but are excluded in `_config.yml`:

- `src/`
- `public/`
- `scripts/`
- `package.json`
- `package-lock.json`
- `postcss.config.cjs`
- `tailwind.config.mjs`
- `astro.config.mjs`

Local verification scripts:

- `scripts/sanity_check_games.mjs`
- `scripts/broken_link_detector.mjs`
