/* Progressive enhancement for the evidence-first homepage.
   This script changes only the below-orbit Evidence Desk presentation.
   It makes no network requests and does not touch the orbit or news data. */
(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  function makeElement(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  }

  function makeGuideStep(number, title, text) {
    var item = makeElement('div', 'evidence-guide-step');
    item.appendChild(makeElement('span', 'evidence-guide-number', number));
    var copy = makeElement('div');
    copy.appendChild(makeElement('strong', '', title));
    copy.appendChild(makeElement('p', '', text));
    item.appendChild(copy);
    return item;
  }

  function refineEvidenceDesk() {
    var desk = document.querySelector('.evidence-home');
    var intro = desk && desk.querySelector('.evidence-constitution');
    if (!desk || !intro || intro.hasAttribute('data-evidence-refined')) return;

    intro.setAttribute('data-evidence-refined', '');
    intro.classList.add('evidence-constitution-refined');

    var title = intro.querySelector('#evidence-desk-title');
    if (title) title.textContent = 'What changed in AI—and what the evidence supports';

    var purpose = intro.querySelector('.evidence-constitution-copy > p:last-child');
    if (purpose) {
      purpose.textContent = 'Start with a specific dated event. Then see what the source documents, why it may matter, and what the record still cannot establish.';
    }

    var guide = makeElement('div', 'evidence-quick-guide');
    guide.setAttribute('aria-label', 'How to read a TriWei evidence record');
    guide.appendChild(makeGuideStep('01', 'What changed', 'A specific event, release, filing, law, or public claim.'));
    guide.appendChild(makeGuideStep('02', 'What the record supports', 'The source, source role, and TriWei context are shown separately.'));
    guide.appendChild(makeGuideStep('03', 'What remains uncertain', 'Limits and unresolved questions stay visible beside the record.'));

    var freshness = intro.querySelector('.evidence-freshness');
    var classes = intro.querySelector('.evidence-class-grid');
    if (freshness || classes) {
      var details = makeElement('details', 'evidence-method-details');
      var summary = makeElement('summary', '', 'How TriWei labels and reviews records');
      details.appendChild(summary);
      var body = makeElement('div', 'evidence-method-details-body');
      if (freshness) body.appendChild(freshness);
      if (classes) body.appendChild(classes);
      details.appendChild(body);
      intro.appendChild(guide);
      intro.appendChild(details);
    } else {
      intro.appendChild(guide);
    }

    var recordsHeading = desk.querySelector('#documented-records-title');
    if (recordsHeading) recordsHeading.textContent = 'Recent reviewed changes';

    var recordsSection = recordsHeading && recordsHeading.closest('.evidence-section');
    var recordsIntro = recordsSection && recordsSection.querySelector('.evidence-section-heading > p');
    if (recordsIntro) {
      recordsIntro.textContent = 'Each record begins with a concrete event and keeps the source, TriWei synthesis, and evidentiary limits visibly separate.';
    }

    desk.querySelectorAll('.evidence-record-fields').forEach(function (fields) {
      var recordLabel = fields.querySelector('.evidence-field-record dt');
      var contextLabel = fields.querySelector('.evidence-field-context dt');
      var limitLabel = fields.querySelector('.evidence-field-limit dt');
      if (recordLabel) recordLabel.textContent = 'What changed';
      if (contextLabel) contextLabel.textContent = 'Why it may matter · TriWei context';
      if (limitLabel) limitLabel.textContent = 'What remains uncertain';
    });
  }

  ready(refineEvidenceDesk);
})();
