#!/usr/bin/env python3
"""Fail CI when rendered public pages violate TriWei's publication contract."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from urllib.parse import urlparse


GOVERNED_ROUTES = {
    "about": "about/index.html",
    "signals": "signals/index.html",
    "hardware": "hardware/index.html",
    "industry": "industry/index.html",
    "ethics": "ethics/index.html",
    "sources": "sources/index.html",
    "corrections": "corrections/index.html",
}

INTERMEDIARY_HOSTS = {
    "news.google.com",
}

FORBIDDEN_RENDERED_CLASSES = {
    "news-summary",
    "ethics-tags",
    "signal-node-summary",
    "signal-status",
    "fab-lesson",
    "atlas-readout",
    "diffusion-story-list",
    "pulse-why",
}

FORBIDDEN_RENDERED_PHRASES = {
    "How strongly each ethical dimension is running",
    "Every item here touches at least one ethical dimension",
    "Why is this node labeled",
    "What it teaches:",
    "What the current news cycle is connecting",
}

HREF_RE = re.compile(r"\bhref=[\"']([^\"']+)[\"']", re.IGNORECASE)
CLASS_RE = re.compile(r"\bclass=[\"']([^\"']+)[\"']", re.IGNORECASE)


def is_intermediary_url(value: str) -> bool:
    parsed = urlparse(value)
    host = parsed.netloc.lower().removeprefix("www.")
    if host in INTERMEDIARY_HOSTS:
        return True
    if host in {"google.com", "bing.com", "duckduckgo.com"} and (
        parsed.path.startswith("/search") or "q=" in parsed.query
    ):
        return True
    return False


def audit_html(path: Path, relative: str, errors: list[str]) -> None:
    text = path.read_text(encoding="utf-8")

    for href in HREF_RE.findall(text):
        if href.startswith(("http://", "https://")) and is_intermediary_url(href):
            errors.append(f"{relative}: intermediary public link {href}")

    classes: set[str] = set()
    for class_value in CLASS_RE.findall(text):
        classes.update(class_value.split())

    forbidden_classes = sorted(classes & FORBIDDEN_RENDERED_CLASSES)
    if forbidden_classes:
        errors.append(
            f"{relative}: forbidden rendered classes {', '.join(forbidden_classes)}"
        )

    for phrase in FORBIDDEN_RENDERED_PHRASES:
        if phrase in text:
            errors.append(f"{relative}: forbidden rendered phrase {phrase!r}")


def audit_research_library(text: str, errors: list[str]) -> None:
    relative = GOVERNED_ROUTES["signals"]
    for required in (
        "Research Lineage Library",
        "OpenAI ChatGPT",
        "Chronological order only",
        "Open arXiv abstract",
    ):
        if required not in text:
            errors.append(f"{relative}: missing research disclosure {required!r}")

    arxiv_links = [
        href for href in HREF_RE.findall(text)
        if "arxiv.org" in href.lower()
    ]
    if len(arxiv_links) < 8:
        errors.append(f"{relative}: expected at least eight direct arXiv records")

    for href in arxiv_links:
        if not re.fullmatch(r"https://arxiv\.org/abs/\d{4}\.\d{4,5}", href):
            errors.append(f"{relative}: non-abstract or malformed arXiv link {href}")

    if "Abstract:" in text:
        errors.append(f"{relative}: paper abstract text appears to be reproduced")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("site_dir", nargs="?", default="_site")
    args = parser.parse_args()

    site_dir = Path(args.site_dir)
    if not site_dir.is_dir():
        print(f"Publication audit failed: site directory not found: {site_dir}", file=sys.stderr)
        return 1

    errors: list[str] = []

    for html_path in site_dir.rglob("*.html"):
        relative = html_path.relative_to(site_dir).as_posix()
        audit_html(html_path, relative, errors)

    for key, relative in GOVERNED_ROUTES.items():
        path = site_dir / relative
        if not path.is_file():
            errors.append(f"missing governed route: {relative}")
            continue
        text = path.read_text(encoding="utf-8")
        if 'class="publication-status"' not in text:
            errors.append(f"{relative}: missing publication-status disclosure")
        if "site-wide contract" not in text.lower():
            errors.append(f"{relative}: missing publication-contract link or text")
        if key == "signals":
            audit_research_library(text, errors)

    homepage = site_dir / "index.html"
    if not homepage.is_file():
        errors.append("missing homepage index.html")
    else:
        home_text = homepage.read_text(encoding="utf-8")
        if "data-orbit-nav" not in home_text:
            errors.append("index.html: preserved orbit navigation missing")
        if "news.google.com" in home_text:
            errors.append("index.html: Google News intermediary remains rendered")
        if 'class="news-summary"' in home_text:
            errors.append("index.html: article summary block remains rendered")

    if errors:
        print("Publication audit failed:", file=sys.stderr)
        for error in errors:
            print(f" - {error}", file=sys.stderr)
        return 1

    print(
        "Publication audit passed: governed pages expose status disclosures, "
        "research records link to arXiv abstract pages, and no intermediary links "
        "or forbidden synopsis/judgment components were rendered."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
