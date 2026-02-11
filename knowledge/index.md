---
layout: page
title: Knowledge Map
permalink: /knowledge/
description: Core AI topics organized as an expandable map.
---
<!-- This index auto-lists Markdown pages inside /knowledge/. -->
{% assign knowledge_pages = site.pages | where_exp: 'item', "item.url contains '/knowledge/' and item.url != '/knowledge/'" | sort: 'title' %}

{% if knowledge_pages.size > 0 %}
<div class="simple-list">
  {% for item in knowledge_pages %}
  <article class="simple-list-item">
    <h3><a href="{{ item.url | relative_url }}">{{ item.title }}</a></h3>
    <p>{{ item.description | default: item.excerpt | default: item.content | strip_html | strip_newlines | truncate: 150 }}</p>
  </article>
  {% endfor %}
</div>
{% else %}
<p>No knowledge pages yet. Add Markdown files in <code>/knowledge/</code>.</p>
{% endif %}
