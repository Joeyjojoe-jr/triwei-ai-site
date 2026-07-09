#!/usr/bin/env python3
"""
TriWei AI - news aggregator.

Fetches AI news/discussion/research/business/ethics feeds, ranks trending
topics, tags every item with ethics themes, and writes _data/news.json which
the Jekyll site renders. Standard library only, so GitHub Actions needs no
extra pip installs.

Design goals:
- Never wipe good data on a bad run (keeps previous file if too little fetched).
- Everything is viewed through an ethics lens: each item is tagged, and a
  dedicated "Ethics Watch" feed collects anything with ethical dimensions.
"""

import json
import os
import re
import sys
import html
import time
import datetime as dt
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from xml.etree import ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "_data", "news.json")

UA = ("Mozilla/5.0 (compatible; TriWeiNewsBot/1.0; +https://triwei.ai)")
TIMEOUT = 25
PER_CATEGORY = 14          # items kept per category
TRENDING_COUNT = 14        # trending chips shown
MIN_ITEMS_TO_WRITE = 8     # safety: don't overwrite good data with a bad run

# ---------------------------------------------------------------------------
# Feed configuration. category -> list of (kind, url)
#   kind "rss"  : RSS 2.0 / Atom XML
#   kind "hn"   : Hacker News Algolia JSON
# Google News search feeds are reliable and CORS-free server side.
# ---------------------------------------------------------------------------
def gnews(query):
    from urllib.parse import quote
    return ("https://news.google.com/rss/search?q=" + quote(query) +
            "&hl=en-US&gl=US&ceid=US:en")

FEEDS = {
    "labs": [
        ("rss", gnews('(OpenAI OR Anthropic OR "Google DeepMind" OR "Meta AI" '
                      'OR Mistral OR xAI OR "Microsoft AI" OR Nvidia) when:7d')),
        ("rss", "https://techcrunch.com/category/artificial-intelligence/feed/"),
        ("rss", "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"),
    ],
    "research": [
        ("rss", "http://export.arxiv.org/rss/cs.AI"),
        ("rss", "http://export.arxiv.org/rss/cs.LG"),
        ("rss", "http://export.arxiv.org/rss/cs.CL"),
        ("rss", gnews('("AI research" OR "new AI model" OR "language model" '
                      'OR benchmark) when:7d')),
    ],
    "community": [
        ("hn", "https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story&hitsPerPage=30"),
        ("hn", "https://hn.algolia.com/api/v1/search_by_date?query=LLM&tags=story&hitsPerPage=30"),
        ("rss", "https://www.reddit.com/r/MachineLearning/top/.rss?t=week"),
    ],
    "business": [
        ("rss", gnews('("AI startup" OR "AI funding" OR "AI acquisition" '
                      'OR "AI investment" OR "AI IPO" OR "AI chips") when:7d')),
    ],
    "ethics": [
        ("rss", gnews('("AI ethics" OR "AI bias" OR "AI safety" OR "AI copyright" '
                      'OR "AI regulation" OR "AI surveillance" OR "AI privacy" '
                      'OR "AI jobs") when:7d')),
    ],
}

CATEGORY_ORDER = ["labs", "research", "community", "business", "ethics"]
CATEGORY_LABELS = {
    "labs": "Labs & Industry",
    "research": "Research & Papers",
    "community": "Community & Discussion",
    "business": "Business & Funding",
    "ethics": "Ethics & Society",
}

# ---------------------------------------------------------------------------
# Ethics lens: theme -> keywords. Titles/summaries are matched case-insensitively.
# ---------------------------------------------------------------------------
ETHICS_THEMES = {
    "Bias & Fairness": ["bias", "discriminat", "fairness", "racist", "sexist",
                         "disparate", "equity", "marginaliz", "stereotype"],
    "Privacy & Surveillance": ["privacy", "surveillance", "facial recognition",
                               "biometric", "tracking", "data collection", "spyware",
                               "wiretap"],
    "Safety & Alignment": ["alignment", "ai safety", "guardrail", "jailbreak",
                           "existential", "superintelligence", "red team",
                           "catastrophic", "control problem", "rogue"],
    "Misinformation & Deepfakes": ["deepfake", "misinformation", "disinformation",
                                   "hallucinat", "propaganda", "scam", "fraud",
                                   "fake news", "manipulat"],
    "Copyright & IP": ["copyright", "intellectual property", "infringe", "lawsuit",
                       "licensing", "plagiar", "artists", "authors", "training data"],
    "Labor & Jobs": ["job", "layoff", "workers", "employment", "labor", "workforce",
                     "unemploy", "automation displac"],
    "Energy & Environment": ["energy", "carbon", "emission", "water use", "datacenter",
                             "data center", "climate", "sustainab", "power grid"],
    "Regulation & Governance": ["regulat", "policy", "legislation", "eu ai act",
                                "congress", "senate", "executive order", "compliance",
                                "oversight", "antitrust", "ban ", "governance"],
    "Transparency & Accountability": ["transparen", "accountab", "explainab",
                                      "black box", "audit", "disclosure", "open weight",
                                      "open source", "watermark"],
    "Autonomy & Weapons": ["autonomous weapon", "military", "warfare", "lethal",
                           "killer robot", "defense department", "drone strike"],
}

