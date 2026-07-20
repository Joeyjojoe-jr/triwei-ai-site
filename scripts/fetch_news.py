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
from difflib import SequenceMatcher
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from xml.etree import ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "_data", "news.json")

UA = ("Mozilla/5.0 (compatible; TriWeiNewsBot/1.0; +https://triwei.ai)")
TIMEOUT = 25
PER_CATEGORY = 14          # items kept per category
TRENDING_COUNT = 14        # trending chips shown
PULSE_COVERAGE_COUNT = 4   # visual topic cards below the homepage hero
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
        ("rss", gnews('(DeepSeek OR Kimi OR "Moonshot AI" OR MiniMax OR Qwen '
                      'OR "Z.ai" OR Zhipu) (distillation OR "open weight" '
                      'OR "open-weight" OR "model extraction" OR model) when:7d')),
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

# Stable second-level folders for the interactive homepage orbit. Rules are
# checked in order; the final entry in every category is the catch-all. A
# story is assigned to exactly one subcategory so counts remain meaningful.
SUBCATEGORY_RULES = {
    "labs": [
        ("hardware", "Chips, Robots & Devices",
         ["chip*", "gpu*", "nvidia", "robot*", "humanoid*", "device*", "hardware", "speaker*"]),
        ("governance", "Lab Safety & Policy",
         ["safety", "alignment", "policy", "regulat*", "lawsuit*", "copyright", "standard*"]),
        ("enterprise", "Enterprise AI",
         ["enterprise", "workplace", "business", "developer*", "coding", "sales", "customer*"]),
        ("models", "Models & Releases",
         ["model*", "release*", "launch*", "gpt*", "claude", "gemini", "llama*", "mistral"]),
        ("frontier", "Frontier Labs", []),
    ],
    "research": [
        ("evaluation", "Evaluation & Safety",
         ["benchmark*", "evaluat*", "safety", "alignment", "audit*", "robust*", "interpret*"]),
        ("language", "Language Models",
         ["language model*", "llm*", "transformer*", "token*", "linguistic*", "text generation"]),
        ("agents", "Agents & Reasoning",
         ["agent*", "reasoning", "reinforcement", "planning", "decision*", "control*"]),
        ("vision", "Vision & Multimodal",
         ["vision", "image", "video", "multimodal", "visual", "speech", "audio"]),
        ("applied", "Applied AI", []),
    ],
    "community": [
        ("open-source", "Open & Local AI",
         ["open source", "open-source", "open weight*", "local llm*", "github", "repository"]),
        ("tools", "Tools & Projects",
         ["show hn", "tool*", "project*", "build*", "library", "framework*", "typescript",
          "repo", "cli", "coding", "compiler*", "dsl*", "pipeline*", "webhook*"]),
        ("research", "Research Discussion",
         ["paper*", "research", "arxiv", "study", "studies", "benchmark*", "clinical*"]),
        ("industry", "Industry Debate",
         ["openai", "anthropic", "google", "meta", "microsoft", "nvidia", "startup*",
          "business", "industry", "pricing", "implementation"]),
        ("pulse", "Community Pulse", []),
    ],
    "business": [
        ("funding", "Funding & Venture",
         ["fund*", "raised", "round", "venture*", "invest*"]),
        ("deals", "Deals & Acquisitions",
         ["acquisition*", "acquire*", "merger*", "deal*", "buyout*", "ipo*", "sues", "lawsuit*"]),
        ("startups", "Startups",
         ["startup*", "founder*", "launch*"]),
        ("compute", "Chips & Compute",
         ["chip*", "gpu*", "nvidia", "compute", "data center*", "datacenter*", "semiconductor*"]),
        ("markets", "Markets & Strategy", []),
    ],
    "ethics": [
        ("bias", "Bias & Fairness", ["bias & fairness", "bias*", "fairness", "discriminat*"]),
        ("privacy", "Privacy & Surveillance",
         ["privacy & surveillance", "privacy", "surveillance", "biometric*"]),
        ("safety", "Safety & Alignment",
         ["safety & alignment", "safety", "alignment", "guardrail*", "jailbreak*"]),
        ("rights", "Copyright, Labor & Rights",
         ["copyright & ip", "labor & jobs", "copyright", "worker*", "labor", "job*"]),
        ("governance", "Governance & Society", []),
    ],
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

# Feed search results are candidates, not proof that a story belongs on the
# site.  Google News in particular occasionally returns stories where "AI"
# only appears in unrelated page furniture or where a broad word such as
# "research" is the sole match.
AI_PATTERNS = [
    r"\bartificial intelligence\b", r"\bgenerative ai\b", r"\bgenai\b",
    r"\bmachine learning\b", r"\bdeep learning\b", r"\blarge language models?\b",
    r"\blanguage models?\b", r"\bllms?\b", r"\bneural networks?\b",
    # Do not let a company/domain ending in ".ai" satisfy AI relevance.
    r"(?<!\.)\bai (?:agents?|models?|systems?|tools?|chips?|safety|research|regulation|labs?)\b",
    r"\b(?:openai|anthropic|chatgpt|deepmind|gemini|claude|llama|mistral|deepseek)\b",
]

RESEARCH_PATTERNS = [
    r"\bresearch(?:ers?)?\b", r"\bpaper\b", r"\bstud(?:y|ies)\b",
    r"\bbenchmark\b", r"\bdataset\b", r"\bevaluation\b", r"\bmodel\b",
    r"\btraining\b", r"\binference\b", r"\barchitecture\b", r"\barxiv\b",
]

# Headline matching deliberately ignores only grammatical and generic news
# language.  Event details (for example "safety", "pricing", or "lawsuit")
# remain significant so distinct reporting angles are not collapsed together.
HEADLINE_STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "been", "being", "but",
    "by", "can", "for", "from", "in", "into", "is", "it", "its", "new",
    "news", "now", "of", "on", "or", "report", "reportedly", "reports",
    "says", "that", "the", "their", "these", "this", "those", "to", "today",
    "will", "with",
}

