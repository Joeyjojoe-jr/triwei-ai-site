#!/usr/bin/env python3
"""Build the data behind TriWei AI's Industry Atlas.

The atlas intentionally keeps two kinds of evidence separate:

* TriWei coverage signals, derived from the site's deduplicated news feed.
* Industry measures, downloaded from documented public datasets.

The script uses only the Python standard library so it can run in the existing
GitHub Actions job. If an external source is temporarily unavailable, the last
good external section is retained while the local coverage sections refresh.
"""

import csv
import datetime as dt
import io
import json
import os
import re
import sys
import zipfile
from collections import Counter, defaultdict
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NEWS_PATH = os.path.join(ROOT, "_data", "news.json")
OUT_PATH = os.path.join(ROOT, "_data", "industry.json")
HISTORY_PATH = os.path.join(ROOT, "_data", "topic_history.json")
DIFFUSION_HISTORY_PATH = os.path.join(ROOT, "_data", "diffusion_history.json")

USER_AGENT = "TriWeiIndustryBot/1.0 (+https://triwei.ai)"
TIMEOUT = 35
HISTORY_DAYS = 90
TOPIC_SERIES_COUNT = 6
DIFFUSION_HISTORY_DAYS = 365

CENSUS_SECTOR_URL = "https://www.census.gov/hfp/btos/downloads/Sector.xlsx"
EPOCH_MODEL_URL = (
    "https://raw.githubusercontent.com/epoch-research/"
    "llm-benchmark-efficiency/main/data/aa_data_with_math5.csv"
)
EPOCH_COMPANY_URL = "https://epoch.ai/data/ai_companies.zip"

SOURCES = {
    "coverage": {
        "label": "TriWei AI coverage",
        "url": "/sources/",
        "kind": "coverage",
    },
    "census": {
        "label": "U.S. Census Bureau — Business Trends and Outlook Survey",
        "url": "https://www.census.gov/hfp/btos/data_downloads",
        "kind": "market",
    },
    "model": {
        "label": "Epoch AI — LLM inference price trends",
        "url": "https://epoch.ai/data-insights/llm-inference-price-trends",
        "kind": "market",
    },
    "company": {
        "label": "Epoch AI — AI Companies dataset",
        "url": "https://epoch.ai/data/ai-companies",
        "kind": "market",
    },
    "diffusion": {
        "label": "Primary-source model diffusion ledger",
        "url": "/sources/",
        "kind": "strategic",
    },
}

DIFFUSION_LABS = {
    "DeepSeek": ["deepseek"],
    "Moonshot / Kimi": ["moonshot", "kimi"],
    "MiniMax": ["minimax"],
    "Alibaba / Qwen": ["alibaba", "qwen"],
    "Z.ai / GLM": ["z.ai", "zhipu", "glm-", "glm 5"],
}

DIFFUSION_SIGNALS = {
    "Distillation / extraction": [
        "distill", "model extraction", "extract capabilities", "reasoning traces",
        "synthetic training", "teacher model",
    ],
    "Open weights": [
        "open-weight", "open weight", "open-source model", "open source model",
        "model weights", "weights release", "weights will be released",
    ],
    "Capability convergence": [
        "frontier-level", "frontier model", "benchmark", "outperform", "rival",
        "catching up", "parity", "toe-to-toe", "challenge openai", "challenge anthropic",
    ],
}

DIFFUSION_EVIDENCE_CLASSES = [
    {
        "key": "disclosed",
        "label": "Developer disclosure",
        "meaning": "The model developer identifies its own teacher, student, or training method.",
    },
    {
        "key": "provider_claim",
        "label": "Provider-attributed claim",
        "meaning": "A frontier provider publishes an attribution; it is not treated as an independent adjudication.",
    },
    {
        "key": "released",
        "label": "Weights released",
        "meaning": "Downloadable checkpoints and their stated license are publicly available.",
    },
    {
        "key": "announced",
        "label": "Weights announced",
        "meaning": "The developer has committed to a release, but the tracker has not yet verified the weights.",
    },
]

