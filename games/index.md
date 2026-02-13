---
layout: default
title: Games
permalink: /games/
description: Replayable browser games and interactive experiments from TriWei AI.
---

<style>
  .games-index {
    --accent-arcade: #ff8a5c;
    --accent-puzzle: #4ca7f0;
    --accent-logic: #8f8bff;
    --accent-timing: #34f5c5;
    --accent-reflex: #ffd166;
    --accent-rhythm: #f06595;
    --accent-memory: #9bde6d;
    --accent-aiml: #2e9f9c;
    display: grid;
    gap: 1rem;
  }

  .games-index h1 {
    margin: 0;
    font-size: clamp(1.8rem, 3vw, 2.35rem);
    letter-spacing: 0.01em;
  }

  .games-index > p {
    margin: 0;
    max-width: 58ch;
    color: var(--muted);
  }

  .game-filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .genre-chip {
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    border-radius: 999px;
    padding: 0.3rem 0.7rem;
    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease;
  }

  .genre-chip:hover {
    border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
    background: color-mix(in srgb, var(--surface) 84%, var(--accent-soft));
  }

  .genre-chip.is-active {
    border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
    background: var(--accent-soft);
    color: var(--accent);
  }

  .game-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  }

  .game-tile {
    position: relative;
    isolation: isolate;
    display: grid;
    grid-template-rows: auto auto auto 1fr auto;
    gap: 0.6rem;
    padding: 0.9rem;
    border: 1px solid var(--border);
    border-radius: 0.9rem;
    background:
      linear-gradient(150deg, color-mix(in srgb, var(--surface) 93%, #ffffff) 0%, var(--surface) 65%);
    box-shadow: var(--shadow);
    overflow: hidden;
    transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
  }

  .game-tile::before {
    content: "";
    position: absolute;
    inset: auto -20% -65% -20%;
    height: 55%;
    background: radial-gradient(ellipse at center, color-mix(in srgb, var(--tile-accent, var(--accent)) 23%, transparent), transparent 70%);
    z-index: -1;
    pointer-events: none;
  }

  .game-tile:hover {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--tile-accent, var(--accent)) 45%, var(--border));
    box-shadow: 0 18px 38px rgba(12, 36, 64, 0.14);
  }

  .game-thumb-wrap {
    margin: 0;
    border-radius: 0.72rem;
    border: 1px solid color-mix(in srgb, var(--tile-accent, var(--accent)) 32%, var(--border));
    background: color-mix(in srgb, var(--surface-soft, var(--surface)) 86%, #ffffff);
    overflow: hidden;
    aspect-ratio: 16 / 9;
  }

  .game-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .game-topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.45rem;
  }

  .game-meta {
    margin: 0;
    color: var(--tile-accent, var(--accent-2));
    font-size: 0.79rem;
    font-weight: 650;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .game-badge {
    display: inline-flex;
    align-items: center;
    border: 1px solid color-mix(in srgb, var(--tile-accent, var(--accent)) 40%, var(--border));
    background: color-mix(in srgb, var(--tile-accent, var(--accent)) 15%, #ffffff);
    color: var(--tile-accent, var(--accent));
    border-radius: 999px;
    padding: 0.14rem 0.5rem;
    font-size: 0.69rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .game-tile h3 {
    margin: 0;
    font-size: 1.12rem;
    line-height: 1.2;
  }

  .game-title {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text);
  }

  .game-title:hover {
    color: var(--tile-accent, var(--accent));
    text-decoration: none;
  }

  .game-icon {
    width: 1.05rem;
    height: 1.05rem;
    flex: 0 0 auto;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--tile-accent, var(--accent)) 42%, var(--border));
    background: color-mix(in srgb, var(--tile-accent, var(--accent)) 14%, #ffffff);
    padding: 0.08rem;
  }

  .game-summary {
    margin: 0;
    color: var(--muted);
    max-width: 36ch;
    line-height: 1.45;
  }

  .primary-button {
    width: fit-content;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: auto;
    padding: 0.45rem 0.75rem;
    border-radius: 0.55rem;
    background: var(--tile-accent, var(--accent));
    color: #ffffff;
    font-weight: 650;
    text-decoration: none;
  }

  .primary-button:hover {
    text-decoration: none;
    filter: brightness(1.05);
  }

  .game-empty {
    margin: 0;
    padding: 0.95rem 1rem;
    border: 1px dashed var(--border);
    border-radius: 0.75rem;
    color: var(--muted);
    background: color-mix(in srgb, var(--surface) 90%, transparent);
  }

  .is-hidden {
    display: none !important;
  }

  .game-tile.genre-arcade { --tile-accent: var(--accent-arcade); }
  .game-tile.genre-puzzle { --tile-accent: var(--accent-puzzle); }
  .game-tile.genre-logic { --tile-accent: var(--accent-logic); }
  .game-tile.genre-timing { --tile-accent: var(--accent-timing); }
  .game-tile.genre-reflex { --tile-accent: var(--accent-reflex); }
  .game-tile.genre-rhythm { --tile-accent: var(--accent-rhythm); }
  .game-tile.genre-memory { --tile-accent: var(--accent-memory); }
  .game-tile.genre-ai-ml { --tile-accent: var(--accent-aiml); }

  @media (prefers-reduced-motion: no-preference) {
    .game-tile {
      animation: game-card-rise 0.45s ease both;
    }

    .game-tile:nth-child(2n) {
      animation-delay: 0.04s;
    }

    .game-tile:nth-child(3n) {
      animation-delay: 0.08s;
    }

    @keyframes game-card-rise {
      from {
        opacity: 0;
        transform: translateY(8px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
</style>

{% assign games = site.data.games_manifest.games %}
{% assign overrides_map = site.data.games_card_overrides.games %}
{% assign total_count = games | size %}
{% assign known_genres = "Arcade|Puzzle|Logic|Timing|Reflex|Rhythm|Memory|AI/ML" | split: "|" %}
{% assign grouped_genres = games | group_by: "genre" %}

<section class="games-index">
  <h1>Games</h1>
  <p>Short, replayable experiments you can jump into anytime. New games land here as soon as they're ready.</p>

  <div id="game-filter-bar" class="game-filter-bar" role="toolbar" aria-label="Filter games by genre">
    <button type="button" class="genre-chip is-active" data-genre="All" aria-pressed="true">All ({{ total_count }})</button>
    {% for genre_name in known_genres %}
      {% assign genre_count = games | where: "genre", genre_name | size %}
      {% if genre_count > 0 %}
        <button type="button" class="genre-chip" data-genre="{{ genre_name | escape }}" aria-pressed="false">{{ genre_name }} ({{ genre_count }})</button>
      {% endif %}
    {% endfor %}
    {% for group in grouped_genres %}
      {% unless known_genres contains group.name %}
        <button type="button" class="genre-chip" data-genre="{{ group.name | escape }}" aria-pressed="false">{{ group.name }} ({{ group.items | size }})</button>
      {% endunless %}
    {% endfor %}
  </div>

  <div id="game-grid" class="game-grid" aria-live="polite">
    {% for game in games %}
      {% assign slug = game.slug %}
      {% assign genre = game.genre | default: "Other" %}
      {% assign genre_slug = genre | downcase | replace: "/", "-" | replace: " ", "-" %}
      {% assign override = overrides_map[slug] %}

      {% case genre %}
        {% when "Arcade" %}
          {% assign genre_icon = "/assets/icons/gradient-descent-arrow.svg" %}
          {% assign genre_thumb = "/assets/illustrations/loss-surface.svg" %}
        {% when "Puzzle" %}
          {% assign genre_icon = "/assets/icons/polynomial-curve.svg" %}
          {% assign genre_thumb = "/assets/illustrations/decision-boundary.svg" %}
        {% when "Logic" %}
          {% assign genre_icon = "/assets/icons/backprop-graph.svg" %}
          {% assign genre_thumb = "/assets/illustrations/neural-network-2-2-1.svg" %}
        {% when "Timing" %}
          {% assign genre_icon = "/assets/icons/sigmoid-curve.svg" %}
          {% assign genre_thumb = "/assets/icons/heatmap-legend.svg" %}
        {% when "Reflex" %}
          {% assign genre_icon = "/assets/icons/warning.svg" %}
          {% assign genre_thumb = "/assets/animations/flow-arrow-pulse.svg" %}
        {% when "Rhythm" %}
          {% assign genre_icon = "/assets/icons/success.svg" %}
          {% assign genre_thumb = "/assets/animations/backprop-highlight-sweep.svg" %}
        {% when "Memory" %}
          {% assign genre_icon = "/assets/icons/heatmap-legend.svg" %}
          {% assign genre_thumb = "/assets/animations/heatmap-shimmer.svg" %}
        {% when "AI/ML" %}
          {% assign genre_icon = "/assets/ui/lab-badge.svg" %}
          {% assign genre_thumb = "/assets/illustrations/loss-surface.svg" %}
        {% else %}
          {% assign genre_icon = "/assets/icons/sigmoid-curve.svg" %}
          {% assign genre_thumb = "/assets/backgrounds/soft-gradient-tile.svg" %}
      {% endcase %}

      {% assign meta = override.meta | default: genre | append: " - Browser experience" %}
      {% assign summary = override.summary | default: game.description | truncate: 96 %}
      {% assign icon = override.icon | default: genre_icon %}
      {% assign thumb = override.thumb | default: genre_thumb %}

      {% if override.button %}
        {% assign button_text = override.button %}
      {% elsif genre == "AI/ML" %}
        {% assign button_text = "Open Lab" %}
      {% else %}
        {% assign button_text = "Play " | append: game.title %}
      {% endif %}

      {% assign show_new = false %}
      {% if game.added and game.added != "" %}
        {% assign now_epoch = "now" | date: "%s" %}
        {% assign added_epoch = game.added | date: "%s" %}
        {% assign age_seconds = now_epoch | minus: added_epoch %}
        {% assign age_days = age_seconds | divided_by: 86400 %}
        {% if age_days >= 0 and age_days <= 30 %}
          {% assign show_new = true %}
        {% endif %}
      {% endif %}

      {% assign badge_text = override.new_label | default: "New" %}

      <article class="game-tile genre-{{ genre_slug }}" data-genre="{{ genre | escape }}">
        <figure class="game-thumb-wrap">
          <img class="game-thumb" src="{{ thumb | relative_url }}" alt="" loading="lazy" decoding="async" aria-hidden="true" />
        </figure>
        <div class="game-topline">
          <p class="game-meta">{{ meta | escape }}</p>
          {% if show_new %}
            <span class="game-badge">{{ badge_text | escape }}</span>
          {% endif %}
        </div>
        <h3>
          <a class="game-title" href="{{ game.route | relative_url }}">
            <img class="game-icon" src="{{ icon | relative_url }}" alt="" aria-hidden="true" />
            {{ game.title }}
          </a>
        </h3>
        <p class="game-summary">{{ summary | escape }}</p>
        <a class="primary-button" href="{{ game.route | relative_url }}">{{ button_text | escape }}</a>
      </article>
    {% endfor %}
  </div>

  <p id="game-empty" class="game-empty is-hidden">No games currently match this genre filter.</p>
</section>

<script>
  (function () {
    var filterBar = document.getElementById('game-filter-bar');
    var gameGrid = document.getElementById('game-grid');
    var emptyState = document.getElementById('game-empty');
    if (!filterBar || !gameGrid) return;

    var chips = Array.prototype.slice.call(filterBar.querySelectorAll('.genre-chip'));
    var cards = Array.prototype.slice.call(gameGrid.querySelectorAll('.game-tile'));
    if (chips.length === 0 || cards.length === 0) return;

    function setActiveChip(next) {
      chips.forEach(function (chip) {
        var isActive = chip === next;
        chip.classList.toggle('is-active', isActive);
        chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    function applyFilter(genre) {
      var visibleCount = 0;
      cards.forEach(function (card) {
        var cardGenre = card.getAttribute('data-genre') || '';
        var shouldShow = genre === 'All' || cardGenre === genre;
        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) visibleCount += 1;
      });
      if (emptyState) {
        emptyState.classList.toggle('is-hidden', visibleCount > 0);
      }
    }

    filterBar.addEventListener('click', function (event) {
      var chip = event.target.closest('.genre-chip');
      if (!chip) return;
      setActiveChip(chip);
      applyFilter(chip.getAttribute('data-genre') || 'All');
    });
  })();
</script>
