---
layout: page
title: Experiments
permalink: /experiments/
description: Practical AI experiments, ordered by date.
---
<!-- This index auto-lists files from _experiments/. -->
{% assign experiments = site.experiments | sort: 'date' | reverse %}

{% if experiments.size > 0 %}
<div class="simple-list">
  {% for experiment in experiments %}
  <article class="simple-list-item">
    <h3><a href="{{ experiment.url | relative_url }}">{{ experiment.title }}</a></h3>
    <p>{{ experiment.date | date: '%B %-d, %Y' }} · {{ experiment.excerpt | default: experiment.content | strip_html | strip_newlines | truncate: 150 }}</p>
  </article>
  {% endfor %}
</div>
{% else %}
<p>No experiments yet. Add Markdown files in <code>_experiments/</code>.</p>
{% endif %}