DIFFUSION_MILESTONES = [
    {
        "date": "2025-01-20",
        "lab": "DeepSeek",
        "evidence_class": "disclosed",
        "headline": "R1 distills its reasoning into Qwen and Llama students",
        "detail": "DeepSeek says it fine-tuned Qwen and Llama base models on 800,000 samples curated with DeepSeek-R1.",
        "open_weight_status": "Released",
        "source_label": "DeepSeek-R1 repository",
        "source_url": "https://github.com/deepseek-ai/DeepSeek-R1",
    },
    {
        "date": "2025-07-11",
        "lab": "Moonshot / Kimi",
        "evidence_class": "released",
        "headline": "Kimi K2 checkpoints push agentic capability into open weights",
        "detail": "Moonshot published Kimi K2 base and instruct checkpoints for its 1T-parameter, 32B-active mixture-of-experts model.",
        "open_weight_status": "Released",
        "source_label": "Kimi K2 repository and technical report",
        "source_url": "https://github.com/MoonshotAI/Kimi-K2",
    },
    {
        "date": "2026-02-12",
        "lab": "DeepSeek",
        "evidence_class": "provider_claim",
        "headline": "OpenAI reports activity consistent with adversarial distillation",
        "detail": "In a U.S. House committee submission, OpenAI attributes circumvention and programmatic output collection activity to DeepSeek-associated accounts. This remains OpenAI's published attribution.",
        "open_weight_status": "Not applicable",
        "source_label": "OpenAI submission to the U.S. House Select Committee",
        "source_url": "https://cdn.openai.com/pdf/045aa967-ee96-4a09-94ee-3098ddf6db2c/OpenAI-US-House-Select-Cmte-Update-%5B021226%5D.pdf",
    },
    {
        "date": "2026-02-23",
        "lab": "DeepSeek · Moonshot · MiniMax",
        "evidence_class": "provider_claim",
        "headline": "Anthropic attributes industrial-scale Claude extraction campaigns",
        "detail": "Anthropic says it linked more than 16 million exchanges across roughly 24,000 accounts to the three labs. This is Anthropic's published attribution, not an independent ruling.",
        "open_weight_status": "Not applicable",
        "source_label": "Anthropic distillation-attack report",
        "source_url": "https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks",
    },
    {
        "date": "2026-07-16",
        "lab": "Moonshot / Kimi",
        "evidence_class": "announced",
        "headline": "Kimi K3 launches at the 2.8T-parameter frontier",
        "detail": "Moonshot launched Kimi K3 through its products and API and says full model weights will be released by July 27, 2026.",
        "open_weight_status": "Announced for Jul 27",
        "source_label": "Kimi K3 technical blog",
        "source_url": "https://www.kimi.com/blog/kimi-k3",
    },
]

ENTITY_ALIASES = {
    "OpenAI": ["openai", "chatgpt", "gpt-", "gpt 4", "gpt 5"],
    "Anthropic": ["anthropic", "claude"],
    "Google": ["google", "deepmind", "gemini"],
    "Meta": ["meta ai", "meta's", "meta ", "llama"],
    "Microsoft": ["microsoft", "azure", "copilot"],
    "Nvidia": ["nvidia"],
    "xAI": ["xai", "x.ai", "grok"],
    "Mistral": ["mistral"],
    "DeepSeek": ["deepseek"],
    "Moonshot": ["moonshot", "kimi"],
}

STACK_LAYERS = [
    (
        "hardware",
        "Chips & hardware",
        ["chip", "gpu", "semiconductor", "hardware", "robot", "device", "memory"],
    ),
    (
        "cloud",
        "Cloud & compute",
        ["cloud", "compute", "data center", "datacenter", "server", "lease", "azure", "aws"],
    ),
    (
        "models",
        "Models & research",
        ["model", "benchmark", "training", "inference", "llm", "release", "reasoning", "research"],
    ),
    (
        "apps",
        "Tools & applications",
        ["agent", "coding", "developer", "enterprise", "customer", "tool", "app", "product", "workflow"],
    ),
    (
        "society",
        "Policy & society",
        ["regulat", "safety", "ethic", "copyright", "privacy", "bias", "labor", "job", "govern", "law", "surveillance"],
    ),
]

SECTOR_NAMES = {
    "11": "Agriculture",
    "21": "Mining & extraction",
    "22": "Utilities",
    "23": "Construction",
    "31": "Manufacturing",
    "42": "Wholesale trade",
    "44": "Retail trade",
    "48": "Transportation & warehousing",
    "51": "Information",
    "52": "Finance & insurance",
    "53": "Real estate",
    "54": "Professional & technical services",
    "55": "Company management",
    "56": "Administrative services",
    "61": "Education",
    "62": "Health care",
    "71": "Arts & recreation",
    "72": "Accommodation & food",
    "81": "Other services",
}


