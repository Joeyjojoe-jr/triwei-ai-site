---
layout: default
title: AI Hardware
permalink: /hardware/
description: Source-dated hardware specifications and original manufacturer or institutional links, without AI-authored buying advice.
publication_key: hardware
---
{% assign hardware = site.data.hardware %}

<article class="source-only-page">
  <header class="source-only-hero card animate-in">
    <p class="eyebrow">Hardware source register</p>
    <h1>Compare source-dated hardware specifications</h1>
    <p>Browse published memory, bandwidth, compute, power, and interconnect fields alongside the manufacturer or institutional source. The register preserves source terminology so readers can inspect the underlying product record rather than rely on a generated recommendation.</p>
    <p class="updated-stamp">Source fields checked {{ hardware.verified_display | escape }} · re-check by {{ hardware.reverify_by | date: "%b %d, %Y" }}</p>
  </header>

  <section class="source-only-section card animate-in" aria-labelledby="hardware-spec-title">
    <p class="source-only-warning">Vendor-published fields</p>
    <h2 id="hardware-spec-title">Specification register</h2>
    <p>Names and values retain the terminology used in the cited product source. Cross-vendor compute labels, power definitions, memory systems, and form factors may not be directly comparable. Verify the current specification and supported configuration at the original source before relying on any field.</p>

    <div class="source-only-table-wrap" role="region" aria-label="Hardware specification register" tabindex="0">
      <table class="source-only-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Class / architecture</th>
            <th>Published memory</th>
            <th>Published bandwidth</th>
            <th>Published compute label</th>
            <th>Published power label</th>
            <th>Interconnect</th>
            <th>Original source</th>
          </tr>
        </thead>
        <tbody>
          {% for gpu in hardware.gpus %}
          <tr>
            <th scope="row">{{ gpu.name | escape }}</th>
            <td>{{ gpu.class | escape }}<br>{{ gpu.architecture | escape }}</td>
            <td>{{ gpu.memory_capacity_gb }} GB · {{ gpu.memory_type | escape }}</td>
            <td>{% if gpu.memory_bandwidth_gbps %}{{ gpu.memory_bandwidth_gbps }} GB/s{% else %}Not recorded{% endif %}</td>
            <td>{{ gpu.compute_units | escape }}{% if gpu.ai_compute %}<br>{{ gpu.ai_compute | escape }}{% endif %}</td>
            <td>{{ gpu.power | escape }}</td>
            <td>{{ gpu.interconnect | escape }}</td>
            <td><a href="{{ gpu.source_url | escape }}" target="_blank" rel="noopener noreferrer">{{ gpu.source_label | escape }} ↗</a></td>
          </tr>
          {% endfor %}
        </tbody>
      </table>
    </div>
  </section>

  <section class="source-only-section card animate-in" aria-labelledby="hardware-source-title">
    <p class="source-only-warning">Original references</p>
    <h2 id="hardware-source-title">Materials and manufacturing sources</h2>
    <p>These links identify the original institution or company record used during the provisional hardware research.</p>

    <div class="source-only-grid">
      {% for material in hardware.materials %}
      <article class="source-only-card">
        <p class="source-only-type">Material-system source</p>
        <h3>{{ material.key | replace: '-', ' ' | capitalize | escape }}</h3>
        <p><a href="{{ material.source_url | escape }}" target="_blank" rel="noopener noreferrer">{{ material.source_label | escape }} ↗</a></p>
      </article>
      {% endfor %}

      {% for fab in hardware.fab_projects %}
      <article class="source-only-card">
        <p class="source-only-type">Company project source</p>
        <h3>{{ fab.name | escape }}</h3>
        <p><a href="{{ fab.source_url | escape }}" target="_blank" rel="noopener noreferrer">{{ fab.source_label | escape }} ↗</a></p>
      </article>
      {% endfor %}
    </div>
  </section>

  <details class="workbench-referral">
    <summary>Visual explainers are being rebuilt—not abandoned</summary>
    <p>The former AI-assisted lessons, model-fit conclusions, material narratives, fab lessons, and retooling guidance are not published as finished TriWei analysis. Their intended replacements and acceptance gates are listed in the <a href="{{ '/workbench/#workbench-hardware-explainers' | relative_url }}">Hardware Explainers workbench entry →</a></p>
  </details>
</article>
