# Contributing to TriWei AI

This repository publishes `triwei.ai` as a GitHub Pages-compatible Jekyll site.

## Ground Rules

- Keep changes small, focused, and reversible.
- Do not rewrite unrelated sections when making a targeted update.
- Use GitHub Pages-safe paths and Liquid links:
  - Preferred: `{{ '/path/' | relative_url }}`
- Do not introduce new build frameworks or backend services.
- Do not delete existing user content without explicit confirmation.

## Repository Model

- Jekyll content and layouts drive the live site.
- Core collections:
  - `_experiments/`
  - `_guides/`
  - `_knowledge/`
  - `_blog/`
- Shared UI files:
  - `_includes/`
  - `_layouts/`
  - `assets/css/style.css`
- Games live under:
  - `games/` (hub + one folder per game)

## Making Changes

1. Confirm target files exist before editing.
2. Edit only the subsystem you are working on.
3. Keep route/permalink consistency:
   - Game page path: `games/<slug>/index.html`
   - Game permalink: `/games/<slug>/`
4. Preserve relative links and accessibility attributes where present.
5. Prefer scoped changes over global refactors.

## Adding or Updating Games

1. Create or edit `games/<slug>/index.html`.
2. Include front matter:
   - `layout: default`
   - `title: <Game Name>`
   - `permalink: /games/<slug>/`
3. Keep each game self-contained (HTML/CSS/JS in page unless a shared asset is intentionally needed).
4. Add a back link to the games hub:
   - `{{ '/games/' | relative_url }}`
5. Add or update the game entry in `games/manifest.json`.
   - Optional but recommended: set `added: YYYY-MM-DD` to power `/games/` "New" badges.
6. Do not hand-edit tiles in `games/index.md`:
   - The hub auto-renders from `_data/games_manifest.json`.
   - New manifest entries appear automatically on `/games/`.
7. For card copy/art overrides, edit `games/card_overrides.json` keyed by slug.
8. Validation auto-sync:
   - `npm run check:games` now runs `sync:games-data` automatically first.

## Validation Checklist (Before PR)

- Does it load?
  - All changed pages open.
  - No missing local asset paths.
- Does it run?
  - Changed scripts parse without syntax errors.
  - Interactive behavior works for changed pages.
- Route/path integrity:
  - Header/footer links still resolve.
  - `/games/` links resolve to existing game folders.
  - Game permalinks match folder names.
- Accessibility:
  - Keyboard navigation still works for changed controls.
  - Focus visibility remains clear.
  - ARIA/live-region usage remains valid where applicable.
- Local checks:
  - `npm run check:games`
  - `npm run check:links`
  - or run both with `npm run check:site`

## Pull Request Expectations

- Describe exactly what changed and why.
- List files touched and route impacts.
- Include manual verification notes:
  - pages checked
  - interactions tested
  - path checks performed
- Keep PRs narrow; split unrelated work into separate PRs.
