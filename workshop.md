---
layout: default
title: Systems Workshop
description: Browser-based demonstrations of AI system concepts with no external API calls.
permalink: /workshop/
---
<section class="mall-page-hero mall-panel">
  <p class="mall-kicker">Location 02 · Workshop</p>
  <h1>Systems Workshop</h1>
  <p class="mall-lead">These are simplified teaching instruments, not simulations of a particular commercial model. Everything runs locally in the browser.</p>
</section>

<section class="mall-lab mall-panel" aria-labelledby="context-lab-title">
  <div class="mall-lab-heading"><p class="mall-kicker">Experiment A</p><h2 id="context-lab-title">Context Window Packing</h2><p>Select facts to fit inside a 100-token teaching budget. Useful context competes with repetition and noise.</p></div>
  <div class="mall-budget" aria-live="polite"><span id="context-budget-bar"></span><strong><span id="context-budget-used">0</span> / 100 tokens</strong></div>
  <div class="mall-context-grid" data-context-lab>
    <button type="button" data-tokens="18" data-value="goal">Goal and requested output <span>18</span></button>
    <button type="button" data-tokens="24" data-value="evidence">Relevant source evidence <span>24</span></button>
    <button type="button" data-tokens="16" data-value="constraints">Important constraints <span>16</span></button>
    <button type="button" data-tokens="20" data-value="example">A useful worked example <span>20</span></button>
    <button type="button" data-tokens="31" data-value="history">Long unrelated history <span>31</span></button>
    <button type="button" data-tokens="27" data-value="repetition">Repeated instructions <span>27</span></button>
  </div>
  <p id="context-lab-result" class="mall-lab-result">Select context cards to begin.</p>
  <button id="context-reset" class="mall-button" type="button">Reset experiment</button>
</section>

<section class="mall-lab mall-panel" aria-labelledby="temperature-lab-title">
  <div class="mall-lab-heading"><p class="mall-kicker">Experiment B</p><h2 id="temperature-lab-title">Variation Dial</h2><p>This deterministic demonstration uses prepared outputs to show the concept of lower versus higher sampling variation. It does not call an AI model.</p></div>
  <label class="mall-range-label" for="variation-range">Variation level: <output id="variation-value">2</output></label>
  <input id="variation-range" type="range" min="0" max="4" value="2" step="1">
  <blockquote id="variation-output">The research robot crossed the atrium and cataloged the new exhibit.</blockquote>
</section>

<section class="mall-panel mall-route-note">
  <h2>What these instruments omit</h2>
  <p>Real model behavior depends on architecture, tokenizer, system instructions, training, sampling settings, tools, retrieval, and implementation details. These exhibits isolate one concept at a time so the tradeoff is visible.</p>
</section>