# Curated topic terms for trending detection (case-insensitive substring).
TREND_TERMS = [
    "OpenAI", "Anthropic", "Claude", "ChatGPT", "GPT-5", "GPT",
    "Google", "Gemini", "DeepMind", "Meta", "Llama", "Mistral", "Microsoft",
    "Copilot", "Nvidia", "xAI", "Grok", "DeepSeek", "Apple", "Amazon",
    "agent", "agentic", "robot", "humanoid", "chip", "GPU", "open source",
    "open weight", "regulation", "EU AI Act", "lawsuit", "copyright", "safety",
    "alignment", "deepfake", "reasoning model", "multimodal", "benchmark",
    "funding", "acquisition", "data center", "energy", "privacy", "bias",
    "jobs", "video", "image generation", "coding", "healthcare", "education",
]



def fetch(url):
    req = Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urlopen(req, timeout=TIMEOUT) as resp:
        return resp.read()


def clean_text(s, limit=240):
    if not s:
        return ""
    s = html.unescape(s)
    s = re.sub(r"<[^>]+>", " ", s)          # strip HTML tags
    s = re.sub(r"\s+", " ", s).strip()
    if len(s) > limit:
        s = s[:limit].rsplit(" ", 1)[0] + "…"
    return s


def parse_date(s):
    """Return (iso_utc, epoch) best-effort from various feed date formats."""
    if not s:
        return None, 0
    s = s.strip()
    fmts = [
        "%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S %Z",
        "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S", "%a, %d %b %Y %H:%M %z",
    ]
    for f in fmts:
        try:
            d = dt.datetime.strptime(s, f)
            if d.tzinfo is None:
                d = d.replace(tzinfo=dt.timezone.utc)
            d = d.astimezone(dt.timezone.utc)
            return d.isoformat().replace("+00:00", "Z"), int(d.timestamp())
        except ValueError:
            continue
    return None, 0


def strip_ns(tag):
    return tag.split("}", 1)[-1] if "}" in tag else tag


def parse_rss(data):
    """Parse RSS 2.0 or Atom into list of dicts."""
    items = []
    try:
        root = ET.fromstring(data)
    except ET.ParseError:
        return items
    for it in root.iter():
        t = strip_ns(it.tag)
        if t not in ("item", "entry"):
            continue
        title = link = desc = date = ""
        for ch in list(it):
            ct = strip_ns(ch.tag)
            if ct == "title":
                title = (ch.text or "").strip()
            elif ct == "link":
                href = ch.get("href")
                link = href if href else (ch.text or "").strip()
            elif ct in ("description", "summary", "content"):
                if not desc:
                    desc = ch.text or ""
            elif ct in ("pubDate", "published", "updated", "date"):
                if not date:
                    date = (ch.text or "").strip()
        if title:
            items.append({"title": title, "link": link, "desc": desc, "date": date})
    return items


def parse_hn(data):
    items = []
    try:
        obj = json.loads(data)
    except json.JSONDecodeError:
        return items
    for h in obj.get("hits", []):
        title = h.get("title") or h.get("story_title") or ""
        if not title:
            continue
        link = h.get("url") or ("https://news.ycombinator.com/item?id=%s"
                                % h.get("objectID", ""))
        created = h.get("created_at", "")
        pts = h.get("points") or 0
        ncom = h.get("num_comments") or 0
        desc = "%s points, %s comments on Hacker News." % (pts, ncom)
        items.append({"title": title, "link": link, "desc": desc, "date": created})
    return items


def split_source(title, fallback):
    """Google News titles look like 'Headline - Source'."""
    if " - " in title:
        head, src = title.rsplit(" - ", 1)
        if 0 < len(src) <= 40:
            return head.strip(), src.strip()
    return title, fallback


def tag_ethics(text):
    tl = text.lower()
    tags = []
    for theme, kws in ETHICS_THEMES.items():
        if any(k in tl for k in kws):
            tags.append(theme)
    return tags


SOURCE_FALLBACK = {
    "techcrunch.com": "TechCrunch", "theverge.com": "The Verge",
    "arxiv.org": "arXiv", "reddit.com": "r/MachineLearning",
    "news.google.com": "Google News",
}


def source_from_url(url):
    for k, v in SOURCE_FALLBACK.items():
        if k in url:
            return v
    return "Web"


