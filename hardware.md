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
    <h1>Published specifications—without a generated recommendation</h1>
    <p>TriWei reproduces a limited set of source-dated fields from cited manufacturers and institutions. It does not treat vendor specifications as independent benchmarks, collapse unlike architectures into one score, or recommend a purchase or deployment.</p>
    <p class="updated-stamp">Source fields checked {{ hardware.verified_display | escape }} · re-check by {{ hardware.reverify_by | date: "%b %d, %Y" }}</p>
  </header>

  <aside class="withheld-notice">
    <strong>Interpretive material withheld:</strong>
    AI-assisted explanations, “best read” conclusions, model-fit lessons, material narratives, fab lessons, and retooling advice are not published here. They require independent human research, authorship, and review before they can become TriWei analysis.
  </aside>

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
    <p>These links identify the original institution or company record used during the provisional hardware research. TriWei does not publish the stored AI-assisted explanation of what each source means.</p>

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
</article>
