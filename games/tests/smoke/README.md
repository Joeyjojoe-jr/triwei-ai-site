# Smoke Tests for TriWei Games Labs (Static GitHub Pages)

These smoke tests are designed to catch "page doesn't load / JS crashes / key UI missing" issues **before** you merge into your repo.

They run locally on your machine. No backend required.

---

## Option A (Recommended): Playwright automated browser checks ✅

### Prereqs
- Node.js 18+ (or 20+)
- npm

### 1) Install deps (one time)
From this folder:

```bash
cd games/tests/smoke
npm install
npx playwright install chromium
```

### 2) Run tests
From your repo root (or anywhere — the script finds your `games/` folder):

```bash
cd games/tests/smoke
npm test
```

### What it does
- Starts a local static server for your repo
- Opens each lab page in headless Chromium
- Fails if:
  - the page doesn't load
  - there are console `error`s
  - required controls/canvases are missing

---

## Option B: Zero-install manual checklist (fast) 🧪

### Start a local server (Python)
From your repo root:

```bash
python -m http.server 8000
```

Open each URL and check DevTools Console for errors:

- http://localhost:8000/games/labs/linreg/
- http://localhost:8000/games/labs/overfitting/
- http://localhost:8000/games/labs/backprop/
- http://localhost:8000/games/labs/knn-vs-logreg/
- http://localhost:8000/games/labs/qlearning-grid/

---

## Notes
- These tests are "smoke" tests, not mathematical proof.
- The labs themselves include gradient checks for core math correctness.
