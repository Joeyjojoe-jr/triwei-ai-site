---
layout: default
title: Ethics Sources
permalink: /ethics/
description: Direct links to public AI governance, risk, copyright, and accountability records without automated ethical judgments.
publication_key: ethics
---
{% assign register = site.data.ethics_sources %}

<article class="source-only-page">
  <header class="source-only-hero card animate-in">
    <p class="eyebrow">Ethics &amp; governance sources</p>
    <h1>Inspect original public records</h1>
    <p>Find direct institutional records concerning AI governance, risk, copyright, and accountability. Each item retains its responsible institution, host, date, and original link.</p>
    <p class="updated-stamp">Links checked {{ register.checked_on | date: "%b %d, %Y" }}</p>
  </header>

  <section class="source-only-section card animate-in" aria-labelledby="ethics-source-title">
    <p class="source-only-warning">Direct institutional sources</p>
    <h2 id="ethics-source-title">Governance, risk, copyright, and accountability records</h2>
    <p>Inclusion means that TriWei recorded a direct public source. It is not endorsement, legal advice, an ethical rating, or independent verification of every statement in the source.</p>

    <div class="source-only-grid">
      {% for record in register.records %}
      <article class="source-only-card">
        <p class="source-only-type">{{ record.source_type | escape }}</p>
        <h3><a href="{{ record.source_url | escape }}" target="_blank" rel="noopener noreferrer">{{ record.source_title | escape }} ↗</a></h3>
        <dl>
          <div><dt>Institution</dt><dd>{{ record.author_or_institution | escape }}</dd></div>
          <div><dt>Publisher or host</dt><dd>{{ record.publisher_or_host | escape }}</dd></div>
          <div><dt>Record date</dt><dd>{{ record.published_display | escape }}</dd></div>
          <div><dt>Link checked</dt><dd>{{ record.checked_on | escape }}</dd></div>
        </dl>
      </article>
      {% endfor %}
    </div>
  </section>

  <details class="workbench-referral">
    <summary>Human-authored Ethics Watch analysis is in development</summary>
    <p>The former story heat map, feed summaries, and machine tags could be read as automated findings of harm, intent, legality, safety, importance, or ethical merit. The intended human-authored replacement and its acceptance gate are listed in the <a href="{{ '/workbench/#workbench-ethics-watch-analysis' | relative_url }}">Ethics Watch workbench entry →</a></p>
  </details>
</article>