def collect():
    seen = set()
    categories = {}
    all_items = []
    for cat in CATEGORY_ORDER:
        bucket = []
        for kind, url in FEEDS.get(cat, []):
            try:
                raw = fetch(url)
            except (URLError, HTTPError, TimeoutError, Exception) as e:  # noqa
                print("  ! fetch failed %s (%s)" % (url, e), file=sys.stderr)
                continue
            rows = parse_hn(raw) if kind == "hn" else parse_rss(raw)
            fb = source_from_url(url)
            for r in rows:
                title, src = split_source(r["title"], fb)
                key = re.sub(r"[^a-z0-9]", "", title.lower())[:80]
                if not key or key in seen:
                    continue
                seen.add(key)
                iso, epoch = parse_date(r.get("date"))
                summary = clean_text(r.get("desc"))
                etags = tag_ethics(title + " " + summary)
                item = {
                    "title": clean_text(title, 160),
                    "link": r.get("link", ""),
                    "source": src,
                    "category": cat,
                    "published_iso": iso,
                    "epoch": epoch,
                    "summary": summary,
                    "ethics_tags": etags,
                }
                bucket.append(item)
                all_items.append(item)
            time.sleep(0.4)
        bucket.sort(key=lambda x: x["epoch"], reverse=True)
        categories[cat] = {"label": CATEGORY_LABELS[cat],
                           "items": bucket[:PER_CATEGORY]}
    return categories, all_items


def compute_trending(items):
    counts = {}
    texts = [(i["title"] + " " + i["summary"]).lower() for i in items]
    for term in TREND_TERMS:
        tl = term.lower()
        c = sum(1 for t in texts if tl in t)
        if c >= 2:
            counts[term] = counts.get(term, 0) + c
    # merge obvious duplicates
    if "GPT" in counts and "ChatGPT" in counts:
        counts["GPT"] = counts.get("GPT", 0)
    ranked = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)
    return [{"term": t, "count": c} for t, c in ranked[:TRENDING_COUNT]]


def compute_ethics(items):
    theme_counts = {}
    for i in items:
        for th in i["ethics_tags"]:
            theme_counts[th] = theme_counts.get(th, 0) + 1
    ranked = sorted(theme_counts.items(), key=lambda kv: kv[1], reverse=True)
    themes = [{"theme": t, "count": c,
               "slug": re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")}
              for t, c in ranked]
    watch = [i for i in items if i["ethics_tags"]]
    watch.sort(key=lambda x: x["epoch"], reverse=True)
    return themes, watch


def format_date(d):
    return d.strftime("%b ") + str(d.day) + d.strftime(", %Y")


def format_datetime(d):
    hour = d.hour % 12 or 12
    return "%s %d, %d at %d:%02d %s %s" % (
        d.strftime("%B"),
        d.day,
        d.year,
        hour,
        d.minute,
        d.strftime("%p"),
        d.tzname() or "",
    )


def annotate_trend_scores(items, trending):
    tc = {t["term"].lower(): t["count"] for t in trending}
    for i in items:
        text = (i["title"] + " " + i["summary"]).lower()
        i["trend_score"] = sum(c for term, c in tc.items() if term in text)


def display_item(i):
    iso = i["published_iso"]
    disp = ""
    if iso:
        try:
            d = dt.datetime.fromisoformat(iso.replace("Z", "+00:00"))
            disp = format_date(d)
        except ValueError:
            disp = ""
    return {
        "title": i["title"], "link": i["link"], "source": i["source"],
        "category": i["category"], "category_label": CATEGORY_LABELS[i["category"]],
        "published_display": disp, "published_iso": iso,
        "summary": i["summary"], "ethics_tags": i["ethics_tags"],
        "trend_score": i.get("trend_score", 0),
    }


def main():
    print("Fetching feeds...")
    categories, all_items = collect()
    print("Collected %d unique items." % len(all_items))

    if len(all_items) < MIN_ITEMS_TO_WRITE and os.path.exists(OUT):
        print("Too few items (%d); keeping existing data." % len(all_items))
        return 0

    trending = compute_trending(all_items)
    annotate_trend_scores(all_items, trending)
    themes, watch = compute_ethics(all_items)

    all_sorted = sorted(all_items, key=lambda x: x["epoch"], reverse=True)

    now = dt.datetime.now(dt.timezone.utc)
    try:
        import zoneinfo
        ct = now.astimezone(zoneinfo.ZoneInfo("America/Chicago"))
    except Exception:  # noqa
        ct = now
    payload = {
        "generated_utc": now.isoformat().replace("+00:00", "Z"),
        "generated_display": format_datetime(ct),
        "item_count": len(all_items),
        "category_order": CATEGORY_ORDER,
        "categories": {c: {"label": categories[c]["label"],
                           "items": [display_item(i) for i in categories[c]["items"]],
                           "folder_items": [display_item(i) for i in sorted(
                               categories[c]["items"],
                               key=lambda x: x.get("trend_score", 0), reverse=True)[:3]]}
                       for c in CATEGORY_ORDER},
        "trending": trending,
        "ethics_themes": themes,
        "ethics_watch": [display_item(i) for i in watch[:16]],
        "latest": [display_item(i) for i in all_sorted[:24]],
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print("Wrote %s (%d items, %d trending, %d ethics items)."
          % (OUT, len(all_items), len(trending), len(watch)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
