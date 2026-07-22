---
layout: default
title: Signal History
permalink: /signals/
description: A dated register of original AI sources. Interpretive timelines remain unpublished pending human research and authorship.
publication_key: signals
---
{% assign signals = site.data.signals %}
{% assign event_count = 0 %}
{% for thread in signals.threads %}{% assign event_count = event_count | plus: thread.events.size %}{% endfor %}

<article class="source-only-page">
  <header class="source-only-hero card animate-in">
    <p class="eyebrow">Historical source register</p>
    <h1>Dated sources—without an AI-authored historical narrative</h1>
    <p>TriWei previously assembled provisional threads and relationship labels with AI assistance. Those summaries, labels, status judgments, and claims of significance are withheld until a human independently researches and authors the chronology.</p>
    <p class="updated-stamp">{{ event_count }} source records · links last reviewed {{ signals.verified_on | date: "%b %d, %Y" }}</p>
  </header>

  <aside class="withheld-notice">
    <strong>What is intentionally absent:</strong>
    TriWei does not currently publish the stored thread summaries, source notes, “strengthens/complicates/redirects” labels, observer rankings, or claims that one event explains another. Those are editorial conclusions, not source metadata.
  </aside>

  <section class="source-only-section card animate-in" id="signal-ledger" aria-labelledby="signal-source-title">
    <p class="source-only-warning">Provisional collection order</p>
    <h2 id="signal-source-title">Original historical sources</h2>
    <p>The records below preserve date, responsible author or institution, publisher, and direct source link. Their order and proximity do not establish causation, priority, prediction accuracy, endorsement, or historical importance.</p>

    <div class="source-only-grid">
      {% for thread in signals.threads %}
        {% for event in thread.events %}
        <article class="source-only-card">
          <p class="source-only-type">{{ event.source_type | escape }}</p>
          <h3>{{ event.outlet | escape }}</h3>
          <dl>
            <div><dt>Author or institution</dt><dd>{{ event.author | escape }}</dd></div>
            <div><dt>Source date</dt><dd><time datetime="{{ event.date | escape }}">{{ event.date_display | default: event.date | escape }}</time></dd></div>
            <div><dt>Direct source</dt><dd><a href="{{ event.url | escape }}" target="_blank" rel="noopener noreferrer">Open the original piece ↗</a></dd></div>
          </dl>
        </article>
        {% endfor %}
      {% endfor %}
    </div>
  </section>
</article>
