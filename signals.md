---
layout: default
title: Signal History
permalink: /signals/
description: Trace early AI reporting, research, and prognostications into later events that strengthen, complicate, or redirect the original signal.
intelligence: true
---

{% assign signals = site.data.signals %}
{% assign event_count = 0 %}
{% for thread in signals.threads %}{% assign event_count = event_count | plus: thread.events.size %}{% endfor %}

<div class="intel-page signal-page">
  <header class="intel-hero card">
    <p class="intel-kicker">News has a memory</p>
    <h1>What looked small—<br><span>until it became the story</span></h1>
    <p class="intel-lead">Follow ideas from their early paper, article, or opinion through the events that later strengthened, complicated, or redirected the original signal. This is provenance, not a pundit scoreboard.</p>
    <p class="intel-truth-strip"><strong>How this was made:</strong> AI-assisted source research, static editorial relationships, and direct links to every cited node. No live model decides what is true on page load.</p>
    <div class="intel-interaction-key" aria-label="How to interact with this page"><span><b>Pills</b> filter</span><span><b>▾ Why/how?</b> opens method</span><span><b>↗</b> opens the original source</span></div>
    <div class="intel-hero-kpis" role="list" aria-label="Signal history coverage">
      <div role="listitem"><a class="intel-kpi-link" href="#signal-method-title"><strong>{{ signals.coverage_start_label | escape }}</strong><span>ledger begins · inspect method</span></a></div>
      <div role="listitem"><a class="intel-kpi-link" href="#signal-ledger"><strong>{{ signals.threads.size }}</strong><span>connected threads · explore</span></a></div>
      <div role="listitem"><a class="intel-kpi-link" href="#signal-ledger"><strong>{{ event_count }}</strong><span>dated evidence nodes · inspect</span></a></div>
      <div role="listitem"><a class="intel-kpi-link" href="#relationship-key"><strong>4</strong><span>relationship types · open rules</span></a></div>
    </div>
    <p class="intel-freshness">Evidence checked {{ signals.verified_on | date: "%b %d, %Y" }} · sources retain their original dates and claims</p>
  </header>

  <section class="signal-method card" aria-labelledby="signal-method-title">
    <div>
      <p class="intel-kicker">Editorial rule</p>
      <h2 id="signal-method-title">Connect evidence. Preserve uncertainty.</h2>
      <p>{{ signals.method_note | escape }}</p>
      <details class="intel-method-disclosure">
        <summary>Exactly how TriWei assembled this view</summary>
        <div class="intel-method-stack">
          <p><strong>AI's role</strong>{{ signals.generation_method.automation | escape }}</p>
          <p><strong>Collection rule</strong>{{ signals.generation_method.collection | escape }}</p>
          <p><strong>Relationship rule</strong>{{ signals.generation_method.relationship_assignment | escape }}</p>
          <p><strong>What “checked” means</strong>{{ signals.generation_method.verification | escape }}</p>
          <p><strong>What filters do</strong>{{ signals.generation_method.filtering | escape }}</p>
        </div>
      </details>
    </div>
    <ul class="signal-relationship-key" id="relationship-key">
      {% for relationship in signals.relationship_types %}
      <li class="relationship-{{ relationship.key }}">
        <details>
          <summary title="Open the rule and its limits"><strong>{{ relationship.label | escape }}</strong><span>{{ relationship.meaning | escape }}</span><small>Open rule + limits</small></summary>
          <div class="relationship-method"><p><b>Assignment rule</b>{{ relationship.decision_rule | escape }}</p><p><b>Does not establish</b>{{ relationship.not_claim | escape }}</p></div>
        </details>
      </li>
      {% endfor %}
    </ul>
  </section>

  <section class="signal-ledger" id="signal-ledger" aria-labelledby="signal-ledger-title">
    <div class="intel-section-head">
      <div>
        <p class="intel-kicker">Lookback portal</p>
        <h2 id="signal-ledger-title">Trace a signal through time</h2>
      </div>
      <p id="signal-filter-status" aria-live="polite">Showing all {{ signals.threads.size }} threads.</p>
    </div>

    <div class="signal-filter-bar" role="group" aria-label="Filter historical signal threads">
      {% for filter in signals.filters %}
      <button type="button" class="signal-filter" data-signal-filter="{{ filter.key | escape }}" aria-pressed="{% if filter.key == 'all' %}true{% else %}false{% endif %}">{{ filter.label | escape }}</button>
      {% endfor %}
    </div>
    <p class="signal-filter-method">These pills only match the page's saved tags and text. They do not ask an AI model to judge relevance or truth.</p>

    <div class="signal-query-note" id="signal-query-note" hidden></div>

    <div class="signal-thread-list">
      {% for thread in signals.threads %}
      <article class="signal-thread card" data-signal-thread data-signal-tags="{{ thread.tags | join: '|' | downcase | escape }}">
        <header class="signal-thread-head">
          <div>
            <p class="intel-kicker">Thread 0{{ forloop.index }}</p>
            <h3>{{ thread.title | escape }}</h3>
            <p>{{ thread.dek | escape }}</p>
          </div>
          <span class="signal-status" title="Editorial synthesis, not a computed score. Open ‘How this thread was assembled’ below.">Editorial status · {{ thread.status | escape }}</span>
        </header>

        <details class="intel-thread-method">
          <summary>How this thread was assembled</summary>
          <div class="intel-proof-grid"><p><strong>Thread claim</strong>{{ thread.dek | escape }}</p><p><strong>Included evidence</strong>{{ thread.events.size }} dated nodes whose source summaries materially bear on this claim.</p><p><strong>Status label</strong>“{{ thread.status | escape }}” is editorial synthesis, not a computed confidence score.</p><p><strong>Scope boundary</strong>Tags are navigation aids: {{ thread.tags | join: ', ' | escape }}. They are not a complete taxonomy.</p></div>
        </details>

        <ol class="signal-event-list">
          {% for event in thread.events %}
          {% assign event_relationship = signals.relationship_types | where: "key", event.relationship | first %}
          <li class="signal-event relationship-{{ event.relationship }}">
            <div class="signal-event-marker" aria-hidden="true"></div>
            <div class="signal-event-date">
              {% assign event_month = event.date | date: "%b %Y" %}
              <time datetime="{{ event.date | escape }}">{{ event.date_display | default: event_month | escape }}</time>
              <span>{{ event.source_type | escape }}</span>
            </div>
            <div class="signal-event-body">
              <span class="relationship-badge" title="Editorial relationship. Open the ‘Why’ disclosure below.">{{ event_relationship.label | escape }}</span>
              <h4>{{ event.title | escape }}</h4>
              <p class="signal-byline">{{ event.outlet | escape }} · {{ event.author | escape }}</p>
              <p class="signal-node-summary">{{ event.note | escape }}</p>
              <div class="signal-event-actions"><a href="{{ event.url | escape }}" target="_blank" rel="noopener noreferrer">Open original source ↗</a></div>
              <details class="intel-inline-proof">
                <summary title="Open the evidence relationship and its limits">Why is this node labeled “{{ event_relationship.label | escape }}”?</summary>
                <div class="intel-proof-grid"><p><strong>Evidence basis</strong>{{ event.source_type | escape }} published by {{ event.outlet | escape }} on {{ event.date | date: "%b %d, %Y" }}.</p><p><strong>Assignment rule</strong>{{ event_relationship.decision_rule | escape }}</p><p><strong>This node contributes</strong>{{ event.note | escape }}</p><p><strong>Does not establish</strong>{{ event_relationship.not_claim | escape }}</p></div>
              </details>
            </div>
          </li>
          {% endfor %}
        </ol>
        <div class="signal-thread-tags" aria-label="Filter by a thread topic">{% for tag in thread.tags %}<button type="button" data-signal-tag="{{ tag | escape }}" title="Filter the ledger by this saved tag">{{ tag | escape }}</button>{% endfor %}</div>
      </article>
      {% endfor %}
    </div>
  </section>

  <section class="signal-observers card" aria-labelledby="signal-observers-title">
    <div class="intel-section-head">
      <div>
        <p class="intel-kicker">Early, durable reads</p>
        <h2 id="signal-observers-title">People and outlets that noticed a consequential connection</h2>
      </div>
      <p>No accuracy score. Inclusion means a dated source made a material connection before its later significance was widely visible.</p>
    </div>
    <div class="signal-observer-grid">
      {% for observer in signals.observers %}
      <article>
        <span>{{ observer.date | escape }} · {{ observer.thread | escape }}</span>
        <h3>{{ observer.name | escape }}</h3>
        <p class="signal-outlet">{{ observer.outlet | escape }}</p>
        <p>{{ observer.signal | escape }}</p>
        <a href="{{ observer.url | escape }}" target="_blank" rel="noopener noreferrer">Read the dated source ↗</a>
        <details class="intel-inline-proof"><summary>Why is this included?</summary><p>Inclusion records this specific dated connection: {{ observer.signal | escape }} It is not an accuracy score, “first” claim, endorsement, or lifetime judgment of the author.</p></details>
      </article>
      {% endfor %}
    </div>
  </section>

  <section class="intel-boundary card" aria-labelledby="signal-boundary-title">
    <p class="intel-kicker">Coverage boundary</p>
    <h2 id="signal-boundary-title">What this portal does—and does not claim</h2>
    <div class="intel-boundary-grid">
      <p><strong>Curated, not total.</strong> The historical web, paywalls, archives, link rot, and licensing prevent a credible claim that every AI article has been indexed. The ledger expands source by source.</p>
      <p><strong>Claims stay attached.</strong> A later event can support one part of an article while undermining another. Each connection describes the specific relationship instead of awarding a binary verdict.</p>
      <p><strong>Small outlets remain visible.</strong> Specialist research explainers and niche reporting appear beside major publications when their dated observation materially shaped a thread.</p>
      <p><strong>Corrections are part of the record.</strong> Source changes, retractions, disputed provenance, and later qualifications should become additional evidence nodes—not silent edits.</p>
    </div>
  </section>
</div>

<script src="{{ '/assets/js/signal-history.js' | relative_url }}" defer></script>
