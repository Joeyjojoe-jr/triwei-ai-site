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
  }

  .games-index {
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

  .game-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .game-tile {
    position: relative;
    isolation: isolate;
    display: grid;
    gap: 0.6rem;
    padding: 1rem 1.1rem;
    border: 1px solid var(--border);
    border-radius: 0.9rem;
    background:
      linear-gradient(150deg, color-mix(in srgb, var(--surface) 92%, #ffffff) 0%, var(--surface) 65%);
    box-shadow: var(--shadow);
    overflow: hidden;
    transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
  }

  .game-tile::before {
    content: "";
    position: absolute;
    inset: auto -20% -65% -20%;
    height: 55%;
    background: radial-gradient(ellipse at center, color-mix(in srgb, var(--tile-accent, var(--accent)) 24%, transparent), transparent 70%);
    z-index: -1;
    pointer-events: none;
  }

  .game-tile:hover {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--tile-accent, var(--accent)) 45%, var(--border));
    box-shadow: 0 18px 38px rgba(12, 36, 64, 0.14);
  }

  .game-tile h3 {
    margin: 0;
    font-size: 1.18rem;
    line-height: 1.2;
  }

  .game-tile h3 a {
    color: var(--text);
  }

  .game-tile h3 a:hover {
    color: var(--tile-accent, var(--accent));
    text-decoration: none;
  }

  .game-tile p {
    margin: 0;
    color: var(--muted);
  }

  .game-meta {
    color: var(--tile-accent, var(--accent-2));
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .primary-button {
    width: fit-content;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.45rem 0.75rem;
    border-radius: 0.55rem;
    background: var(--tile-accent, var(--accent));
    color: #ffffff;
    font-weight: 600;
    text-decoration: none;
  }

  .primary-button:hover {
    text-decoration: none;
    filter: brightness(1.05);
  }

  .game-tile.arcade { --tile-accent: var(--accent-arcade); }
  .game-tile.puzzle { --tile-accent: var(--accent-puzzle); }
  .game-tile.logic { --tile-accent: var(--accent-logic); }
  .game-tile.timing { --tile-accent: var(--accent-timing); }
  .game-tile.reflex { --tile-accent: var(--accent-reflex); }
  .game-tile.rhythm { --tile-accent: var(--accent-rhythm); }
  .game-tile.memory { --tile-accent: var(--accent-memory); }

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

<section class="games-index">
  <h1>Games</h1>
  <p>Short, replayable experiments you can jump into anytime. New games land here as soon as they're ready.</p>
  <div class="game-grid">
    <article class="game-tile arcade">
      <p class="game-meta">Arcade - 2-3 min runs</p>
      <h3><a href="{{ '/games/orbit-runner/' | relative_url }}">Orbit Runner</a></h3>
      <p>Slingshot around gravity wells, dodge debris, and push your best distance.</p>
      <a class="primary-button" href="{{ '/games/orbit-runner/' | relative_url }}">Play Orbit Runner</a>
    </article>
    <article class="game-tile puzzle">
      <p class="game-meta">Puzzle · 5-8 min</p>
      <h3><a href="{{ '/games/circuit-flip/' | relative_url }}">Circuit Flip</a></h3>
      <p>Rotate tiles to route power from the Source to the Core. Solve in the fewest moves.</p>
      <a class="primary-button" href="{{ '/games/circuit-flip/' | relative_url }}">Play Circuit Flip</a>
    </article>
    <article class="game-tile timing">
      <p class="game-meta">Timing · 1-2 min rounds</p>
      <h3><a href="{{ '/games/signal-drift/' | relative_url }}">Signal Drift</a></h3>
      <p>A single-button timing challenge with escalating tempo.</p>
      <a class="primary-button" href="{{ '/games/signal-drift/' | relative_url }}">Play Signal Drift</a>
    </article>
    <article class="game-tile arcade">
      <p class="game-meta">Arcade · Precision flight</p>
      <h3><a href="{{ '/games/vector-vault/' | relative_url }}">Vector Vault</a></h3>
      <p>Precision movement challenge with narrow timing windows.</p>
      <a class="primary-button" href="{{ '/games/vector-vault/' | relative_url }}">Play Vector Vault</a>
    </article>
    <article class="game-tile logic">
      <p class="game-meta">Logic · Constraint puzzle</p>
      <h3><a href="{{ '/games/logic-lattice/' | relative_url }}">Logic Lattice</a></h3>
      <p>Rule-based puzzle board focused on chaining constraints.</p>
      <a class="primary-button" href="{{ '/games/logic-lattice/' | relative_url }}">Play Logic Lattice</a>
    </article>
    <article class="game-tile reflex">
      <p class="game-meta">Reflex · Pointer control</p>
      <h3><a href="{{ '/games/flux-line/' | relative_url }}">Flux Line</a></h3>
      <p>Path-tracing reflex game with escalating speed and obstacles.</p>
      <a class="primary-button" href="{{ '/games/flux-line/' | relative_url }}">Play Flux Line</a>
    </article>
    <article class="game-tile rhythm">
      <p class="game-meta">Rhythm · Stacking</p>
      <h3><a href="{{ '/games/pulse-stack/' | relative_url }}">Pulse Stack</a></h3>
      <p>Rhythm-based stacking game tuned for short replayable rounds.</p>
      <a class="primary-button" href="{{ '/games/pulse-stack/' | relative_url }}">Play Pulse Stack</a>
    </article>
    <article class="game-tile puzzle">
      <p class="game-meta">Puzzle · Move planning</p>
      <h3><a href="{{ '/games/grid-hopper/' | relative_url }}">Grid Hopper</a></h3>
      <p>Step-planning puzzle where each move changes future options.</p>
      <a class="primary-button" href="{{ '/games/grid-hopper/' | relative_url }}">Play Grid Hopper</a>
    </article>
    <article class="game-tile memory">
      <p class="game-meta">Memory · Sequence replay</p>
      <h3><a href="{{ '/games/echo-trace/' | relative_url }}">Echo Trace</a></h3>
      <p>Memory-and-pattern challenge based on delayed visual cues.</p>
      <a class="primary-button" href="{{ '/games/echo-trace/' | relative_url }}">Play Echo Trace</a>
    </article>
    <article class="game-tile logic">
      <p class="game-meta">Logic · Pattern transforms</p>
      <h3><a href="{{ '/games/pattern-relay/' | relative_url }}">Pattern Relay</a></h3>
      <p>Quick logic rounds with procedurally generated sequence goals.</p>
      <a class="primary-button" href="{{ '/games/pattern-relay/' | relative_url }}">Play Pattern Relay</a>
    </article>
    <article class="game-tile timing">
      <p class="game-meta">Timing · Multi-lane lock</p>
      <h3><a href="{{ '/games/tempo-matrix/' | relative_url }}">Tempo Matrix</a></h3>
      <p>Multi-lane timing challenge with escalating tempo.</p>
      <a class="primary-button" href="{{ '/games/tempo-matrix/' | relative_url }}">Play Tempo Matrix</a>
    </article>
    <article class="game-tile puzzle">
      <p class="game-meta">Puzzle · Row/column shifts</p>
      <h3><a href="{{ '/games/quantum-swap/' | relative_url }}">Quantum Swap</a></h3>
      <p>Rotate rows and columns to match the target matrix.</p>
      <a class="primary-button" href="{{ '/games/quantum-swap/' | relative_url }}">Play Quantum Swap</a>
    </article>
  </div>
</section>