HEADLINE_EQUIVALENTS = {
    "announced": "announce", "announces": "announce", "announcing": "announce",
    "acquired": "acquire", "acquires": "acquire", "acquiring": "acquire",
    "bought": "acquire", "buys": "acquire",
    "debuts": "launch", "debuted": "launch",
    "introduced": "launch", "introduces": "launch",
    "launched": "launch", "launches": "launch", "launching": "launch",
    "movable": "move", "moved": "move", "moves": "move", "moving": "move",
    "released": "launch", "releases": "launch", "releasing": "launch",
    "unveiled": "launch", "unveils": "launch",
}

# Differences containing one of these terms usually represent an editorial or
# consequence-focused take, not a wire-copy rewrite of the same basic report.
EDITORIAL_ANGLE_TERMS = {
    "accountability", "analysis", "benchmark", "bias", "climate", "competition",
    "concern", "concerns", "cost", "copyright", "critic", "critics", "critique",
    "deepfake", "energy", "environment", "explainer", "fairness", "funding",
    "governance", "impact", "impacts", "implication", "implications", "investor",
    "investors", "jobs", "labor", "lawsuit", "market", "means", "military",
    "misinformation", "opinion", "price", "pricing", "privacy", "problem",
    "problems", "regulation", "revenue", "review", "risk", "risks", "safety",
    "strategy", "surveillance", "test", "testing", "transparency", "valuation",
    "weapon", "weapons", "workers", "why",
}

TRACKING_QUERY_KEYS = {
    "fbclid", "gclid", "mc_cid", "mc_eid", "ref", "source",
}


def matches_any(text, patterns):
    return any(re.search(pattern, text, re.IGNORECASE) for pattern in patterns)


