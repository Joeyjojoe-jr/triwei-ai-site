/* TriWei Curiosity Mall interactions. No network requests. */
(function () {
  'use strict';

  function byId(id) { return document.getElementById(id); }

  var contextLab = document.querySelector('[data-context-lab]');
  if (contextLab) {
    var selected = new Set();
    var budgetUsed = byId('context-budget-used');
    var budgetBar = byId('context-budget-bar');
    var result = byId('context-lab-result');
    var reset = byId('context-reset');

    function renderContextLab() {
      var total = 0;
      var values = [];
      contextLab.querySelectorAll('button[data-tokens]').forEach(function (button) {
        var active = selected.has(button.dataset.value);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.classList.toggle('is-selected', active);
        if (active) {
          total += Number(button.dataset.tokens || 0);
          values.push(button.dataset.value);
        }
      });
      budgetUsed.textContent = String(total);
      budgetBar.style.width = Math.min(total, 100) + '%';
      budgetBar.classList.toggle('is-over', total > 100);

      if (!values.length) {
        result.textContent = 'Select context cards to begin.';
      } else if (total > 100) {
        result.textContent = 'Budget exceeded. Some context would need to be removed, summarized, or truncated.';
      } else if (values.indexOf('goal') !== -1 && values.indexOf('evidence') !== -1 && values.indexOf('constraints') !== -1) {
        result.textContent = 'Strong package: the objective, evidence, and constraints are visible with room remaining.';
      } else {
        result.textContent = 'Within budget, but inspect whether the selected context is relevant, specific, and non-redundant.';
      }
    }

    contextLab.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-value]');
      if (!button) return;
      var value = button.dataset.value;
      if (selected.has(value)) selected.delete(value); else selected.add(value);
      renderContextLab();
    });

    if (reset) reset.addEventListener('click', function () { selected.clear(); renderContextLab(); });
    renderContextLab();
  }

  var variationRange = byId('variation-range');
  if (variationRange) {
    var variationValue = byId('variation-value');
    var variationOutput = byId('variation-output');
    var outputs = [
      'The research robot crossed the atrium and cataloged the exhibit.',
      'The research robot crossed the atrium and carefully cataloged the new exhibit.',
      'The research robot crossed the atrium and cataloged the new exhibit.',
      'The brass research robot glided across the atrium, recording the newly opened exhibit.',
      'Under the glass atrium, a curious research robot mapped the exhibit like a cartographer of small machines.'
    ];
    function renderVariation() {
      var index = Number(variationRange.value || 0);
      variationValue.textContent = String(index);
      variationOutput.textContent = outputs[index];
    }
    variationRange.addEventListener('input', renderVariation);
    renderVariation();
  }

  var clearButton = byId('clear-local-data');
  if (clearButton) {
    clearButton.addEventListener('click', function () {
      var status = byId('clear-local-data-status');
      try {
        Object.keys(localStorage).forEach(function (key) {
          if (key.indexOf('triwei-') === 0) localStorage.removeItem(key);
        });
        if (status) status.textContent = 'Local TriWei preferences and event data were cleared.';
      } catch (error) {
        if (status) status.textContent = 'This browser did not allow local storage to be cleared.';
      }
    });
  }
})();
