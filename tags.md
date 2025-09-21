---
layout: default
title: Tags
permalink: /tags/
---

## Tags

<ul class="tag-cloud">
  {% assign tags = site.tags | sort %}
  {% for tag in tags %}
    <li><a href="#{{ tag[0] }}">{{ tag[0] }} ({{ tag[1].size }})</a></li>
  {% endfor %}
</ul>

<hr>

{% for tag in tags %}
  <h2 id="{{ tag[0] }}">{{ tag[0] }}</h2>
  <ul>
    {% for post in tag[1] %}
      <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a> · {{ post.date | date: "%b %-d, %Y" }}</li>
    {% endfor %}
  </ul>
{% endfor %}