def is_story_relevant(category, title, summary, feed_url=""):
    """Validate a feed candidate before it can enter a category.

    arXiv category feeds are trusted research sources. Other feeds must show
    explicit AI relevance in their own title/summary. Research candidates also
    need a separate research signal, preventing generic personnel or business
    stories containing words such as "research" from slipping through.
    """
    if category == "research" and "arxiv.org/rss/" in feed_url:
        return True

    text = clean_text(title + " " + summary, 1000)
    if not matches_any(text, AI_PATTERNS):
        return False
    if category == "research" and not matches_any(text, RESEARCH_PATTERNS):
        return False
    return True



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
    if limit is not None and len(s) > limit:
        s = s[:limit].rsplit(" ", 1)[0] + "…"
    return s


def canonical_url(url):
    """Normalize a URL enough to recognize the exact article across feeds."""
    if not url:
        return ""
    try:
        parts = urlsplit(url.strip())
    except ValueError:
        return url.strip()
    query = [
        (key, value) for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if not key.lower().startswith("utm_") and key.lower() not in TRACKING_QUERY_KEYS
    ]
    path = parts.path.rstrip("/") or "/"
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower().removeprefix("www."),
                       path, urlencode(query), ""))


def headline_tokens(title):
    """Return conservative comparison tokens while preserving editorial angles."""
    normalized = clean_text(title, None).lower().replace("’", "'")
    normalized = re.sub(r"(?<=\w)'s\b", "", normalized)
    normalized = re.sub(
        r"\b(\d+(?:\.\d+)?)\s+(million|billion)\b",
        lambda match: match.group(1) + ("m" if match.group(2) == "million" else "b"),
        normalized,
    )
    words = re.findall(r"[a-z0-9]+", normalized)
    return [HEADLINE_EQUIVALENTS.get(word, word) for word in words
            if word not in HEADLINE_STOPWORDS]


def is_same_story(first, second):
    """Identify exact or near-duplicate articles without merging an event's takes.

    URL equality is decisive. Headline equality is intentionally conservative:
    it catches syndicated headlines, punctuation changes, and minor rewrites,
    but requires most meaningful words to overlap. New angle-specific words
    therefore keep a second article eligible for coverage.
    """
    first_url = canonical_url(first.get("link", ""))
    second_url = canonical_url(second.get("link", ""))
    if first_url and first_url == second_url:
        return True

    left = headline_tokens(first.get("title", ""))
    right = headline_tokens(second.get("title", ""))
    if not left or not right:
        return False
    if left == right:
        return True

    first_title = clean_text(first.get("title", ""), None).lower()
    second_title = clean_text(second.get("title", ""), None).lower()
    for shorter, longer in ((first_title, second_title), (second_title, first_title)):
        if any(longer.startswith(shorter + separator)
               for separator in (" - ", " | ", " — ")):
            return True

    left_text = " ".join(left)
    right_text = " ".join(right)
    left_set, right_set = set(left), set(right)
    different_words = left_set ^ right_set
    if different_words & EDITORIAL_ANGLE_TERMS:
        return False
    if SequenceMatcher(None, left_text, right_text).ratio() >= 0.88:
        return True

    shared = len(left_set & right_set)
    smaller = min(len(left_set), len(right_set))
    union = len(left_set | right_set)
    containment = shared / smaller
    jaccard = shared / union
    same_event_facts = shared >= 5 and containment >= 0.80
    return ((smaller >= 4 and containment >= 0.90 and jaccard >= 0.72) or
            (smaller >= 5 and jaccard >= 0.82) or same_event_facts)


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


def safe_external_url(value):
    """Return an absolute HTTP(S) URL or an empty string for unsafe input."""
    if not isinstance(value, str):
        return ""
    value = value.strip()
    try:
        parsed = urlsplit(value)
    except ValueError:
        return ""
    if parsed.scheme.lower() not in ("http", "https") or not parsed.netloc:
        return ""
    return value


