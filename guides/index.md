---
layout: page
title: Guides
permalink: /guides/
description: Step-by-step operational guides.
---
<!-- This index auto-lists Markdown pages inside /guides/. -->
{% assign guide_pages = site.pages | where_exp: 'item', "item.url contains '/guides/' and item.url != '/guides/'" | sort: 'title' %}

{% if guide_pages.size > 0 %}
<div class="simple-list">
  {% for guide in guide_pages %}
  <article class="simple-list-item">
    <h3><a href="{{ guide.url | relative_url }}">{{ guide.title }}</a></h3>
    <p>{{ guide.description | default: guide.excerpt | default: guide.content | strip_html | strip_newlines | truncate: 150 }}</p>
  </article>
  {% endfor %}
</div>
{% else %}
<p>No guides yet. Add Markdown files in <code>/guides/</code>.</p>
{% endif %}
