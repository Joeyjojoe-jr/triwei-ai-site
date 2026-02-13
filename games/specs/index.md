---
layout: page
title: Game and Lab Specs
permalink: /games/specs/
description: Mini specs for every TriWei game and lab, including controls, budgets, and test checklists.
---

<section class="content-body">
  <p>
    These mini specs are the operational source of truth for scope, interaction model, accessibility checks, and
    performance budgets for each game/lab experience.
  </p>

  <div class="simple-list">
    {% assign entries = site.data.games_manifest.games %}
    {% for entry in entries %}
      <article class="simple-list-item">
        <h3>
          <a href="{{ entry.spec_url | relative_url }}">{{ entry.title }}</a>
        </h3>
        <p>
          <strong>{{ entry.kind | capitalize }}</strong>
          <span aria-hidden="true"> | </span>
          {{ entry.difficulty | capitalize }}
          <span aria-hidden="true"> | </span>
          {{ entry.session_length }}
        </p>
        <p>{{ entry.description }}</p>
        <p>
          <a class="text-link" href="{{ entry.route | relative_url }}">Open experience</a>
        </p>
      </article>
    {% endfor %}
  </div>
</section>