def collect():
    accepted = []
    categories = {}
    all_items = []
    for cat in CATEGORY_ORDER:
        bucket = []
        successful_feeds = 0
        for kind, url in FEEDS.get(cat, []):
            try:
                raw = fetch(url)
            except (URLError, HTTPError, TimeoutError, Exception) as e:  # noqa
                print("  ! fetch failed %s (%s)" % (url, e), file=sys.stderr)
                continue
            rows = parse_hn(raw) if kind == "hn" else parse_rss(raw)
            if rows:
                successful_feeds += 1
            fb = source_from_url(url)
            for r in rows:
                title, src = split_source(r["title"], fb)
                summary = clean_text(r.get("desc"))
                if not is_story_relevant(cat, title, summary, url):
                    continue
                link = safe_external_url(r.get("link"))
                if not link:
                    continue
                candidate = {"title": title, "link": link}
                if not headline_tokens(title) or any(
                        is_same_story(candidate, previous) for previous in accepted):
                    continue
                iso, epoch = parse_date(r.get("date"))
                etags = tag_ethics(title + " " + summary)
                item = {
                    # Preserve the full feed headline. Presentation layers wrap it.
                    "title": clean_text(title, None),
                    "link": link,
                    "source": src,
                    "category": cat,
                    "published_iso": iso,
                    "epoch": epoch,
                    "summary": summary,
                    "ethics_tags": etags,
                }
                bucket.append(item)
                all_items.append(item)
                accepted.append(item)
            time.sleep(0.4)
        bucket.sort(key=lambda x: x["epoch"], reverse=True)
        categories[cat] = {"label": CATEGORY_LABELS[cat],
                           "items": bucket[:PER_CATEGORY],
                           "successful_feeds": successful_feeds}
    return categories, all_items


def compute_trending(items):
    counts = {}
    texts = [(i["title"] + " " + i["summary"]).lower() for i in items]
    for term in TREND_TERMS:
        pattern = trend_term_pattern(term)
        c = sum(1 for text in texts if re.search(pattern, text, re.IGNORECASE))
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
        text = "%s %s" % (i.get("title") or "", i.get("summary") or "")
        i["trend_score"] = sum(
            count for term, count in tc.items()
            if re.search(trend_term_pattern(term), text, re.IGNORECASE)
        )


def trend_term_pattern(term):
    """Match complete trend terms and their simple plurals, never substrings."""
    literal = str(term or "").strip()
    plural = ""
    if literal and literal[-1].isalnum() and not literal.lower().endswith("s"):
        plural = "s?"
    return r"(?<!\w)%s%s(?!\w)" % (re.escape(literal), plural)


def item_matches_trend(item, term):
    """Return whether a complete trend term occurs in an item's text."""
    text = "%s %s" % (item.get("title") or "", item.get("summary") or "")
    return re.search(trend_term_pattern(term), text, re.IGNORECASE) is not None


def source_identity(item):
    """Return an honest source label, falling back to the article's domain."""
    source = str(item.get("source") or "").strip()
    if source and source.lower() not in ("web", "google news"):
        return source
    link = safe_external_url(item.get("link"))
    if link:
        return urlsplit(link).netloc.lower().removeprefix("www.")
    return source or "Unknown"


def diverse_story_sample(items, blocked_links, limit=3):
    """Select strong stories while favoring new sources, desks, and links."""
    ranked = sorted(
        items,
        key=lambda item: (
            safe_trend_score(item.get("trend_score")),
            len(item.get("ethics_tags") or []),
            item.get("epoch") or 0,
        ),
        reverse=True,
    )
    selected = []
    selected_sources = set()
    selected_categories = set()

    for require_new_source, require_new_category in ((True, True), (True, False),
                                                       (False, False)):
        for item in ranked:
            link = canonical_url(item.get("link", ""))
            source = source_identity(item).lower()
            category = item.get("category") or ""
            if not link or link in blocked_links or any(
                    canonical_url(chosen.get("link", "")) == link for chosen in selected):
                continue
            if require_new_source and source in selected_sources:
                continue
            if require_new_category and category in selected_categories:
                continue
            selected.append(item)
            selected_sources.add(source)
            selected_categories.add(category)
            if len(selected) == limit:
                return selected
    return selected


