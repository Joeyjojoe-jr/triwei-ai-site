---
layout: default
title: Machine Room
description: Architecture, privacy, evidence, controls, and known limitations for TriWei AI.
permalink: /machine-room/
---
<section class="mall-page-hero mall-panel">
  <p class="mall-kicker">Location 03 · Machine Room</p>
  <h1>Machine Room</h1>
  <p class="mall-lead">The backstage area is public by design. This page separates what the site does from what it does not do.</p>
</section>

<section class="mall-machine-grid">
  <article class="mall-panel"><p class="mall-kicker">Hosting</p><h2>Static GitHub Pages</h2><p>Jekyll generates HTML, CSS, JavaScript, and data files. Visitors do not need an account or application server.</p></article>
  <article class="mall-panel"><p class="mall-kicker">AI runtime</p><h2>No production inference</h2><p>The public site does not send visitor prompts to ChatGPT, Claude, or another model API.</p></article>
  <article class="mall-panel"><p class="mall-kicker">Data handling</p><h2>Browser-local state</h2><p>Theme and exhibit progress may be saved in localStorage on the visitor's device. The site does not transmit that state.</p></article>
  <article class="mall-panel"><p class="mall-kicker">Build timestamp</p><h2>{{ site.time | date: "%Y-%m-%d %H:%M %Z" }}</h2><p>This timestamp is generated during the Jekyll build and is not a live server clock.</p></article>
</section>

<section class="mall-section" aria-labelledby="architecture-title">
  <div class="mall-section-heading"><p class="mall-kicker">Architecture</p><h2 id="architecture-title">Current request path</h2></div>
  <ol class="mall-architecture-flow">
    <li><strong>GitHub repository</strong><span>Versioned source and data</span></li>
    <li><strong>Jekyll build</strong><span>Static page generation</span></li>
    <li><strong>GitHub Pages</strong><span>Static hosting</span></li>
    <li><strong>Visitor browser</strong><span>Local interaction only</span></li>
  </ol>
</section>

<section class="mall-split mall-section">
  <article class="mall-panel mall-route-note">
    <p class="mall-kicker">Known limitations</p>
    <h2>Not yet verified</h2>
    <ul>
      <li>Automated headline categorization still needs stronger relevance filtering.</li>
      <li>The Three.js background currently depends on a public CDN.</li>
      <li>This prototype branch does not have a dedicated preview deployment.</li>
      <li>Planned exhibits are descriptive placeholders, not completed features.</li>
    </ul>
  </article>
  <article class="mall-panel mall-route-note">
    <p class="mall-kicker">Local controls</p>
    <h2>Clear stored preferences</h2>
    <p>Remove the theme setting, workshop progress, and local event log stored by this site in this browser.</p>
    <button id="clear-local-data" class="mall-button" type="button">Clear local TriWei data</button>
    <p id="clear-local-data-status" class="mall-inline-status" aria-live="polite"></p>
  </article>
</section>

<section class="mall-panel mall-route-note">
  <h2>Source repository</h2>
  <p>The implementation and change history are available in the public GitHub repository.</p>
  <a href="https://github.com/Joeyjojoe-jr/triwei-ai-site">Open the repository →</a>
</section>
