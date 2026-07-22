---
layout: default
title: AI Industry Atlas
permalink: /industry/
description: Source-dated industry measurements and original links without coverage-frequency rankings or AI-authored market conclusions.
publication_key: industry
---
{% assign atlas = site.data.industry %}
{% assign supply = atlas.supply_chain %}
{% assign diffusion = atlas.diffusion_watch %}
{% assign pricing = atlas.model_value %}

<article class="source-only-page">
  <header class="source-only-hero card animate-in">
    <p class="eyebrow">Industry source and data register</p>
    <h1>Inspect the measurement and its source—not a generated market story</h1>
    <p>TriWei publishes a limited set of source-dated fields and direct links. It does not use headline recurrence to rank importance, infer market power, judge company quality, or establish that a reported claim is true.</p>
    <p class="updated-stamp">Industry data refreshed {{ atlas.generated_display | escape }}</p>
  </header>

  <aside class="withheld-notice">
    <strong>Interpretive atlas views withheld:</strong>
    Coverage-momentum charts, company heat maps, AI-authored supply-chain readouts, milestone synopses, significance claims, and editorial rankings are not published in this version. They require human research, authorship, and source-by-source review.
  </aside>

  <section class="source-only-section card animate-in" id="pricing" aria-labelledby="pricing-title">
    <p class="source-only-warning">First-party list prices</p>
    <h2 id="pricing-title">API price register</h2>
    <p>Prices are transcribed from cited first-party pages and retain the dataset's verification date. This is not a capability, quality, safety, latency, reliability, or value ranking. Token accounting, cache rules, context tiers, reasoning tokens, tools, taxes, commitments, and provider terms can change the effective cost.</p>

    {% if pricing.freshness == "expired" %}
    <p class="empty-state">This price register is past its review window and is retained only as a dated historical snapshot.</p>
    {% endif %}

    <div class="source-only-table-wrap" role="region" aria-label="AI API price register" tabindex="0">
      <table class="source-only-table">
        <thead>
          <tr>
            <th>Provider / model</th>
            <th>Input price</th>
            <th>Cached input</th>
            <th>Output price</th>
            <th>Reference note</th>
            <th>Original source</th>
          </tr>
        </thead>
        <tbody>
          {% for model in pricing.models %}
          <tr>
            <th scope="row">{{ model.organization | escape }}<br>{{ model.name | escape }}</th>
            <td>{% if model.input_price != nil %}${{ model.input_price }}{% else %}Not recorded{% endif %}</td>
            <td>{% if model.cached_input_price != nil %}${{ model.cached_input_price }}{% else %}Not recorded{% endif %}</td>
            <td>{% if model.output_price != nil %}${{ model.output_price }}{% else %}Not recorded{% endif %}</td>
            <td>{{ model.context_note | escape }}{% if model.price_until %}<br>Recorded through {{ model.price_until | escape }}{% endif %}</td>
            <td><a href="{{ model.source_url | escape }}" target="_blank" rel="noopener noreferrer">{{ model.source_label | escape }} ↗</a></td>
          </tr>
          {% endfor %}
        </tbody>
      </table>
    </div>
    <p class="content-meta">Units follow the dataset source: {{ pricing.price_metric | escape }} · fields checked {{ pricing.verified_display | escape }}.</p>
  </section>

  <section class="source-only-section card animate-in" id="supply-chain" aria-labelledby="supply-title">
    <p class="source-only-warning">Institutional and company records</p>
    <h2 id="supply-title">Physical supply-chain source register</h2>
    <p>Stage names are navigation labels only. TriWei does not claim that the list is complete, that every product follows one route, or that listed organizations represent market share or endorsement.</p>

    <div class="source-only-grid">
      {% for stage in supply.stages %}
      <article class="source-only-card">
        <p class="source-only-type">Stage {{ stage.number | escape }}</p>
        <h3>{{ stage.label | escape }}</h3>
        <dl>
          <div><dt>Reference period</dt><dd>{{ stage.evidence_date | escape }}</dd></div>
          <div><dt>Original sources</dt><dd>{% for source in stage.sources %}<a href="{{ source.url | escape }}" target="_blank" rel="noopener noreferrer">{{ source.label | escape }} ↗</a>{% unless forloop.last %}<br>{% endunless %}{% endfor %}</dd></div>
        </dl>
      </article>
      {% endfor %}
    </div>
  </section>

  <section class="source-only-section card animate-in" id="diffusion" aria-labelledby="diffusion-title">
    <p class="source-only-warning">Attributed source records</p>
    <h2 id="diffusion-title">Model-access and provenance source register</h2>
    <p>Developer disclosures, public repositories, and provider allegations remain attached to the organization that published them. Inclusion is not independent adjudication. Similar outputs, benchmark scores, media repetition, or release timing do not establish model lineage.</p>

    <div class="source-only-grid">
      {% for milestone in diffusion.milestones %}
      <article class="source-only-card">
        <p class="source-only-type">{{ milestone.evidence_class | replace: '_', ' ' | capitalize | escape }}</p>
        <h3>{{ milestone.lab | escape }}</h3>
        <dl>
          <div><dt>Source date</dt><dd><time datetime="{{ milestone.date | escape }}">{{ milestone.date | date: "%b %d, %Y" }}</time></dd></div>
          <div><dt>Recorded release status</dt><dd>{{ milestone.open_weight_status | escape }}</dd></div>
          <div><dt>Original source</dt><dd><a href="{{ milestone.source_url | escape }}" target="_blank" rel="noopener noreferrer">{{ milestone.source_label | escape }} ↗</a></dd></div>
        </dl>
      </article>
      {% endfor %}
    </div>
  </section>
</article>
