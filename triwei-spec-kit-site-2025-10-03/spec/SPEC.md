# SPEC — TriWei.ai website and podcast hub

## Goals
- Ship a polished, minimalist, mobile-first site.
- Promote a weekly 30-minute humorous and informative AI news video podcast.
- Keep copy tight. Avoid hype. Use precise language.

## Non‑functional
- React + Tailwind. Dark by default with light toggle.
- LCP < 2.5s, CLS < 0.1. Lazy-load media. Inline critical CSS.
- WCAG 2.2 AA.
- SEO: semantic HTML, OG/Twitter tags, JSON-LD. RSS for podcast + blog.
- GitHub Pages via Actions. Custom domain: tri.wei.ai.

## IA
Header, Hero, About, Podcast, Blog, Footer.

## Copy/UX notes
- Voice: confident, concise, wry.
- Jokes are clean and light. No slang.
- Average sentence length ≤ 14 words.

## Deliverables
- Layout, Header, Hero, About, PodcastIndex, BlogIndex, Footer.
- Episode show notes template and 3 blog stubs.
- `/public/og.png` placeholder.
