---
layout: page
title: Knowledge Map
permalink: /knowledge/
description: Topic pages from the _knowledge collection.
---
{% assign topics = site.knowledge | sort: "title" %}

{% if topics.size > 0 %}
<div class="simple-list">
  {% for topic in topics %}
  <article class="simple-list-item">
    <h3><a href="{{ topic.url | relative_url }}">{{ topic.title }}</a></h3>
    <p>{{ topic.description | default: topic.excerpt | default: topic.content | strip_html | strip_newlines | truncate: 150 }}</p>
  </article>
  {% endfor %}
</div>
{% else %}
<p>No knowledge pages yet. Add Markdown files in <code>_knowledge/</code>.</p>
{% endif %}
