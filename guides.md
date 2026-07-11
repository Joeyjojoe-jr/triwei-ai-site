---
layout: page
title: Guides
permalink: /guides/
description: Operational guides from the _guides collection.
---
{% assign guides = site.guides | sort: "title" %}

{% if guides.size > 0 %}
<div class="simple-list">
  {% for guide in guides %}
  <article class="simple-list-item">
    <h3><a href="{{ guide.url | relative_url }}">{{ guide.title }}</a></h3>
    <p>{{ guide.description | default: guide.excerpt | default: guide.content | strip_html | strip_newlines | truncate: 150 }}</p>
  </article>
  {% endfor %}
</div>
{% else %}
<p>No guides yet. Add Markdown files in <code>_guides/</code>.</p>
{% endif %}
