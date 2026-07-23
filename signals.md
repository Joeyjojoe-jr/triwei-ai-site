---
layout: default
title: Research Lineage Library
permalink: /signals/
description: Direct scholarly-source links and chronological reading paths without AI paper summaries or unreviewed influence claims.
publication_key: signals
research_lineage: true
---
{% assign lineage = site.data.research_lineage %}

<article class="research-lineage-page">
  <header class="research-lineage-hero card animate-in">
    <p class="eyebrow">Research Lineage Library</p>
    <h1>Trace original papers without replacing them with AI summaries</h1>
    <p>This metadata-first library links directly to scholarly records on arXiv—pronounced “archive.” It is intended to help readers locate and revisit original work while keeping authorship, dates, source status, and uncertainty visible.</p>

    <div class="research-lineage-meta" role="list" aria-label="Research library status">
      <div role="listitem"><span>Verified records</span><strong>{{ lineage.papers.size }}</strong></div>
      <div role="listitem"><span>Provisional reading paths</span><strong>{{ lineage.paths.size }}</strong></div>
      <div role="listitem"><span>Metadata checked</span><strong>{{ lineage.verified_display | escape }}</strong></div>
    </div>
  </header>

  <aside class="research-lineage-disclosure card">
    <p><strong>AI-assistance disclosure:</strong> {{ lineage.curation.assistant_attribution | escape }}</p>
    <p><strong>Publication boundary:</strong> {{ lineage.curation.publication_boundary | escape }}</p>
    <p><strong>Chronology boundary:</strong> {{ lineage.curation.sequence_rule | escape }}</p>
  </aside>

  <section class="lineage-paths" aria-labelledby="lineage-paths-title">
    <header class="source-only-section card">
      <p class="source-only-warning">Metadata-first research paths</p>
      <h2 id="lineage-paths-title">Follow the papers in time order</h2>
      <p>Each card preserves the paper title, named authors, first arXiv submission date, identifier, and direct abstract-page link. The connectors show time order only; they are not claims that one paper caused, influenced, validated, or superseded another.</p>
    </header>

    {% for path in lineage.paths %}
    <section class="lineage-path" aria-labelledby="lineage-path-{{ path.id | escape }}">
      <header class="lineage-path-head">
        <div>
          <p class="eyebrow">Provisional path 0{{ forloop.index }}</p>
          <h2 id="lineage-path-{{ path.id | escape }}">{{ path.label | escape }}</h2>
        </div>
        <p class="lineage-path-rule">Chronological order only · no importance or influence ranking</p>
      </header>

      <div class="lineage-track" style="--lineage-count: {{ path.paper_ids.size }}" role="list" aria-label="{{ path.label | escape }} papers in chronological order">
        {% for paper_id in path.paper_ids %}
          {% assign paper = lineage.papers | where: "id", paper_id | first %}
          {% if paper %}
          <article class="lineage-node" role="listitem">
            <div class="lineage-node-meta">
              <time datetime="{{ paper.submitted_on | escape }}">First submitted {{ paper.submitted_on | date: "%b %d, %Y" }}</time>
              <span class="lineage-node-id">arXiv:{{ paper.id | escape }}</span>
              <span class="lineage-node-type">{{ paper.record_type | escape }}</span>
            </div>
            <h3>{{ paper.title | escape }}</h3>
            <details class="lineage-authors">
              <summary>Show all named authors</summary>
              <p>{{ paper.authors | join: ", " | escape }}</p>
            </details>
            <div class="lineage-node-actions">
              <a href="{{ paper.source_url | escape }}" target="_blank" rel="noopener noreferrer">Open arXiv abstract ↗</a>
            </div>
          </article>
          {% endif %}
        {% endfor %}
      </div>
    </section>
    {% endfor %}
  </section>

  <section class="source-only-section card" aria-labelledby="lineage-boundary-title">
    <p class="source-only-warning">How to read this library</p>
    <h2 id="lineage-boundary-title">Useful navigation with visible limits</h2>
    <div class="research-lineage-boundary">
      <div><h3>Repository status</h3><p>{{ lineage.curation.peer_review_boundary | escape }}</p></div>
      <div><h3>Copyright and reuse</h3><p>{{ lineage.curation.license_boundary | escape }}</p></div>
      <div><h3>No generated synopsis</h3><p>TriWei does not reproduce or paraphrase the abstract. Open the linked record to read the authors’ own abstract and paper.</p></div>
      <div><h3>Future relationships</h3><p>Labels such as “introduces,” “extends,” “tests,” or “replicates” remain unpublished until a human verifies the relationship against the papers and citations. Follow the acceptance gate in the <a href="{{ '/workbench/#workbench-signal-history' | relative_url }}">Signal History workbench entry →</a></p></div>
    </div>
  </section>

  <p class="research-lineage-acknowledgement">This is an independent TriWei research aid and is not affiliated with or endorsed by arXiv.</p>
</article>
