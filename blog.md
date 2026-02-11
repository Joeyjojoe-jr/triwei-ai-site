---
layout: page
title: Blog
permalink: /blog/
description: Learning notes pulled from the _blog collection.
---
{% assign notes = site.blog | sort: "date" | reverse %}

{% if notes.size > 0 %}
<div class="simple-list">
  {% for note in notes %}
  <article class="simple-list-item">
    <h3><a href="{{ note.url | relative_url }}">{{ note.title }}</a></h3>
    <p>{{ note.date | date: "%B %-d, %Y" }} · {{ note.excerpt | default: note.content | strip_html | strip_newlines | truncate: 150 }}</p>
  </article>
  {% endfor %}
</div>
{% else %}
<p>No notes yet. Add Markdown files in <code>_blog/</code>.</p>
{% endif %}
