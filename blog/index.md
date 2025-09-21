---
layout: page
title: Blog
permalink: /blog/
---

# Blog

{% for post in site.posts %}
<article>
  <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
  <p><small>{{ post.date | date: "%B %-d, %Y" }}</small></p>
  <p>{{ post.excerpt | strip_html | truncate: 180 }}</p>
</article>
{% endfor %}
