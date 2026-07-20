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
    <div class="intel-hero-kpis" role="list" aria-label="Signal history coverage">
      <div role="listitem"><strong>{{ signals.coverage_start_label | escape }}</strong><span>ledger begins</span></div>
      <div role="listitem"><strong>{{ signals.threads.size }}</strong><span>connected threads</span></div>
      <div role="listitem"><strong>{{ event_count }}</strong><span>dated evidence nodes</span></div>
      <div role="listitem"><strong>4</strong><span>relationship types</span></div>
    </div>
    <p class="intel-freshness">Evidence checked {{ signals.verified_on | date: "%b %d, %Y" }} · sources retain their original dates and claims</p>
  </header>

  <section class="signal-method card" aria-labelledby="signal-method-title">
    <div>
      <p class="intel-kicker">Editorial rule</p>
      <h2 id="signal-method-title">Connect evidence. Preserve uncertainty.</h2>
      <p>{{ signals.method_note | escape }}</p>
    </div>
    <ul class="signal-relationship-key">
      {% for relationship in signals.relationship_types %}
      <li class="relationship-{{ relationship.key }}"><strong>{{ relationship.label | escape }}</strong><span>{{ relationship.meaning | escape }}</span></li>
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
          <span class="signal-status">{{ thread.status | escape }}</span>
        </header>

        <ol class="signal-event-list">
          {% for event in thread.events %}
          <li class="signal-event relationship-{{ event.relationship }}">
            <div class="signal-event-marker" aria-hidden="true"></div>
            <div class="signal-event-date">
              {% assign event_month = event.date | date: "%b %Y" %}
              <time datetime="{{ event.date | escape }}">{{ event.date_display | default: event_month | escape }}</time>
              <span>{{ event.source_type | escape }}</span>
            </div>
            <div class="signal-event-body">
              {% for relationship in signals.relationship_types %}{% if relationship.key == event.relationship %}<span class="relationship-badge">{{ relationship.label | escape }}</span>{% endif %}{% endfor %}
              <h4><a href="{{ event.url | escape }}" target="_blank" rel="noopener noreferrer">{{ event.title | escape }} ↗</a></h4>
              <p class="signal-byline">{{ event.outlet | escape }} · {{ event.author | escape }}</p>
              <p>{{ event.note | escape }}</p>
            </div>
          </li>
          {% endfor %}
        </ol>
        <p class="signal-thread-tags" aria-label="Thread topics">{% for tag in thread.tags %}<span>{{ tag | escape }}</span>{% endfor %}</p>
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
