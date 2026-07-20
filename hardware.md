---
layout: default
title: AI Hardware
permalink: /hardware/
description: Understand AI GPUs, memory, minerals, chip-production logistics, fab timelines, and the economics of keeping, retooling, repurposing, or replacing semiconductor capacity.
intelligence: true
---

{% assign hardware = site.data.hardware %}
{% assign hardware_verified_epoch = hardware.verified_on | date: "%s" | plus: 0 %}
{% assign hardware_now_epoch = "now" | date: "%s" | plus: 0 %}
{% assign hardware_age_seconds = hardware_now_epoch | minus: hardware_verified_epoch %}

<div class="intel-page hardware-page">
  <header class="intel-hero hardware-hero card">
    <p class="intel-kicker">From rock to rack</p>
    <h1>AI hardware,<br><span>without the spec-sheet fog</span></h1>
    <p class="intel-lead">See what GPU numbers actually control, why memory capacity is only one gate, how materials enter the system, where new fabs are moving, and when retooling an older line makes less sense than keeping or replacing it.</p>
    <p class="intel-truth-strip"><strong>How this was made:</strong> AI-assisted source research, a dated static specification ledger, and fixed comparison rules. No live model recommends hardware or invents a score on page load.</p>
    <div class="intel-interaction-key" aria-label="How to interact with this page"><span><b>Selectors</b> compare records</span><span><b>▾ Why/how?</b> opens method</span><span><b>↗</b> opens the cited source</span></div>
    <div class="intel-hero-kpis" role="list" aria-label="Hardware reference points">
      <div role="listitem"><a class="intel-kpi-link" href="#compare"><strong>12 vs 16 GB</strong><span>capacity is not speed · compare</span></a></div>
      <div role="listitem"><a class="intel-kpi-link" href="#compare"><strong>4.8 TB/s</strong><span>H200 peak bandwidth · inspect</span></a></div>
      <div role="listitem"><a class="intel-kpi-link" href="#materials"><strong>5</strong><span>material systems · open 5W1H</span></a></div>
      <div role="listitem"><a class="intel-kpi-link" href="#fabs"><strong>$20–25B</strong><span>fab scale · inspect sources</span></a></div>
    </div>
    {% if hardware_age_seconds > 7776000 %}
    <p class="intel-freshness intel-freshness-expired">Reference expired · re-verification required · specifications remain available as a dated historical snapshot</p>
    {% else %}
    <p class="intel-freshness">Specifications and project sources checked {{ hardware.verified_display | escape }} · re-verify by {{ hardware.reverify_by | date: "%b %d, %Y" }} · reference periods shown per source</p>
    {% endif %}
  </header>

  <nav class="intel-local-nav card" aria-label="AI hardware page sections">
    <a href="#gpu-numbers">GPU numbers</a>
    <a href="#compare">Compare hardware</a>
    <a href="#memory">Memory systems</a>
    <a href="#materials">Minerals &amp; inputs</a>
    <a href="#fabs">Fab projects</a>
    <a href="#conversion">Retool economics</a>
  </nav>
  <p class="hardware-atlas-bridge">Need the compact production-route view? <a href="{{ '/industry/#supply-chain' | relative_url }}">Open the eight-stage supply-chain map →</a></p>

  <details class="intel-method-disclosure card">
    <summary>Exactly how TriWei assembled and computes this view</summary>
    <div class="intel-method-stack intel-method-grid">
      <p><strong>AI's role</strong>{{ hardware.generation_method.automation | escape }}</p>
      <p><strong>Comparator math</strong>{{ hardware.generation_method.comparison | escape }}</p>
      <p><strong>Workload buttons</strong>{{ hardware.generation_method.workload_modes | escape }}</p>
      <p><strong>Factory interpretation</strong>{{ hardware.generation_method.projects | escape }}</p>
      <p><strong>What “checked” means</strong>{{ hardware.generation_method.verification | escape }}</p>
    </div>
  </details>

  <section class="hardware-section card" id="gpu-numbers" aria-labelledby="gpu-numbers-title">
    <div class="intel-section-head">
      <div>
        <p class="intel-kicker">Start here</p>
        <h2 id="gpu-numbers-title">VRAM is a gate—not a performance score</h2>
      </div>
      <p>A larger memory pool may be slower. A faster GPU may be unusable if the workload does not fit.</p>
    </div>
    <div class="hardware-rule">
      <strong>FIT</strong><span aria-hidden="true">→</span><strong>FEED</strong><span aria-hidden="true">→</span><strong>COMPUTE</strong><span aria-hidden="true">→</span><strong>SUSTAIN</strong>
      <p>Capacity decides whether the allocation fits. Bandwidth and cache feed the compute engines. Architecture and software turn silicon into useful work. Power, cooling, and interconnect determine whether it sustains and scales.</p>
    </div>
    <div class="hardware-metric-grid">
      {% for metric in hardware.metrics %}
      <details data-hardware-metric="{{ metric.key | escape }}">
        <summary title="Open how this factor is measured"><span>0{{ forloop.index }}</span><h3>{{ metric.label | escape }}</h3><strong>{{ metric.question | escape }}</strong><small>Open measurement + limits</small></summary>
        <div><p>{{ metric.explanation | escape }}</p><p><strong>How TriWei uses it</strong>{{ metric.method | escape }}</p><p><strong>Limit</strong>{{ metric.limit | escape }}</p></div>
      </details>
      {% endfor %}
    </div>
  </section>

  <section class="hardware-section card" id="compare" aria-labelledby="hardware-compare-title">
    <div class="intel-section-head">
      <div>
        <p class="intel-kicker">Interactive comparator</p>
        <h2 id="hardware-compare-title">Compare the whole path—not one number</h2>
      </div>
      <p>{{ hardware.comparison_note | escape }}</p>
    </div>

    <div class="hardware-mode-controls" role="group" aria-label="Choose comparison workload">
      <button type="button" data-hardware-mode="local-llm" aria-pressed="true">Local LLM</button>
      <button type="button" data-hardware-mode="creative" aria-pressed="false">Rendering &amp; creative</button>
      <button type="button" data-hardware-mode="data-center" aria-pressed="false">Data center</button>
    </div>
    <p class="hardware-mode-copy" id="hardware-mode-copy" aria-live="polite">Local LLM: first ask whether weights, runtime, context, and KV cache fit; then compare bandwidth, compute, kernels, and offload cost.</p>
    <details class="intel-inline-proof"><summary>How does this comparator calculate the display?</summary><div class="intel-proof-grid"><p><strong>Record selection</strong>{{ hardware.generation_method.comparison | escape }}</p><p><strong>Workload emphasis</strong>{{ hardware.generation_method.workload_modes | escape }}</p><p><strong>Source boundary</strong>{{ hardware.generation_method.verification | escape }}</p><p><strong>Decision boundary</strong>{{ hardware.comparison_note | escape }}</p></div></details>

    <div class="hardware-compare-selectors">
      <label>Hardware A<select id="hardware-left">{% for gpu in hardware.gpus %}<option value="{{ gpu.key | escape }}"{% if gpu.key == 'rtx-4070-super-12' %} selected{% endif %}>{{ gpu.name | escape }}</option>{% endfor %}</select></label>
      <span aria-hidden="true">VS</span>
      <label>Hardware B<select id="hardware-right">{% for gpu in hardware.gpus %}<option value="{{ gpu.key | escape }}"{% if gpu.key == 'rtx-4060-ti-16' %} selected{% endif %}>{{ gpu.name | escape }}</option>{% endfor %}</select></label>
    </div>
    <div class="hardware-comparison" id="hardware-comparison" aria-live="polite"></div>

    <aside class="hardware-12-vs-16">
      <p class="intel-kicker">The exact 12 GB vs 16 GB lesson</p>
      <div>
        <article><strong>RTX 4070 SUPER · 12GB</strong><span>7,168 CUDA cores · 192-bit GDDR6X · 568 AI TOPS</span><p>More compute, a wider bus, and faster memory can make a fitting workload run faster.</p></article>
        <span class="hardware-versus" aria-hidden="true">≠</span>
        <article><strong>RTX 4060 Ti · 16GB</strong><span>4,352 CUDA cores · 128-bit GDDR6 · 353 AI TOPS</span><p>The extra 4GB can keep a larger allocation local—an absolute advantage when 12GB cannot fit it.</p></article>
      </div>
    </aside>

    <div class="hardware-fit-table" role="region" aria-label="Approximate local model memory-fit examples" tabindex="0">
      <details class="intel-inline-proof" open><summary>Show the arithmetic and omissions behind this table</summary><p>{{ hardware.model_fit_method | escape }}</p></details>
      <table>
        <caption>4-bit raw-weight arithmetic—not a benchmark or practical-fit promise</caption>
        <thead><tr><th>Model class</th><th>Raw weight floor</th><th>4060 Ti 16GB</th><th>4070 SUPER 12GB</th><th>What the arithmetic omits</th></tr></thead>
        <tbody>{% for example in hardware.model_fit_examples %}<tr><th scope="row">{{ example.label | escape }}</th><td>{{ example.raw_floor | escape }}</td><td>{{ example.rtx_4060_ti | escape }}</td><td>{{ example.rtx_4070_super | escape }}</td><td>{{ example.note | escape }}</td></tr>{% endfor %}</tbody>
      </table>
    </div>
  </section>

  <section class="hardware-section card" id="memory" aria-labelledby="memory-title">
    <div class="intel-section-head">
      <div><p class="intel-kicker">Memory map</p><h2 id="memory-title">Four architectures people often collapse into “RAM”</h2></div>
      <p>Capacity, placement, bandwidth, coherency, and distance from the compute die change what the same number of gigabytes can do.</p>
    </div>
    <div class="memory-architecture-grid">
      {% for memory in hardware.memory_architectures %}
      <details>
        <summary title="Open strengths and constraints"><span>0{{ forloop.index }}</span><h3>{{ memory.label | escape }}</h3><p class="memory-path">{{ memory.path | escape }}</p><small>Open strength + constraint</small></summary>
        <div><p><strong>Strength</strong>{{ memory.strength | escape }}</p><p><strong>Constraint</strong>{{ memory.constraint | escape }}</p></div>
      </details>
      {% endfor %}
    </div>
  </section>

  <section class="hardware-section card" id="materials" aria-labelledby="materials-title">
    <div class="intel-section-head">
      <div><p class="intel-kicker">5W1H material ledger</p><h2 id="materials-title">Where minerals and process inputs actually enter</h2></div>
      <p>The map distinguishes the silicon substrate from materials used in interconnects, optics, power, tools, cooling, networking, and packaging.</p>
    </div>
    <div class="materials-ledger">
      {% for material in hardware.materials %}
      <details{% if forloop.first %} open{% endif %}>
        <summary><span>0{{ forloop.index }}</span><strong>{{ material.key | replace: '-', ' ' | capitalize | escape }}</strong><em>{{ material.myth | escape }}</em></summary>
        <dl>
          <div><dt>What</dt><dd>{{ material.what | escape }}</dd></div>
          <div><dt>Who</dt><dd>{{ material.who | escape }}</dd></div>
          <div><dt>Where</dt><dd>{{ material.where | escape }}</dd></div>
          <div><dt>When</dt><dd>{{ material.when | escape }}</dd></div>
          <div><dt>Why</dt><dd>{{ material.why | escape }}</dd></div>
          <div><dt>How</dt><dd>{{ material.how | escape }}</dd></div>
        </dl>
        <a href="{{ material.source_url | escape }}" target="_blank" rel="noopener noreferrer">{{ material.source_label | escape }} ↗</a>
      </details>
      {% endfor %}
    </div>
  </section>

  <section class="hardware-section card" id="fabs" aria-labelledby="fabs-title">
    <div class="intel-section-head">
      <div><p class="intel-kicker">Factory logistics</p><h2 id="fabs-title">A fab announcement is the start of the clock</h2></div>
      <p>Buildings, utilities, tools, process transfer, customer qualification, and yield must all converge before announced capacity becomes usable output.</p>
    </div>
    <div class="fab-timeline">
      {% for fab in hardware.fab_projects %}
      <article>
        <div class="fab-status" title="Status wording follows the cited company disclosure; open the method below.">Source status · {{ fab.status | escape }}</div>
        <h3>{{ fab.name | escape }}</h3><p class="fab-place">{{ fab.place | escape }}</p>
        <dl><div><dt>Function</dt><dd>{{ fab.function | escape }}</dd></div><div><dt>Start</dt><dd>{{ fab.announced | escape }}</dd></div><div><dt>Output</dt><dd>{{ fab.production | escape }}</dd></div><div><dt>Capital</dt><dd>{{ fab.investment | escape }}</dd></div><div><dt>Clock</dt><dd>{{ fab.elapsed | escape }}</dd></div></dl>
        <p class="fab-lesson"><strong>What it teaches:</strong> {{ fab.lesson | escape }}</p>
        <a href="{{ fab.source_url | escape }}" target="_blank" rel="noopener noreferrer">{{ fab.source_label | escape }} ↗</a>
        <details class="intel-inline-proof"><summary>How should I read this status?</summary><p>{{ hardware.generation_method.projects | escape }} {{ hardware.generation_method.verification | escape }}</p></details>
      </article>
      {% endfor %}
    </div>
  </section>

  <section class="hardware-section card" id="conversion" aria-labelledby="conversion-title">
    <div class="intel-section-head">
      <div><p class="intel-kicker">Cost-benefit framework</p><h2 id="conversion-title">Keep, retool, repurpose, or replace?</h2></div>
      <p>An old-node fab is not automatically obsolete, and a leading-edge fab is not an in-place software upgrade.</p>
    </div>
    <div class="conversion-equation"><span>Incremental good dies × price × utilization</span><strong>−</strong><span>capex + downtime + qualification + yield risk + operating cost</span><strong>=</strong><span>risk-adjusted value</span></div>
    <div class="conversion-grid">
      {% for option in hardware.conversion_options %}
      <details class="conversion-{{ option.key }}"><summary title="Open the decision factors"><span>0{{ forloop.index }}</span><h3>{{ option.label | escape }}</h3><small>Open decision factors</small></summary><div><p><strong>Best when</strong>{{ option.best_when | escape }}</p><p><strong>Benefit</strong>{{ option.benefit | escape }}</p><p><strong>Cost</strong>{{ option.cost | escape }}</p><p><strong>Hidden gate</strong>{{ option.hidden_gate | escape }}</p><p class="intel-framework-note">Decision framework—not a market forecast or a project-specific financial model.</p></div></details>
      {% endfor %}
    </div>
    <h3 class="conversion-clock-title">The conversion clock has five separate gates</h3>
    <ol class="conversion-clock">{% for clock in hardware.conversion_clock %}<li><details><summary><span>{{ clock.step | escape }}</span><strong>{{ clock.label | escape }}</strong><small>Open gate</small></summary><p>{{ clock.detail | escape }}</p></details></li>{% endfor %}</ol>
  </section>

  <section class="intel-boundary card" aria-labelledby="hardware-boundary-title">
    <p class="intel-kicker">How to use this page</p><h2 id="hardware-boundary-title">Specifications narrow a decision; workload tests finish it</h2>
    <div class="intel-boundary-grid"><p><strong>No universal winner.</strong> The comparator explains resource gates but does not replace benchmarks on the exact model, precision, context, batch, software, and thermal configuration.</p><p><strong>No false precision.</strong> Local-model memory ranges include overhead and remain illustrative because runtimes and KV cache behavior differ.</p><p><strong>Project dates move.</strong> Fab schedules are source-dated and should be revised when companies change demand, financing, permitting, or construction plans.</p><p><strong>Mature nodes matter.</strong> Power, analog, control, networking, storage, and reliability-focused chips can remain economically valuable long after a logic node stops being “leading edge.”</p></div>
    <ul class="intel-source-list">{% for source in hardware.sources %}<li><a href="{{ source.url | escape }}" target="_blank" rel="noopener noreferrer">{{ source.label | escape }} ↗</a></li>{% endfor %}</ul>
  </section>
</div>

<script id="hardware-data" type="application/json">{{ hardware.gpus | jsonify }}</script>
<script src="{{ '/assets/js/hardware-intelligence.js' | relative_url }}" defer></script>
