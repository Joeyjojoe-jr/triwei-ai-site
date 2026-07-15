---
layout: default
title: Ethics Watch
permalink: /ethics/
description: Every AI story, screened for its ethical dimensions — bias, safety, privacy, copyright, labor, energy, and regulation.
---
{% assign news = site.data.news %}

<section class="hero card animate-in">
  <p class="eyebrow">the lens</p>
  <h1>Ethics Watch</h1>
  <p class="lead">TriWei AI reads every headline for its ethical stakes. Below are the themes surfacing most across current coverage, and the stories driving them.</p>
  {% if news %}<p class="updated-stamp">Last updated {{ news.generated_display | escape }}</p>{% endif %}
</section>

{% if news %}
{% if news.ethics_themes.size > 0 %}
<section class="section-block animate-in">
  <div class="section-heading">
    <h2>themes in play</h2>
    <p>How strongly each ethical dimension is running across today's tracked stories.</p>
  </div>
  {% assign maxc = news.ethics_themes[0].count %}
  <div class="heat-list">
    {% for th in news.ethics_themes %}
    <div class="heat-row">
      <span class="heat-label">{{ th.theme | escape }}</span>
      <span class="heat-bar"><span class="heat-fill" style="width: {{ th.count | times: 100 | divided_by: maxc }}%;"></span></span>
      <span class="heat-num">{{ th.count }}</span>
    </div>
    {% endfor %}
  </div>
</section>
{% endif %}

<section class="section-block animate-in">
  <div class="section-heading">
    <h2>flagged stories</h2>
    <p>Every item here touches at least one ethical dimension. Tags and heat marks show how many.</p>
  </div>
  <div class="news-list">
    {% for item in news.ethics_watch %}
    <article class="news-item ethics-flagged">
      <h3><a href="{{ item.link | escape }}" target="_blank" rel="noopener noreferrer">{{ item.title | escape }}</a></h3>
      <p class="news-meta">
        <span class="cat-pill cat-{{ item.category }}">{{ item.category_label | escape }}</span>
        {{ item.source | escape }}{% if item.published_display %} <span class="sep">·</span> {{ item.published_display | escape }}{% endif %}
        <span class="card-heat" title="{{ item.ethics_tags.size }} ethical dimensions">{% for t in item.ethics_tags %}▰{% endfor %}</span>
      </p>
      {% if item.summary != "" %}<p class="news-summary">{{ item.summary | escape }}</p>{% endif %}
      {% if item.ethics_tags.size > 0 %}
      <ul class="ethics-tags">{% for t in item.ethics_tags %}<li>{{ t | escape }}</li>{% endfor %}</ul>
      {% endif %}
    </article>
    {% endfor %}
  </div>
</section>
{% else %}
<p class="empty-state">Ethics data has not been generated yet.</p>
{% endif %}