def compute_ai_pulse(items, trending):
    """Build truthful homepage counters and non-repeating topic coverage cards."""
    source_count = len({source_identity(item).lower() for item in items})
    ethics_count = sum(1 for item in items if item.get("ethics_tags"))
    max_trend_count = max((trend.get("count", 0) for trend in trending), default=0)
    used_links = set()
    selected_signatures = []
    coverage = []

    for trend in trending:
        term = str(trend.get("term") or "").strip()
        if not term:
            continue
        matched = [item for item in items if item_matches_trend(item, term)]
        signature = {canonical_url(item.get("link", "")) for item in matched}
        signature.discard("")
        if len(signature) < 2:
            continue
        if any(len(signature & previous) / min(len(signature), len(previous)) >= 0.75
               for previous in selected_signatures):
            continue

        stories = diverse_story_sample(matched, used_links)
        if len(stories) < 2:
            continue

        theme_counts = {}
        for item in matched:
            for theme in item.get("ethics_tags") or []:
                theme_counts[theme] = theme_counts.get(theme, 0) + 1
        top_ethics_theme = ""
        if theme_counts:
            top_ethics_theme = sorted(
                theme_counts.items(), key=lambda pair: (-pair[1], pair[0]))[0][0]

        for story in stories:
            used_links.add(canonical_url(story.get("link", "")))
        selected_signatures.append(signature)
        coverage.append({
            "term": term,
            "story_count": len(matched),
            "source_count": len({source_identity(item).lower() for item in matched}),
            "category_count": len({item.get("category") for item in matched
                                   if item.get("category")}),
            "strength_percent": (round(trend.get("count", 0) * 100 / max_trend_count)
                                 if max_trend_count else 0),
            "top_ethics_theme": top_ethics_theme,
            "stories": [display_item(item) for item in stories],
        })
        if len(coverage) == PULSE_COVERAGE_COUNT:
            break

    return {
        "story_count": len(items),
        "source_count": source_count,
        "topic_count": len(trending),
        "ethics_count": ethics_count,
        "coverage": coverage,
    }


def matches_subcategory_term(text, term):
    """Match a complete term, or a word-prefix when the rule ends in '*'."""
    prefix = term.endswith("*")
    literal = term[:-1] if prefix else term
    pattern = r"(?<!\w)%s" % re.escape(literal)
    if not prefix:
        pattern += r"(?!\w)"
    return re.search(pattern, text, re.IGNORECASE) is not None


def safe_trend_score(value):
    """Normalize numeric trend scores; malformed or null values rank as zero."""
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return value
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def classify_subcategory(category, item):
    """Return the one stable second-level folder key for a news item."""
    rules = SUBCATEGORY_RULES.get(category)
    if not rules:
        raise ValueError("Unknown category: %s" % category)
    tags = item.get("ethics_tags") or []
    if not isinstance(tags, (list, tuple)):
        tags = []
    text = " ".join([
        str(item.get("title") or ""),
        str(item.get("summary") or ""),
        str(item.get("source") or ""),
        " ".join(str(tag) for tag in tags if tag),
    ]).lower()
    for key, _label, terms in rules:
        if not terms or any(matches_subcategory_term(text, term) for term in terms):
            return key
    return rules[-1][0]


def display_item(i):
    iso = i.get("published_iso")
    if not isinstance(iso, str) or not iso:
        iso = None
    ethics_tags = i.get("ethics_tags") or []
    if not isinstance(ethics_tags, (list, tuple)):
        ethics_tags = []
    disp = ""
    if iso:
        try:
            d = dt.datetime.fromisoformat(iso.replace("Z", "+00:00"))
            disp = format_date(d)
        except ValueError:
            disp = ""
    return {
        "title": str(i.get("title") or ""),
        "link": safe_external_url(i.get("link")),
        "source": str(i.get("source") or ""),
        "category": i.get("category") or "",
        "category_label": CATEGORY_LABELS.get(i.get("category"), ""),
        "published_display": disp, "published_iso": iso,
        "summary": str(i.get("summary") or ""),
        "ethics_tags": [str(tag) for tag in ethics_tags if tag],
        "trend_score": safe_trend_score(i.get("trend_score")),
    }


