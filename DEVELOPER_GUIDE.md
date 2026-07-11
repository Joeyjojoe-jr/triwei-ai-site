# Developer Guide

This guide explains how to add and maintain game pages in the TriWei AI site without breaking GitHub Pages routing.

## Stack and Constraints

- Runtime site: Jekyll + GitHub Pages.
- Use relative Liquid links: `{{ '/path/' | relative_url }}`.
- Keep games static and client-side only (no backend dependency).
- Keep each change scoped to one subsystem when possible.

## Game Architecture

Each game is a page under `games/<slug>/index.html` with front matter:

```yaml
---
layout: default
title: Game Name
permalink: /games/<slug>/
description: Short summary.
---
```

Recommended structure inside the file:

1. Local `<style>` block for game-specific UI.
2. Main `<section>` containing:
   - `<h1>` title
   - `Back to Games` link to `{{ '/games/' | relative_url }}`
   - HUD/controls/canvas or board container
3. Inline `<script>` wrapped in an IIFE:
   - `(() => { ... })();`
4. Manifest entry in `games/manifest.json`:
   - `slug`, `title`, `route`, plus optional metadata fields.

## Adding a New Game (Step-by-Step)

1. Create folder and page:
   - `games/<slug>/index.html`
2. Add required front matter (`layout`, `title`, `permalink`).
3. Implement self-contained HTML/CSS/JS for the game.
4. Include a back link:
   - `<a class="text-link" href="{{ '/games/' | relative_url }}">Back to Games</a>`
5. Add/verify manifest record in `games/manifest.json`.
   - Recommended: include `added: YYYY-MM-DD` so the hub can show "New" badges.
6. Do not hand-edit the game tile list in `games/index.md`:
   - The hub auto-renders cards from `_data/games_manifest.json`.
   - Genre filters and card previews are generated from `_data/games_card_overrides.json`.
7. Sync canonical JSON into `_data/`:
   - `npm run sync:games-data`
8. Verify route resolves to a real directory and page.
9. Verify script parses without syntax errors.

## Integrating with Site Navigation

Primary integration points:

- Header nav: `_includes/header.html`
- Footer nav: `_includes/footer.html`
- Games hub: `games/index.md`

When adding a new section-level route, update header/footer only if needed.
For game additions, update canonical JSON under `games/`, then run `npm run sync:games-data`.

## Accessibility Baseline

For each game page:

- Provide clear control instructions in text.
- Use `aria-label` for canvas/interactive controls.
- Add `aria-live="polite"` to HUD/status areas where score/state changes.
- Preserve keyboard controls where present.
- Ensure focus-visible styles remain usable.

## Performance Baseline

- Avoid large external dependencies.
- Keep assets local and route-safe.
- Shared preloads and theme hydration are handled in `_includes/head.html`.

## Analytics Hooks (Client-Side)

Shared analytics hooks are exposed in `window.triweiAnalytics` from `_layouts/default.html`.

Available helpers:

- `window.triweiAnalytics.track(eventName, payload)`
- `window.triweiAnalytics.getEvents()`
- `window.triweiAnalytics.clear()`

Events are stored locally in `localStorage` under:

- `triwei-analytics-events`

## Verification Workflow

Before finishing changes, run these checks:

1. Route/path checks
   - Header/footer links resolve.
   - `games/manifest.json` routes resolve to existing folders.
   - `permalink` matches folder name (`/games/<slug>/`).
2. Script syntax checks
   - Extract each `<script>` from game pages and parse with Node.
   - `npm run check:games` runs data sync + manifest + folder + script checks.
3. Broken link checks
   - `npm run check:links` validates internal href/src targets.
4. Full local checks
   - `npm run check:site` runs both game sanity and link checks.
5. Integration checks
   - Home -> Games -> Game -> Back to Games.
6. Mobile checks
   - Buttons and controls stack correctly on narrow screens.
7. Accessibility checks
   - Keyboard interaction works for game controls and nav.

## Common Pitfalls

- Forgetting to add a new game entry to `games/manifest.json`.
- Using absolute non-Liquid links instead of `relative_url`.
- Breaking permalink/folder alignment.
- Touching global styling when a local game style is sufficient.
- Editing multiple unrelated subsystems in one pass.

## Quick Reference

- Games hub: `games/index.md`
- Game manifest: `games/manifest.json`
- Card overrides: `games/card_overrides.json`
- Synced data manifest: `_data/games_manifest.json`
- Synced data overrides: `_data/games_card_overrides.json`
- Existing game pages: `games/*/index.html`
- Shared head/theme/perf hints: `_includes/head.html`
- Shared layout scripts (theme + analytics): `_layouts/default.html`
- Primary nav: `_includes/header.html`
- Footer nav: `_includes/footer.html`
- Global styles: `assets/css/style.css`
- Local test scripts: `scripts/sanity_check_games.mjs`, `scripts/broken_link_detector.mjs`
