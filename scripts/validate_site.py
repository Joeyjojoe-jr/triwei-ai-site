#!/usr/bin/env python3
"""Validate local links and assets in a generated Jekyll _site directory."""
from __future__ import annotations

import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.targets: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag in {"a", "link"} and values.get("href"):
            self.targets.append((tag, values["href"] or ""))
        if tag in {"script", "img", "source"} and values.get("src"):
            self.targets.append((tag, values["src"] or ""))


def candidates(site_root: Path, source_file: Path, raw_target: str) -> list[Path]:
    target = unquote(urlsplit(raw_target).path)
    if not target:
        return []
    if target.startswith("/"):
        base = site_root / target.lstrip("/")
    else:
        base = source_file.parent / target

    options = [base]
    if target.endswith("/"):
        options.append(base / "index.html")
    elif not base.suffix:
        options.extend([base / "index.html", base.with_suffix(".html")])
    return options


def main() -> int:
    site_root = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
    if not site_root.is_dir():
        print(f"ERROR: generated site directory not found: {site_root}")
        return 2

    failures: list[str] = []
    html_files = sorted(site_root.rglob("*.html"))
    for html_file in html_files:
        parser = LinkParser()
        parser.feed(html_file.read_text(encoding="utf-8", errors="replace"))
        for tag, target in parser.targets:
            lowered = target.lower()
            if lowered.startswith(("http://", "https://", "mailto:", "tel:", "data:", "javascript:", "#")):
                continue
            if "{{" in target or "{%" in target:
                failures.append(f"{html_file.relative_to(site_root)}: unresolved Liquid in {tag} target {target!r}")
                continue
            options = candidates(site_root, html_file, target)
            if options and not any(option.exists() for option in options):
                failures.append(f"{html_file.relative_to(site_root)}: missing {tag} target {target!r}")

    if failures:
        print("Internal site validation failed:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print(f"Validated {len(html_files)} HTML files: all local links and assets resolved.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
