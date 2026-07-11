# Games Evidence Ledger

This ledger records evidence-backed implementation notes from source files in `games/**`.

## Orbit Runner (`orbit-runner`)
- URL: `/games/orbit-runner/`
- Key files: `games/orbit-runner/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: `requestAnimationFrame(...)` driven loop detected. 
- Randomness evidence: Randomness present via `Math.random()` in `games/orbit-runner/index.html`.
- Reset behavior evidence: Reset control/function present in page script.
- Accessibility notes observed: Input labeling should be verified manually.

## Circuit Flip (`circuit-flip`)
- URL: `/games/circuit-flip/`
- Key files: `games/circuit-flip/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: `requestAnimationFrame(...)` driven loop detected. 
- Randomness evidence: Randomness present via `Math.random()` in `games/circuit-flip/index.html`.
- Reset behavior evidence: Reset control not explicitly detected; runtime toolbar reset hook may apply.
- Accessibility notes observed: Input labeling should be verified manually.

## Signal Drift (`signal-drift`)
- URL: `/games/signal-drift/`
- Key files: `games/signal-drift/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: `requestAnimationFrame(...)` driven loop detected. 
- Randomness evidence: Randomness present via `Math.random()` in `games/signal-drift/index.html`.
- Reset behavior evidence: Reset control/function present in page script.
- Accessibility notes observed: Input labeling should be verified manually.

## Vector Vault (`vector-vault`)
- URL: `/games/vector-vault/`
- Key files: `games/vector-vault/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: `requestAnimationFrame(...)` driven loop detected. 
- Randomness evidence: Randomness present via `Math.random()` in `games/vector-vault/index.html`.
- Reset behavior evidence: Reset control/function present in page script.
- Accessibility notes observed: Input labeling should be verified manually.

## Logic Lattice (`logic-lattice`)
- URL: `/games/logic-lattice/`
- Key files: `games/logic-lattice/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: Event-driven updates (no requestAnimationFrame main loop detected). 
- Randomness evidence: Randomness present via `Math.random()` in `games/logic-lattice/index.html`.
- Reset behavior evidence: Reset control not explicitly detected; runtime toolbar reset hook may apply.
- Accessibility notes observed: Input labeling should be verified manually.

## Flux Line (`flux-line`)
- URL: `/games/flux-line/`
- Key files: `games/flux-line/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: `requestAnimationFrame(...)` driven loop detected. 
- Randomness evidence: Randomness present via `Math.random()` in `games/flux-line/index.html`.
- Reset behavior evidence: Reset control/function present in page script.
- Accessibility notes observed: Input labeling should be verified manually.

## Pulse Stack (`pulse-stack`)
- URL: `/games/pulse-stack/`
- Key files: `games/pulse-stack/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: `requestAnimationFrame(...)` driven loop detected. 
- Randomness evidence: Randomness present via `Math.random()` in `games/pulse-stack/index.html`.
- Reset behavior evidence: Reset control/function present in page script.
- Accessibility notes observed: Input labeling should be verified manually.

## Grid Hopper (`grid-hopper`)
- URL: `/games/grid-hopper/`
- Key files: `games/grid-hopper/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: Event-driven updates (no requestAnimationFrame main loop detected). 
- Randomness evidence: Randomness present via `Math.random()` in `games/grid-hopper/index.html`.
- Reset behavior evidence: Reset control not explicitly detected; runtime toolbar reset hook may apply.
- Accessibility notes observed: Input labeling should be verified manually.

## Echo Trace (`echo-trace`)
- URL: `/games/echo-trace/`
- Key files: `games/echo-trace/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: Event-driven updates (no requestAnimationFrame main loop detected). 
- Randomness evidence: Randomness present via `Math.random()` in `games/echo-trace/index.html`.
- Reset behavior evidence: Reset control/function present in page script.
- Accessibility notes observed: Input labeling should be verified manually.

## Pattern Relay (`pattern-relay`)
- URL: `/games/pattern-relay/`
- Key files: `games/pattern-relay/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: Event-driven updates (no requestAnimationFrame main loop detected). 
- Randomness evidence: Randomness present via `Math.random()` in `games/pattern-relay/index.html`.
- Reset behavior evidence: Reset control/function present in page script.
- Accessibility notes observed: Input labeling should be verified manually.

