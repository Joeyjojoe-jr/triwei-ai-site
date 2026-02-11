---
layout: page
title: Blog
permalink: /blog/
description: Lightweight notes from the learning journey.
---
<!-- This index auto-lists Markdown notes inside /blog/. -->
{% assign blog_notes = site.pages | where_exp: 'item', "item.url contains '/blog/' and item.url != '/blog/'" | sort: 'date' | reverse %}

{% if blog_notes.size > 0 %}
<div class="simple-list">
  {% for note in blog_notes %}
  <article class="simple-list-item">
    <h3><a href="{{ note.url | relative_url }}">{{ note.title }}</a></h3>
    <p>{{ note.date | date: '%B %-d, %Y' }} · {{ note.excerpt | default: note.content | strip_html | strip_newlines | truncate: 150 }}</p>
  </article>
  {% endfor %}
</div>
{% else %}
<p>No blog notes yet. Add Markdown files in <code>/blog/</code>.</p>
{% endif %}
