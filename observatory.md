---
layout: default
title: AI Signal Observatory
description: A neutral, machine-collected view of public AI news signals and classification limits.
permalink: /observatory/
---
{% assign news = site.data.news %}
<section class="mall-page-hero mall-panel">
  <p class="mall-kicker">Location 01 · Observatory</p>
  <h1>AI Signal Observatory</h1>
  <p class="mall-lead">This room displays automated collection and classification output. It is an instrumentation panel—not an editorial page.</p>
  <div class="mall-notice" role="note"><strong>Boundary:</strong> inclusion does not indicate endorsement, accuracy, importance, or the views of the site operator.</div>
</section>

{% if news %}
<section class="mall-metric-grid" aria-label="Current data snapshot">
  <div class="mall-metric"><span>Stories indexed</span><strong>{{ news.item_count | default: 0 }}</strong></div>
  <div class="mall-metric"><span>Generated</span><strong>{{ news.generated_display | default: 'Available' }}</strong></div>
  <div class="mall-metric"><span>Collection mode</span><strong>Automated</strong></div>
  <div class="mall-metric"><span>Confidence model</span><strong>Rule-based</strong></div>
</section>

{% if news.trending.size > 0 %}
<section class="mall-section" aria-labelledby="observed-terms">
  <div class="mall-section-heading"><p class="mall-kicker">Frequency instrument</p><h2 id="observed-terms">Frequently observed terms</h2><p>Counts reflect appearances in collected material, not significance or quality.</p></div>
  <div class="mall-signal-cloud">
    {% for t in news.trending limit: 16 %}<span>{{ t.term }} <b>{{ t.count }}</b></span>{% endfor %}
  </div>
</section>
{% endif %}

<section class="mall-section" aria-labelledby="sample-signals">
  <div class="mall-section-heading"><p class="mall-kicker">Sample output</p><h2 id="sample-signals">Recent collected signals</h2><p>Links open the original source in a new tab. Machine labels may be incomplete or wrong.</p></div>
  <div class="mall-signal-list">
    {% assign shown = 0 %}
    {% for key in news.category_order %}
      {% assign group = news.categories[key] %}
      {% for item in group.items limit: 2 %}
        {% if shown < 8 %}
        <article>
          <p class="mall-signal-meta">{{ group.label }} · {{ item.source }}{% if item.published_display %} · {{ item.published_display }}{% endif %}</p>
          <h3><a href="{{ item.link }}" target="_blank" rel="noopener noreferrer">{{ item.title }}</a></h3>
          {% if item.summary != '' %}<p>{{ item.summary | truncate: 180 }}</p>{% endif %}
        </article>
        {% assign shown = shown | plus: 1 %}
        {% endif %}
      {% endfor %}
    {% endfor %}
  </div>
</section>
{% else %}
<section class="mall-panel mall-empty-state"><h2>Instruments offline</h2><p>No generated news data is currently available in this build.</p></section>
{% endif %}

<section class="mall-panel mall-route-note">
  <h2>Known limitations</h2>
  <p>The current collector uses broad queries and rule-based matching. It can misclassify unrelated uses of words such as “benchmark,” “equity,” or “safety.” The Observatory therefore presents raw signals conservatively and keeps them out of the public Atrium.</p>
  <a href="{{ '/methodology/' | relative_url }}">Read the collection boundaries →</a>
</section>
