"""Validate the hand-curated Signal History and AI Hardware ledgers."""

from __future__ import annotations

import argparse
import json
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
RELATIONSHIPS = {"seed", "corroborates", "complicates", "redirects"}
MATERIAL_FIELDS = {"what", "who", "where", "when", "why", "how"}


def load(name: str) -> dict:
    with (ROOT / "_data" / name).open(encoding="utf-8") as source:
        return json.load(source)


def require_https(value: str, context: str) -> None:
    parsed = urlparse(value)
    if parsed.scheme != "https" or not parsed.netloc:
        raise ValueError(f"{context} must use a complete HTTPS URL: {value!r}")


def parse_day(value: str, context: str) -> date:
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError as error:
        raise ValueError(f"{context} must be YYYY-MM-DD: {value!r}") from error


def validate_signals(data: dict) -> None:
    coverage_start = parse_day(data["coverage_start"], "signals.coverage_start")
    parse_day(data["verified_on"], "signals.verified_on")
    declared_relationships = {item["key"] for item in data["relationship_types"]}
    if declared_relationships != RELATIONSHIPS:
        raise ValueError("signals.relationship_types must declare all four editorial relationships")

    filters = {item["key"] for item in data["filters"]}
    if "all" not in filters:
        raise ValueError("signals.filters must include all")

    threads = data.get("threads", [])
    if len(threads) < 5:
        raise ValueError("signals must contain at least five evidence threads")
    keys: set[str] = set()
    for thread in threads:
        key = thread["key"]
        if key in keys:
            raise ValueError(f"duplicate signal thread key: {key}")
        keys.add(key)
        events = thread.get("events", [])
        if len(events) < 3:
            raise ValueError(f"signal thread {key} needs at least three dated events")
        if not any(event["relationship"] == "seed" for event in events):
            raise ValueError(f"signal thread {key} needs an early signal")
        if not any(event["relationship"] != "seed" for event in events):
            raise ValueError(f"signal thread {key} needs at least one later relationship")
        previous = coverage_start
        for event in events:
            event_date = parse_day(event["date"], f"signals.{key}.event.date")
            if event_date < coverage_start:
                raise ValueError(f"signal event predates declared coverage: {key}")
            if event_date < previous:
                raise ValueError(f"signal events must be chronological: {key}")
            previous = event_date
            if event["relationship"] not in RELATIONSHIPS:
                raise ValueError(f"unknown signal relationship in {key}")
            for field in ("source_type", "outlet", "author", "title", "note"):
                if not str(event.get(field, "")).strip():
                    raise ValueError(f"signal {key} event is missing {field}")
            require_https(event["url"], f"signals.{key}.event.url")

    observers = data.get("observers", [])
    if len(observers) < 5:
        raise ValueError("signals needs at least five durable early-read profiles")
    for observer in observers:
        require_https(observer["url"], f"signals.observer.{observer.get('name', 'unknown')}")
    if "right or wrong" not in data.get("method_note", "").lower():
        raise ValueError("signals method must explicitly reject a right/wrong scorecard")


def validate_hardware(data: dict, allow_stale: bool = False) -> None:
    verified = parse_day(data["verified_on"], "hardware.verified_on")
    reverify_by = parse_day(data["reverify_by"], "hardware.reverify_by")
    if (reverify_by - verified).days != 90:
        raise ValueError("hardware.reverify_by must be exactly 90 days after verified_on")
    age = (date.today() - verified).days
    if age < 0:
        raise ValueError("hardware verification date cannot be in the future")
    if age > 90 and not allow_stale:
        raise ValueError(f"hardware ledger is {age} days old; re-verify before presenting it as current")
    if age > 90:
        print(f"WARNING: hardware ledger is {age} days old; the rendered page must show its expired state.")

    metrics = {item["key"] for item in data.get("metrics", [])}
    required_metrics = {"capacity", "bandwidth", "compute", "interconnect", "power", "software"}
    if metrics != required_metrics:
        raise ValueError("hardware metrics must explain all six workload gates")

    products = {gpu["key"]: gpu for gpu in data.get("gpus", [])}
    for key in ("rtx-4060-ti-16", "rtx-4070-super-12"):
        if key not in products:
            raise ValueError(f"hardware comparator is missing {key}")
    sixteen = products["rtx-4060-ti-16"]
    twelve = products["rtx-4070-super-12"]
    if not (sixteen["memory_capacity_gb"] > twelve["memory_capacity_gb"]):
        raise ValueError("16GB comparison product must have greater capacity")
    if not (twelve["memory_bandwidth_gbps"] > sixteen["memory_bandwidth_gbps"]):
        raise ValueError("12GB comparison product must demonstrate higher bandwidth")
    for key, product in products.items():
        if product["memory_capacity_gb"] <= 0 or product["memory_bandwidth_gbps"] <= 0:
            raise ValueError(f"hardware product {key} has a non-positive memory specification")
        require_https(product["source_url"], f"hardware.gpus.{key}.source_url")

    materials = data.get("materials", [])
    if len(materials) < 5:
        raise ValueError("hardware ledger needs at least five material systems")
    for material in materials:
        missing = MATERIAL_FIELDS - {field for field in MATERIAL_FIELDS if str(material.get(field, "")).strip()}
        if missing:
            raise ValueError(f"material {material.get('key')} is missing 5W1H fields: {sorted(missing)}")
        require_https(material["source_url"], f"hardware.materials.{material.get('key')}")

    if len(data.get("fab_projects", [])) < 4:
        raise ValueError("hardware ledger needs at least four source-dated fab projects")
    for project in data["fab_projects"]:
        for field in ("status", "function", "announced", "production", "investment", "elapsed", "lesson"):
            if not str(project.get(field, "")).strip():
                raise ValueError(f"fab project {project.get('name')} is missing {field}")
        require_https(project["source_url"], f"hardware.fab_projects.{project.get('name')}")

    options = {item["key"] for item in data.get("conversion_options", [])}
    if options != {"keep", "retool", "repurpose", "greenfield"}:
        raise ValueError("hardware conversion framework must cover keep, retool, repurpose, and greenfield")
    if len(data.get("conversion_clock", [])) != 5:
        raise ValueError("hardware conversion clock must contain five gates")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--allow-stale", action="store_true", help="Validate structure while permitting the rendered expired state")
    args = parser.parse_args()
    validate_signals(load("signals.json"))
    validate_hardware(load("hardware.json"), allow_stale=args.allow_stale)
    print("Signal History and AI Hardware data validated.")


if __name__ == "__main__":
    main()