def display_subcategories(category, items):
    """Build five orbit-ready subcategory folders with ranked story previews."""
    rules = SUBCATEGORY_RULES[category]
    buckets = {key: [] for key, _label, _terms in rules}
    for item in items:
        buckets[classify_subcategory(category, item)].append(item)

    result = []
    for key, label, _terms in rules:
        ranked = sorted(
            buckets[key],
            key=lambda item: (
                safe_trend_score(item.get("trend_score")),
                str(item.get("published_iso") or ""),
            ),
            reverse=True,
        )
        if not ranked:
            continue
        result.append({
            "key": key,
            "label": label,
            "count": len(ranked),
            "folder_items": [display_item(item) for item in ranked[:3]],
        })
    return result


def load_previous_payload(path=OUT):
    """Read the last generated payload for category-level outage recovery."""
    if not os.path.exists(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
    except (OSError, ValueError, TypeError):
        return {}
    return payload if isinstance(payload, dict) else {}


def cached_story(item, category):
    """Convert a previously displayed story back into the internal shape."""
    if not isinstance(item, dict):
        return None
    title = str(item.get("title") or "").strip()
    link = safe_external_url(item.get("link"))
    if not title or not link:
        return None
    published_iso, epoch = parse_date(str(item.get("published_iso") or ""))
    ethics_tags = item.get("ethics_tags") or []
    if not isinstance(ethics_tags, (list, tuple)):
        ethics_tags = []
    return {
        "title": title,
        "link": link,
        "source": str(item.get("source") or "Web"),
        "category": category,
        "published_iso": published_iso,
        "epoch": epoch,
        "summary": str(item.get("summary") or ""),
        "ethics_tags": [str(tag) for tag in ethics_tags if tag],
        "trend_score": safe_trend_score(item.get("trend_score")),
    }


def restore_failed_categories(categories, all_items, previous_payload):
    """Retain last-known stories when every feed for a category is offline."""
    previous_categories = previous_payload.get("categories", {})
    if not isinstance(previous_categories, dict):
        return 0

    known_links = {
        canonical_url(item.get("link", "")) for item in all_items
        if canonical_url(item.get("link", ""))
    }
    restored_count = 0

    for category in CATEGORY_ORDER:
        group = categories.get(category)
        if not isinstance(group, dict) or group.get("successful_feeds", 0) > 0:
            continue
        previous_group = previous_categories.get(category, {})
        previous_items = (previous_group.get("items", [])
                          if isinstance(previous_group, dict) else [])
        if not isinstance(previous_items, list):
            continue

        restored = []
        category_links = set()
        for cached in previous_items:
            item = cached_story(cached, category)
            if not item:
                continue
            link = canonical_url(item["link"])
            if not link or link in category_links:
                continue
            category_links.add(link)
            restored.append(item)
            if link not in known_links:
                all_items.append(item)
                known_links.add(link)
            if len(restored) == PER_CATEGORY:
                break

        if restored:
            group["items"] = restored
            restored_count += len(restored)
            print("  ! restored %d cached stories for %s after all feeds failed"
                  % (len(restored), CATEGORY_LABELS[category]), file=sys.stderr)

    return restored_count


def main():
    print("Fetching feeds...")
    previous_payload = load_previous_payload()
    categories, all_items = collect()
    fresh_item_count = len(all_items)
    print("Collected %d fresh unique items." % fresh_item_count)

    if fresh_item_count < MIN_ITEMS_TO_WRITE and os.path.exists(OUT):
        print("Too few items (%d); keeping existing data." % fresh_item_count)
        return 0

    restore_failed_categories(categories, all_items, previous_payload)

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
                               key=lambda x: x.get("trend_score", 0), reverse=True)[:3]],
                           "subcategories": display_subcategories(
                               c, categories[c]["items"])}
                       for c in CATEGORY_ORDER},
        "trending": trending,
        "ai_pulse": compute_ai_pulse(all_items, trending),
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