## Tempo Matrix (`tempo-matrix`)
- URL: `/games/tempo-matrix/`
- Key files: `games/tempo-matrix/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: `requestAnimationFrame(...)` driven loop detected. 
- Randomness evidence: Randomness present via `Math.random()` in `games/tempo-matrix/index.html`.
- Reset behavior evidence: Reset control/function present in page script.
- Accessibility notes observed: Input labeling should be verified manually.

## Quantum Swap (`quantum-swap`)
- URL: `/games/quantum-swap/`
- Key files: `games/quantum-swap/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: Event-driven updates (no requestAnimationFrame main loop detected). 
- Randomness evidence: Randomness present via `Math.random()` in `games/quantum-swap/index.html`.
- Reset behavior evidence: Reset control not explicitly detected; runtime toolbar reset hook may apply.
- Accessibility notes observed: Input labeling should be verified manually.

## Linear Regression Target Practice (`labs/linreg`)
- URL: `/games/labs/linreg/`
- Key files: `games/labs/linreg/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: Event-driven updates (no requestAnimationFrame main loop detected). 
- Randomness evidence: Randomness is routed through `TWSeededRng` in `games/labs/linreg/index.html` with fallback-only `Math.random()` support.
- Reset behavior evidence: Reset control/function present in page script and wired to deterministic seed replay.
- Accessibility notes observed: No immediate critical accessibility gaps detected from static scan.

## Overfitting vs Underfitting Explorer (`labs/overfitting`)
- URL: `/games/labs/overfitting/`
- Key files: `games/labs/overfitting/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: Event-driven updates (no requestAnimationFrame main loop detected). 
- Randomness evidence: Randomness present via `Math.random()` in `games/labs/overfitting/index.html`.
- Reset behavior evidence: Reset control not explicitly detected; runtime toolbar reset hook may apply.
- Accessibility notes observed: No immediate critical accessibility gaps detected from static scan.

## Backpropagation Chain Rule Visualiser (`labs/backprop`)
- URL: `/games/labs/backprop/`
- Key files: `games/labs/backprop/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: Event-driven updates (no requestAnimationFrame main loop detected). 
- Randomness evidence: Randomness present via `Math.random()` in `games/labs/backprop/index.html`.
- Reset behavior evidence: Reset control/function present in page script.
- Accessibility notes observed: No `aria-live="polite"` region detected in page markup.

## KNN vs Logistic Regression Boundary Brawl (`labs/knn-vs-logreg`)
- URL: `/games/labs/knn-vs-logreg/`
- Key files: `games/labs/knn-vs-logreg/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: Event-driven updates (no requestAnimationFrame main loop detected). 
- Randomness evidence: Randomness present via `Math.random()` in `games/labs/knn-vs-logreg/index.html`.
- Reset behavior evidence: Reset control not explicitly detected; runtime toolbar reset hook may apply.
- Accessibility notes observed: No immediate critical accessibility gaps detected from static scan.

## Q-Learning Maze Runner (`labs/qlearning-grid`)
- URL: `/games/labs/qlearning-grid/`
- Key files: `games/labs/qlearning-grid/index.html`, `games/common/notify.js`, `games/common/inspector.js`
- Main loop entry point: Event-driven updates (no requestAnimationFrame main loop detected). 
- Randomness evidence: Randomness present via `Math.random()` in `games/labs/qlearning-grid/index.html`.
- Reset behavior evidence: Reset control/function present in page script.
- Accessibility notes observed: No immediate critical accessibility gaps detected from static scan.
