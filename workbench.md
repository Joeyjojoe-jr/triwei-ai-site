---
layout: default
title: Workbench & Roadmap
permalink: /workbench/
description: What TriWei publishes now, which features are being rebuilt, and which methods have been retired.
publication_key: workbench
---
{% assign status = site.data.feature_status %}

<article class="workbench-page">
  <header class="workbench-hero card animate-in">
    <p class="eyebrow">Workbench &amp; Roadmap</p>
    <h1>Useful now, being rebuilt, and retired</h1>
    <p>TriWei does not need to choose between usefulness and ethical restraint. Information that already meets the publication standard remains public. Features that need human research and review are developed here without being presented as finished analysis. Methods that conflict with the site's standards are recorded as retired so they do not quietly return.</p>
    <p class="updated-stamp">Feature status reviewed {{ status.reviewed_on | date: "%b %d, %Y" }}</p>
  </header>

  <section class="workbench-section card animate-in" aria-labelledby="published-title">
    <div class="workbench-section-head">
      <div>
        <p class="workbench-state state-published">Published now</p>
        <h2 id="published-title">Information readers can use today</h2>
      </div>
      <p>{{ status.states.published.definition | escape }}</p>
    </div>

    <div class="workbench-grid">
      {% for feature in status.published %}
      <article class="workbench-card workbench-card-published">
        <h3><a href="{{ feature.route | relative_url }}">{{ feature.title | escape }} →</a></h3>
        <p><strong>Available now</strong>{{ feature.available_now | escape }}</p>
        <p><strong>Current boundary</strong>{{ feature.current_limit | escape }}</p>
      </article>
      {% endfor %}
    </div>
  </section>

  <section class="workbench-section card animate-in" aria-labelledby="development-title">
    <div class="workbench-section-head">
      <div>
        <p class="workbench-state state-workbench">Research workbench</p>
        <h2 id="development-title">Features being rebuilt to meet the standard</h2>
      </div>
      <p>{{ status.states.workbench.definition | escape }}</p>
    </div>

    <div class="workbench-stack">
      {% for feature in status.workbench %}
      <article class="workbench-feature" id="workbench-{{ feature.id | escape }}">
        <div class="workbench-feature-summary">
          <div>
            <p class="workbench-state state-workbench">In development</p>
            <h3>{{ feature.title | escape }}</h3>
            <p>{{ feature.intended_value | escape }}</p>
          </div>
          <a class="workbench-current-link" href="{{ feature.available_route | relative_url }}">{{ feature.available_label | escape }} →</a>
        </div>

        <details>
          <summary>Why the intended feature is not published yet</summary>
          <p>{{ feature.blocked_by | escape }}</p>
        </details>

        <details>
          <summary>Acceptance gate before publication</summary>
          <ol>
            {% for gate in feature.acceptance_gate %}<li>{{ gate | escape }}</li>{% endfor %}
          </ol>
        </details>
      </article>
      {% endfor %}
    </div>
  </section>

  <section class="workbench-section card animate-in" aria-labelledby="retired-title">
    <div class="workbench-section-head">
      <div>
        <p class="workbench-state state-retired">Retired methods</p>
        <h2 id="retired-title">Approaches that should not return</h2>
      </div>
      <p>{{ status.states.retired.definition | escape }}</p>
    </div>

    <div class="workbench-grid">
      {% for feature in status.retired %}
      <article class="workbench-card workbench-card-retired">
        <h3>{{ feature.title | escape }}</h3>
        <p>{{ feature.reason | escape }}</p>
      </article>
      {% endfor %}
    </div>
  </section>

  <section class="source-only-section card" aria-labelledby="workbench-correction-title">
    <p class="source-only-warning">Status can change</p>
    <h2 id="workbench-correction-title">A roadmap is not a promise</h2>
    <p>Workbench placement records current intent, not a release commitment. A feature may move to published only after its stated gate is satisfied. It may move to retired when a safe, accurate, and useful implementation cannot be justified. Material status changes should be recorded through <a href="{{ '/corrections/' | relative_url }}">Corrections &amp; Revisions</a>.</p>
  </section>
</article>