def fetch_bytes(url):
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=TIMEOUT) as response:
        return response.read()


def load_json(path, default):
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, ValueError):
        return default


def write_json(path, payload):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    temporary = path + ".tmp"
    with open(temporary, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    os.replace(temporary, path)


def parse_iso(value):
    if not value:
        return None
    try:
        return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def unique_news_items(news):
    seen = set()
    items = []
    for key in news.get("category_order", []):
        for item in news.get("categories", {}).get(key, {}).get("items", []):
            identity = item.get("link") or item.get("title")
            if not identity or identity in seen:
                continue
            seen.add(identity)
            items.append(item)
    return items


def story_text(item):
    return " ".join(
        [item.get("title", ""), item.get("summary", ""), item.get("category_label", "")]
    ).lower()


def term_present(text, term):
    needle = term.lower()
    if re.match(r"^[a-z0-9]+$", needle):
        return re.search(r"\b%s\b" % re.escape(needle), text) is not None
    return needle in text


def build_topic_history(news, items, now):
    history = load_json(HISTORY_PATH, {"days": []})
    by_date = defaultdict(list)
    for item in items:
        published = parse_iso(item.get("published_iso"))
        if published:
            by_date[published.date().isoformat()].append(item)

    known_terms = [row.get("term", "") for row in news.get("trending", []) if row.get("term")]
    existing_terms = {
        term
        for day in history.get("days", [])
        for term in day.get("topics", {}).keys()
    }
    terms = sorted(set(known_terms) | existing_terms, key=str.lower)
    records = {row.get("date"): row for row in history.get("days", []) if row.get("date")}

    # Rebuild every day visible in the current feed. This backfills the first
    # run and corrects partial same-day snapshots on later runs.
    for date_key, day_items in by_date.items():
        counts = {}
        for term in terms:
            count = sum(term_present(story_text(item), term) for item in day_items)
            if count:
                counts[term] = count
        records[date_key] = {
            "date": date_key,
            "story_count": len(day_items),
            "topics": counts,
        }

    cutoff = (now.date() - dt.timedelta(days=HISTORY_DAYS - 1)).isoformat()
    days = [records[key] for key in sorted(records) if key >= cutoff]
    write_json(HISTORY_PATH, {"days": days})

    totals = Counter()
    for day in days:
        totals.update(day.get("topics", {}))
    selected = [term for term, _ in totals.most_common(TOPIC_SERIES_COUNT)]
    if not selected:
        selected = known_terms[:TOPIC_SERIES_COUNT]

    series = []
    for term in selected:
        points = []
        for day in days:
            denominator = max(int(day.get("story_count", 0)), 1)
            count = int(day.get("topics", {}).get(term, 0))
            points.append(
                {
                    "date": day["date"],
                    "count": count,
                    "share": round((count / denominator) * 100, 1),
                }
            )
        series.append({"term": term, "total": totals[term], "points": points})

    return {
        "window_days": HISTORY_DAYS,
        "observed_days": len(days),
        "series": series,
        "metric": "Share of distinct TriWei stories mentioning the topic",
        "source": "coverage",
    }


def build_stack(items):
    companies = []
    maximum = 0
    for company, aliases in ENTITY_ALIASES.items():
        company_items = [
            item for item in items if any(alias in story_text(item) for alias in aliases)
        ]
        if not company_items:
            continue
        cells = []
        for layer_key, layer_label, keywords in STACK_LAYERS:
            count = sum(
                any(keyword in story_text(item) for keyword in keywords)
                for item in company_items
            )
            maximum = max(maximum, count)
            cells.append({"key": layer_key, "label": layer_label, "count": count})
        companies.append(
            {"name": company, "story_count": len(company_items), "cells": cells}
        )

    companies.sort(key=lambda row: (-row["story_count"], row["name"]))
    return {
        "layers": [{"key": key, "label": label} for key, label, _ in STACK_LAYERS],
        "companies": companies[:8],
        "max_count": maximum,
        "metric": "Distinct stories mentioning both the company and layer",
        "source": "coverage",
    }


def diffusion_story(item):
    """Return the labs and signals for a story in the diffusion watch."""
    text = story_text(item)
    labs = [
        lab for lab, aliases in DIFFUSION_LABS.items()
        if any(alias in text for alias in aliases)
    ]
    signals = [
        signal for signal, terms in DIFFUSION_SIGNALS.items()
        if any(term in text for term in terms)
    ]
    core_signals = {
        "Distillation / extraction", "Open weights", "Capability convergence",
    }
    if not labs or not core_signals.intersection(signals):
        return None
    return {"labs": labs, "signals": signals}


def build_diffusion_watch(items, now):
    """Build a primary-source ledger plus a rolling coverage signal."""
    matched = []
    for item in items:
        classification = diffusion_story(item)
        if not classification:
            continue
        matched.append({"item": item, **classification})

    history = load_json(DIFFUSION_HISTORY_PATH, {"days": []})
    records = {
        row.get("date"): row for row in history.get("days", [])
        if isinstance(row, dict) and row.get("date")
    }
    by_date = defaultdict(list)
    for row in matched:
        published = parse_iso(row["item"].get("published_iso"))
        if published:
            by_date[published.date().isoformat()].append(row)

    for date_key, rows in by_date.items():
        lab_counts = Counter(lab for row in rows for lab in row["labs"])
        signal_counts = Counter(signal for row in rows for signal in row["signals"])
        records[date_key] = {
            "date": date_key,
            "story_count": len(rows),
            "labs": dict(sorted(lab_counts.items())),
            "signals": dict(sorted(signal_counts.items())),
        }

    cutoff = (now.date() - dt.timedelta(days=DIFFUSION_HISTORY_DAYS - 1)).isoformat()
    days = [records[key] for key in sorted(records) if key >= cutoff]
    write_json(DIFFUSION_HISTORY_PATH, {"days": days})

    lab_counts = Counter(lab for row in matched for lab in row["labs"])
    signal_counts = Counter(signal for row in matched for signal in row["signals"])
    ranked = sorted(
        matched,
        key=lambda row: row["item"].get("published_iso") or "",
        reverse=True,
    )
    stories = []
    for row in ranked[:8]:
        item = row["item"]
        stories.append({
            "title": item.get("title", ""),
            "link": item.get("link", ""),
            "source": item.get("source", ""),
            "published_display": item.get("published_display", ""),
            "labs": row["labs"],
            "signals": row["signals"],
        })

    return {
        "coverage": {
            "story_count": len(matched),
            "lab_count": len(lab_counts),
            "labs": [
                {"name": name, "count": count}
                for name, count in lab_counts.most_common()
            ],
            "signals": [
                {"name": name, "count": count}
                for name, count in signal_counts.most_common()
            ],
            "stories": stories,
            "observed_days": len(days),
            "window_days": DIFFUSION_HISTORY_DAYS,
            "daily": days,
            "metric": "Distinct TriWei stories connecting a tracked China-based lab to distillation, model extraction, open weights, or frontier-capability convergence",
            "source": "coverage",
        },
        "evidence_classes": DIFFUSION_EVIDENCE_CLASSES,
        "milestones": DIFFUSION_MILESTONES,
        "source": "diffusion",
    }


def xlsx_rows(raw, sheet_name):
    archive = zipfile.ZipFile(io.BytesIO(raw))
    main_ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    rel_ns = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    ns = {"m": main_ns, "r": rel_ns}

    strings = []
    if "xl/sharedStrings.xml" in archive.namelist():
        root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
        strings = [
            "".join(node.text or "" for node in item.findall(".//m:t", ns))
            for item in root.findall("m:si", ns)
        ]

    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    relationship_map = {node.attrib["Id"]: node.attrib["Target"] for node in relationships}
    target = None
    for sheet in workbook.findall(".//m:sheet", ns):
        if sheet.attrib.get("name") == sheet_name:
            rel_id = sheet.attrib.get("{%s}id" % rel_ns)
            target = relationship_map.get(rel_id)
            break
    if not target:
        raise ValueError("Missing XLSX sheet: %s" % sheet_name)
    target = target.lstrip("/")
    if not target.startswith("xl/"):
        target = "xl/" + target

    def cell_value(cell):
        value_node = cell.find("m:v", ns)
        value = "" if value_node is None else (value_node.text or "")
        if cell.attrib.get("t") == "s" and value:
            return strings[int(value)]
        if cell.attrib.get("t") == "inlineStr":
            return "".join(node.text or "" for node in cell.findall(".//m:t", ns))
        return value

    sheet_root = ET.fromstring(archive.read(target))
    parsed = []
    for row in sheet_root.findall(".//m:sheetData/m:row", ns):
        values = {}
        for cell in row.findall("m:c", ns):
            reference = cell.attrib.get("r", "")
            column = re.sub(r"\d", "", reference)
            values[column] = cell_value(cell)
        parsed.append(values)
    return parsed


def parse_percent(value):
    if not value or value in {"S", "."}:
        return None
    try:
        return float(value.rstrip("%"))
    except ValueError:
        return None


def build_adoption():
    raw = fetch_bytes(CENSUS_SECTOR_URL)
    rows = xlsx_rows(raw, "Response Estimates")
    if not rows:
        raise ValueError("Census workbook contained no response rows")
    header = rows[0]
    period_columns = [key for key, value in header.items() if re.match(r"^\d{6}$", value)]
    if not period_columns:
        raise ValueError("Census workbook contained no period columns")
    latest_column = period_columns[0]
    latest_period = header[latest_column]

    values = defaultdict(dict)
    for row in rows[1:]:
        sector = row.get("A", "")
        question_id = row.get("B", "")
        answer = row.get("E", "")
        if sector not in SECTOR_NAMES or answer != "Yes" or question_id not in {"7", "24"}:
            continue
        value = parse_percent(row.get(latest_column))
        if value is not None:
            values[sector][question_id] = value

    sectors = []
    for code, record in values.items():
        if "7" not in record or "24" not in record:
            continue
        sectors.append(
            {
                "code": code,
                "name": SECTOR_NAMES[code],
                "current": record["7"],
                "expected": record["24"],
                "gap": round(record["24"] - record["7"], 1),
            }
        )
    sectors.sort(key=lambda row: (-row["current"], row["name"]))

    period_label = latest_period
    date_rows = xlsx_rows(raw, "Collection and Reference Dates")
    for row in date_rows[1:]:
        if row.get("D") != latest_period:
            continue
        try:
            excel_date = int(float(row.get("H", "")))
            reference_end = dt.date(1899, 12, 30) + dt.timedelta(days=excel_date)
            period_label = "Reference period ending " + reference_end.strftime("%b %d, %Y")
        except (ValueError, TypeError):
            pass
        break

    # Windows' strftime does not support %-d.
    period_label = re.sub(r"\b0(\d),", r"\1,", period_label)
    return {
        "period": period_label,
        "sectors": sectors,
        "metric": "Share of U.S. employer businesses reporting AI use",
        "method_note": (
            "Current means used AI in any business function in the prior two weeks; "
            "expected means plans to use AI in the next six months."
        ),
        "source": "census",
    }


def infer_model_organization(name):
    lowered = name.lower()
    rules = [
        (["claude"], "Anthropic"),
        (["gpt", "o1", "o3"], "OpenAI"),
        (["gemini", "gemma"], "Google"),
        (["llama"], "Meta"),
        (["mistral", "mixtral"], "Mistral"),
        (["phi"], "Microsoft"),
        (["qwen"], "Alibaba"),
    ]
    for needles, organization in rules:
        if any(needle in lowered for needle in needles):
            return organization
    return "Other"


def build_model_frontier():
    text = fetch_bytes(EPOCH_MODEL_URL).decode("utf-8-sig")
    rows = []
    for row in csv.DictReader(io.StringIO(text)):
        try:
            release = dt.date.fromisoformat(row.get("Release Date", ""))
            price = float(row.get("USD per 1M Tokens", ""))
            score = float(row.get("GPQA Diamond", ""))
        except (TypeError, ValueError):
            continue
        if release < dt.date(2024, 1, 1) or price <= 0:
            continue
        try:
            speed = float(row.get("Tokens per Second", ""))
        except (TypeError, ValueError):
            speed = None
        rows.append(
            {
                "name": row.get("Model Name", "Unknown"),
                "organization": infer_model_organization(row.get("Model Name", "")),
                "release_date": release.isoformat(),
                "price": round(price, 4),
                "score": round(score, 1),
                "speed": None if speed is None else round(speed, 1),
            }
        )

    # Favor current and diverse observations while retaining the actual value
    # frontier. This keeps the chart legible on a phone.
    rows.sort(key=lambda row: (row["release_date"], row["score"]), reverse=True)
    candidates = rows[:22]
    best_score = -1.0
    frontier_names = set()
    for row in sorted(rows, key=lambda item: (item["price"], -item["score"])):
        if row["score"] > best_score:
            frontier_names.add(row["name"])
            best_score = row["score"]
    for row in rows:
        if row["name"] in frontier_names and row not in candidates:
            candidates.append(row)
    candidates = candidates[:28]
    for row in candidates:
        row["frontier"] = row["name"] in frontier_names
    candidates.sort(key=lambda row: row["price"])

    newest = max((row["release_date"] for row in rows), default="")
    return {
        "benchmark": "GPQA Diamond",
        "price_metric": "USD per 1M tokens, 3:1 input/output weighted",
        "data_through": newest,
        "models": candidates,
        "metric": "Benchmark score versus standardized API price",
        "source": "model",
    }


def latest_by_company(rows, date_field="Date"):
    latest = {}
    for row in rows:
        if row.get("Exclude from graph view"):
            continue
        company = row.get("Company", "")
        if not company:
            continue
        if company not in latest or row.get(date_field, "") > latest[company].get(date_field, ""):
            latest[company] = row
    return latest


def float_or_none(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def build_company_economics():
    archive = zipfile.ZipFile(io.BytesIO(fetch_bytes(EPOCH_COMPANY_URL)))

    def read_csv(name):
        with archive.open(name) as handle:
            text = io.TextIOWrapper(handle, encoding="utf-8-sig")
            return list(csv.DictReader(text))

    companies = {row.get("Name"): row for row in read_csv("ai_companies.csv")}
    revenues = latest_by_company(read_csv("ai_companies_revenue_reports.csv"))
    staff = latest_by_company(read_csv("ai_companies_staff_reports.csv"))
    items = []
    for name, revenue_row in revenues.items():
        company = companies.get(name, {})
        funding = float_or_none(company.get("Total equity funding"))
        revenue = float_or_none(revenue_row.get("Annualized revenue (USD)"))
        if not funding or not revenue:
            continue
        staff_row = staff.get(name, {})
        staff_count = float_or_none(staff_row.get("Staff count"))
        items.append(
            {
                "name": name,
                "funding": round(funding),
                "revenue": round(revenue),
                "staff": None if staff_count is None else round(staff_count),
                "date": revenue_row.get("Date", ""),
                "confidence": revenue_row.get("Confidence", ""),
            }
        )
    items.sort(key=lambda row: (-row["revenue"], row["name"]))
    return {
        "companies": items[:9],
        "metric": "Latest reported annualized revenue versus cumulative equity funding",
        "method_note": (
            "Private-company figures are public estimates or disclosures and are not "
            "perfectly comparable. Bubble size represents latest reported staff count."
        ),
        "source": "company",
    }


def preserve_or_build(previous, key, builder):
    try:
        value = builder()
        value["status"] = "fresh"
        return value
    except Exception as error:  # A stale chart is better than a broken page.
        print("Warning: %s refresh failed: %s" % (key, error), file=sys.stderr)
        retained = previous.get(key)
        if retained:
            retained = dict(retained)
            retained["status"] = "retained"
            return retained
        return {
            "status": "unavailable",
            "message": "This dataset is temporarily unavailable.",
        }


def main():
    news = load_json(NEWS_PATH, {})
    if not news:
        raise SystemExit("News data is required. Run scripts/fetch_news.py first.")

    previous = load_json(OUT_PATH, {})
    items = unique_news_items(news)
    now = dt.datetime.now(dt.timezone.utc)
    payload = {
        "generated_utc": now.isoformat().replace("+00:00", "Z"),
        "generated_display": now.astimezone().strftime("%b %d, %Y"),
        "coverage_generated_display": news.get("generated_display", ""),
        "diffusion_watch": build_diffusion_watch(items, now),
        "topic_lifecycle": build_topic_history(news, items, now),
        "industry_stack": build_stack(items),
        "model_frontier": preserve_or_build(previous, "model_frontier", build_model_frontier),
        "adoption": preserve_or_build(previous, "adoption", build_adoption),
        "company_economics": preserve_or_build(previous, "company_economics", build_company_economics),
        "sources": SOURCES,
    }
    write_json(OUT_PATH, payload)
    print(
        "Wrote %s (%d topic series, %d companies, %d adoption sectors)."
        % (
            OUT_PATH,
            len(payload["topic_lifecycle"].get("series", [])),
            len(payload["industry_stack"].get("companies", [])),
            len(payload["adoption"].get("sectors", [])),
        )
    )


if __name__ == "__main__":
    main()
