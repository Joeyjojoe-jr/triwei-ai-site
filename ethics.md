---
layout: default
title: Ethics Watch
permalink: /ethics/
description: Direct links to public AI governance, risk, copyright, and accountability records without automated ethical judgments.
publication_key: ethics
---
{% assign register = site.data.ethics_sources %}

<article class="source-only-page">
  <header class="source-only-hero card animate-in">
    <p class="eyebrow">Ethics &amp; governance</p>
    <h1>Original public records—without an automated verdict</h1>
    <p>TriWei does not infer that a person, company, model, or article is ethical or unethical from keywords, frequency, sentiment, or machine-applied tags. This page links to original institutional records so readers can inspect the source directly.</p>
    <p class="updated-stamp">Links checked {{ register.checked_on | date: "%b %d, %Y" }}</p>
  </header>

  <section class="source-only-section card animate-in" aria-labelledby="ethics-source-title">
    <p class="source-only-warning">Metadata and links only</p>
    <h2 id="ethics-source-title">Governance, risk, copyright, and accountability sources</h2>
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

  <aside class="withheld-notice">
    <strong>Why the former story heat map is not shown:</strong>
    Automated keyword matching can help discover material for later review, but it cannot establish harm, intent, legality, safety, importance, or ethical merit. Feed summaries, machine tags, and article-frequency bars are therefore withheld from this page.
  </aside>
</article>
