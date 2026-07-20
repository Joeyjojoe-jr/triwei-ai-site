---
layout: default
title: AI Industry Atlas
permalink: /industry/
description: Five evidence-backed views of the AI industry, plus a primary-source watch on model distillation and open-weight diffusion.
atlas: true
---
{% assign atlas = site.data.industry %}

<article class="atlas" data-industry-atlas>
  <header class="atlas-hero card animate-in">
    <p class="eyebrow">Data, not hype</p>
    <h1>The AI industry, in five questions</h1>
    <p class="lead">Move from what is getting attention to who is building, what delivers value, where AI is actually used, and which companies can sustain the frontier.</p>
    <div class="atlas-freshness" aria-label="Atlas freshness">
      <span>Industry data refreshed {{ atlas.generated_display | escape }}</span>
      <span>Coverage snapshot {{ atlas.coverage_generated_display | escape }}</span>
    </div>

    <nav class="atlas-path" aria-label="Industry Atlas sections">
      <ol>
        <li><a href="#diffusion"><span>Watch</span>Frontier diffusion</a></li>
        <li><a href="#momentum"><span>01</span>Momentum</a></li>
        <li><a href="#stack"><span>02</span>Industry stack</a></li>
        <li><a href="#value"><span>03</span>Model value</a></li>
        <li><a href="#adoption"><span>04</span>Adoption</a></li>
        <li><a href="#economics"><span>05</span>Lab economics</a></li>
      </ol>
    </nav>

    <div class="atlas-key" aria-label="Metric types">
      <span><i class="atlas-type atlas-type-coverage" aria-hidden="true"></i><strong>Coverage signal</strong> — what TriWei's screened stories emphasize</span>
      <span><i class="atlas-type atlas-type-market" aria-hidden="true"></i><strong>Industry measure</strong> — a statistic from an external dataset</span>
      <span><i class="atlas-type atlas-type-strategic" aria-hidden="true"></i><strong>Strategic watch</strong> — claims, disclosures, and releases kept in separate evidence classes</span>
    </div>
  </header>

  {% assign diffusion = atlas.diffusion_watch %}
  <section class="atlas-section atlas-diffusion card animate-in" id="diffusion" aria-labelledby="diffusion-title">
    <header class="atlas-section-head">
      <div class="atlas-index atlas-index-watch" aria-hidden="true">↗</div>
      <div>
        <p class="atlas-kind atlas-kind-strategic">Strategic watch</p>
        <h2 id="diffusion-title">How fast are frontier capabilities diffusing into open weights?</h2>
        <p>Track China-based model labs across disclosed teacher-to-student training, provider-attributed extraction claims, capability convergence, and verified weight releases.</p>
      </div>
    </header>

    <div class="diffusion-kpis" aria-label="Frontier diffusion summary">
      <div><strong>{{ diffusion.coverage.story_count }}</strong><span>current coverage signals</span></div>
      <div><strong>{{ diffusion.coverage.lab_count }}</strong><span>labs in this snapshot</span></div>
      <div><strong>{{ diffusion.milestones.size }}</strong><span>primary-source milestones</span></div>
      <div><strong>{{ diffusion.coverage.observed_days }}</strong><span>signal days in {{ diffusion.coverage.window_days }}-day window</span></div>
    </div>

    <div class="diffusion-flow" aria-label="Model diffusion pathway">
      <div class="diffusion-stage">
        <span>01 · Source capability</span>
        <strong>Frontier APIs or an owned teacher</strong>
        <p>The origin must be stated or attributed—not inferred from benchmark similarity.</p>
      </div>
      <span class="diffusion-arrow" aria-hidden="true">→</span>
      <div class="diffusion-stage">
        <span>02 · Training transfer</span>
        <strong>Distillation, synthetic data, or extraction</strong>
        <p>Legitimate disclosed distillation and alleged unauthorized extraction are labeled differently.</p>
      </div>
      <span class="diffusion-arrow" aria-hidden="true">→</span>
      <div class="diffusion-stage">
        <span>03 · Capability diffusion</span>
        <strong>Cheaper APIs and open weights</strong>
        <p>Release status is verified separately from performance and provenance claims.</p>
      </div>
    </div>

    <div class="diffusion-grid">
      <div>
        <div class="diffusion-subhead">
          <div>
            <p class="eyebrow">Evidence timeline</p>
            <h3>What is documented—and by whom</h3>
          </div>
          <span>Updated with primary sources</span>
        </div>
        <ol class="diffusion-timeline">
          {% for milestone in diffusion.milestones reversed %}
          <li class="diffusion-event diffusion-event-{{ milestone.evidence_class }}">
            <time datetime="{{ milestone.date | escape }}">{{ milestone.date | date: "%b %d, %Y" }}</time>
            <div>
              <div class="diffusion-event-meta">
                <span class="evidence-badge evidence-{{ milestone.evidence_class }}">{% for evidence in diffusion.evidence_classes %}{% if evidence.key == milestone.evidence_class %}{{ evidence.label | escape }}{% endif %}{% endfor %}</span>
                <span>{{ milestone.lab | escape }}</span>
              </div>
              <h4>{{ milestone.headline | escape }}</h4>
              <p>{{ milestone.detail | escape }}</p>
              <div class="diffusion-event-foot">
                <span>Weights: {{ milestone.open_weight_status | escape }}</span>
                <a href="{{ milestone.source_url | escape }}" target="_blank" rel="noopener noreferrer">{{ milestone.source_label | escape }} ↗</a>
              </div>
            </div>
          </li>
          {% endfor %}
        </ol>
      </div>

      <aside class="diffusion-evidence" aria-labelledby="diffusion-evidence-title">
        <p class="eyebrow">Evidence key</p>
        <h3 id="diffusion-evidence-title">Confidence comes from classification</h3>
        <ul>
          {% for evidence in diffusion.evidence_classes %}
          <li>
            <span class="evidence-badge evidence-{{ evidence.key }}">{{ evidence.label | escape }}</span>
            <p>{{ evidence.meaning | escape }}</p>
          </li>
          {% endfor %}
        </ul>
        <p class="diffusion-rule"><strong>Editorial rule:</strong> matching output style or benchmark performance is not proof of model lineage.</p>
      </aside>
    </div>

    <div class="diffusion-coverage">
      <div class="diffusion-subhead">
        <div>
          <p class="eyebrow">Live coverage signal</p>
          <h3>What the current news cycle is connecting</h3>
        </div>
        <span>{{ diffusion.coverage.metric | escape }}</span>
      </div>
      {% if diffusion.coverage.stories.size > 0 %}
      <ul class="diffusion-story-list">
        {% for story in diffusion.coverage.stories %}
        <li>
          <div>
            <span>{{ story.labs | join: " · " | escape }}</span>
            <a href="{{ story.link | escape }}" target="_blank" rel="noopener noreferrer">{{ story.title | escape }}</a>
          </div>
          <small>{{ story.source | escape }}{% if story.published_display %} · {{ story.published_display | escape }}{% endif %}</small>
        </li>
        {% endfor %}
      </ul>
      {% else %}
      <p class="diffusion-empty">No current coverage item meets both tests: a tracked lab and a diffusion signal. The primary-source timeline remains available above.</p>
      {% endif %}
    </div>

    <aside class="atlas-readout diffusion-readout">
      <strong>Read the signal</strong>
      <p>The timeline records releases, developer disclosures, and named provider claims. The live count measures TriWei coverage only. Neither is a verdict about the undisclosed training lineage of any model.</p>
    </aside>
  </section>

  <section class="atlas-section card animate-in" id="momentum" aria-labelledby="momentum-title">
    <header class="atlas-section-head">
      <div class="atlas-index" aria-hidden="true">01</div>
      <div>
        <p class="atlas-kind atlas-kind-coverage">Coverage signal</p>
        <h2 id="momentum-title">What is gaining momentum?</h2>
        <p>Daily share of distinct stories mentioning each leading topic. This separates a single news spike from a theme that keeps returning.</p>
      </div>
    </header>
    <div class="atlas-metric-line">
      <span>{{ atlas.topic_lifecycle.observed_days }} days observed</span>
      <span>Growing toward a {{ atlas.topic_lifecycle.window_days }}-day window</span>
    </div>
    <div class="atlas-chart atlas-line-chart" data-atlas-chart="topics" role="group" aria-label="Topic momentum chart">
      <p class="atlas-loading">Preparing the topic timeline…</p>
    </div>
    <aside class="atlas-readout">
      <strong>Read the signal</strong>
      <p>Compare direction and persistence, not just height. A high line means a large share of this site's current coverage mentions the topic; it does not mean market share.</p>
    </aside>
    <details class="atlas-data-table">
      <summary>View topic data</summary>
      <div class="atlas-table-scroll">
        <table>
          <thead><tr><th>Topic</th><th>Total signals</th><th>Days tracked</th></tr></thead>
          <tbody>
          {% for series in atlas.topic_lifecycle.series %}
            <tr><th scope="row">{{ series.term | escape }}</th><td>{{ series.total }}</td><td>{{ series.points.size }}</td></tr>
          {% endfor %}
          </tbody>
        </table>
      </div>
    </details>
  </section>

  <section class="atlas-section card animate-in" id="stack" aria-labelledby="stack-title">
    <header class="atlas-section-head">
      <div class="atlas-index" aria-hidden="true">02</div>
      <div>
        <p class="atlas-kind atlas-kind-coverage">Coverage signal</p>
        <h2 id="stack-title">Who is active where?</h2>
        <p>A company-by-layer map of current coverage, from chips and cloud infrastructure through models, applications, and society.</p>
      </div>
    </header>
    <div class="atlas-chart atlas-heatmap" data-atlas-chart="stack" role="group" aria-label="Company activity heatmap">
      <p class="atlas-loading">Mapping the industry stack…</p>
    </div>
    <div class="atlas-selection" data-atlas-selection="stack" aria-live="polite">Select a cell to inspect its count.</div>
    <aside class="atlas-readout">
      <strong>Read the signal</strong>
      <p>Darker cells mean more current TriWei stories connect that company to that layer. A blank cell means no matching story in this snapshot—not that the company has no activity there.</p>
    </aside>
    <details class="atlas-data-table">
      <summary>View company-layer data</summary>
      <div class="atlas-table-scroll">
        <table>
          <thead>
            <tr><th>Company</th>{% for layer in atlas.industry_stack.layers %}<th>{{ layer.label | escape }}</th>{% endfor %}<th>All stories</th></tr>
          </thead>
          <tbody>
          {% for company in atlas.industry_stack.companies %}
            <tr><th scope="row">{{ company.name | escape }}</th>{% for cell in company.cells %}<td>{{ cell.count }}</td>{% endfor %}<td>{{ company.story_count }}</td></tr>
          {% endfor %}
          </tbody>
        </table>
      </div>
    </details>
  </section>

  <section class="atlas-section card animate-in" id="value" aria-labelledby="value-title">
    <header class="atlas-section-head">
      <div class="atlas-index" aria-hidden="true">03</div>
      <div>
        <p class="atlas-kind atlas-kind-market">Industry measure</p>
        <h2 id="value-title">Which models deliver value?</h2>
        <p>Independent benchmark performance versus standardized API price. The highlighted frontier contains models that were not beaten by a cheaper option in this research snapshot.</p>
      </div>
    </header>
    {% if atlas.model_frontier.status == "unavailable" %}
      <p class="empty-state">{{ atlas.model_frontier.message | escape }}</p>
    {% else %}
      <div class="atlas-metric-line">
        <span>{{ atlas.model_frontier.benchmark | escape }}</span>
        <span>Research data through {{ atlas.model_frontier.data_through | date: "%b %Y" }}</span>
      </div>
      <div class="atlas-chart atlas-scatter" data-atlas-chart="models" role="group" aria-label="Model value frontier chart">
        <p class="atlas-loading">Plotting price and performance…</p>
      </div>
      <div class="atlas-selection" data-atlas-selection="models" aria-live="polite">Select a model for exact values.</div>
      <aside class="atlas-readout">
        <strong>Read the signal</strong>
        <p>Up and left is better: higher benchmark performance at a lower token price. This is a value lens, not a universal model ranking; reliability, context, latency, and task fit still matter.</p>
      </aside>
      <details class="atlas-data-table">
        <summary>View model data and caveats</summary>
        <p>{{ atlas.model_frontier.price_metric | escape }}. Reasoning-model costs can be understated by per-token comparisons because those models may generate more tokens.</p>
        <div class="atlas-table-scroll">
          <table>
            <thead><tr><th>Model</th><th>Organization</th><th>Price</th><th>{{ atlas.model_frontier.benchmark | escape }}</th><th>Value frontier</th></tr></thead>
            <tbody>
            {% for model in atlas.model_frontier.models %}
              <tr><th scope="row">{{ model.name | escape }}</th><td>{{ model.organization | escape }}</td><td>${{ model.price }}</td><td>{{ model.score }}</td><td>{% if model.frontier %}Yes{% else %}No{% endif %}</td></tr>
            {% endfor %}
            </tbody>
          </table>
        </div>
      </details>
    {% endif %}
  </section>

  <section class="atlas-section card animate-in" id="adoption" aria-labelledby="adoption-title">
    <header class="atlas-section-head">
      <div class="atlas-index" aria-hidden="true">04</div>
      <div>
        <p class="atlas-kind atlas-kind-market">Industry measure</p>
        <h2 id="adoption-title">Where is AI actually being used?</h2>
        <p>Current and expected AI use among U.S. employer businesses. The distance between the dots is the near-term adoption gap.</p>
      </div>
    </header>
    {% if atlas.adoption.status == "unavailable" %}
      <p class="empty-state">{{ atlas.adoption.message | escape }}</p>
    {% else %}
      <div class="atlas-metric-line">
        <span>{{ atlas.adoption.period | escape }}</span>
        <span>Firm-weighted share</span>
      </div>
      <div class="atlas-chart atlas-dumbbell" data-atlas-chart="adoption" role="group" aria-label="AI adoption by business sector">
        <p class="atlas-loading">Comparing current and expected use…</p>
      </div>
      <aside class="atlas-readout">
        <strong>Read the signal</strong>
        <p>Adoption is uneven: information-intensive sectors lead, while physical and service sectors remain lower. Expected use measures intention, not guaranteed deployment.</p>
      </aside>
      <details class="atlas-data-table">
        <summary>View all sectors and methodology</summary>
        <p>{{ atlas.adoption.method_note | escape }}</p>
        <div class="atlas-table-scroll">
          <table>
            <thead><tr><th>Sector</th><th>Current use</th><th>Expected use</th><th>Gap</th></tr></thead>
            <tbody>
            {% for sector in atlas.adoption.sectors %}
              <tr><th scope="row">{{ sector.name | escape }}</th><td>{{ sector.current }}%</td><td>{{ sector.expected }}%</td><td>{{ sector.gap }} pts</td></tr>
            {% endfor %}
            </tbody>
          </table>
        </div>
      </details>
    {% endif %}
  </section>

  <section class="atlas-section card animate-in" id="economics" aria-labelledby="economics-title">
    <header class="atlas-section-head">
      <div class="atlas-index" aria-hidden="true">05</div>
      <div>
        <p class="atlas-kind atlas-kind-market">Industry measure</p>
        <h2 id="economics-title">Who can afford the frontier?</h2>
        <p>Cumulative equity funding versus latest reported annualized revenue for selected private foundation-model companies.</p>
      </div>
    </header>
    {% if atlas.company_economics.status == "unavailable" %}
      <p class="empty-state">{{ atlas.company_economics.message | escape }}</p>
    {% else %}
      <div class="atlas-chart atlas-scatter" data-atlas-chart="economics" role="group" aria-label="Frontier AI company economics chart">
        <p class="atlas-loading">Plotting company scale…</p>
      </div>
      <div class="atlas-selection" data-atlas-selection="economics" aria-live="polite">Select a company for exact values.</div>
      <aside class="atlas-readout">
        <strong>Read the signal</strong>
        <p>Upper-right companies combine large capital bases with meaningful revenue scale. Funding is cumulative and revenue is annualized, so the chart shows operating position—not profitability.</p>
      </aside>
      <details class="atlas-data-table">
        <summary>View company data and caveats</summary>
        <p>{{ atlas.company_economics.method_note | escape }}</p>
        <div class="atlas-table-scroll">
          <table>
            <thead><tr><th>Company</th><th>Equity funding</th><th>Annualized revenue</th><th>Staff</th><th>Confidence</th></tr></thead>
            <tbody>
            {% for company in atlas.company_economics.companies %}
              <tr><th scope="row">{{ company.name | escape }}</th><td data-money="{{ company.funding }}">{{ company.funding }}</td><td data-money="{{ company.revenue }}">{{ company.revenue }}</td><td>{{ company.staff | default: "—" }}</td><td>{{ company.confidence | escape }}</td></tr>
            {% endfor %}
            </tbody>
          </table>
        </div>
      </details>
    {% endif %}
  </section>

  <section class="atlas-method card animate-in" aria-labelledby="atlas-method-title">
    <p class="eyebrow">How to trust the atlas</p>
    <h2 id="atlas-method-title">Different evidence, clearly labeled</h2>
    <p>Coverage charts describe this site's screened news sample. They are useful for attention and narrative, never as a substitute for revenue, adoption, or market share. Industry charts retain the definitions and caveats of their source datasets.</p>
    <ul class="atlas-source-list">
      {% for source_pair in atlas.sources %}
        {% assign source = source_pair[1] %}
        <li><span class="atlas-kind atlas-kind-{{ source.kind }}">{{ source.kind | capitalize }}</span><a href="{{ source.url | escape }}"{% unless source.url contains '/sources/' %} target="_blank" rel="noopener noreferrer"{% endunless %}>{{ source.label | escape }}</a></li>
      {% endfor %}
    </ul>
    <p class="atlas-method-note">The Census AI question changed in November 2025 to cover use in “any business function,” so the adoption view does not splice the newer series onto the older wording. Model and private-company estimates are snapshots, not live quotes.</p>
  </section>
</article>

<script id="industry-atlas-data" type="application/json">{{ atlas | jsonify }}</script>
<script src="{{ '/assets/js/industry-atlas.js' | relative_url }}" defer></script>
