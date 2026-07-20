#!/usr/bin/env python3
"""Validate the generated Industry Atlas data before deployment."""

import json
import os
import sys
from urllib.parse import urlsplit


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDUSTRY_PATH = os.path.join(ROOT, "_data", "industry.json")


def safe_url(value):
    if value == "/sources/":
        return True
    if not isinstance(value, str):
        return False
    parsed = urlsplit(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def is_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def validate(payload):
    errors = []
    diffusion = payload.get("diffusion_watch", {})
    evidence_classes = diffusion.get("evidence_classes")
    milestones = diffusion.get("milestones")
    coverage = diffusion.get("coverage", {})
    if not isinstance(evidence_classes, list) or not evidence_classes:
        errors.append("diffusion_watch.evidence_classes must be non-empty")
        evidence_keys = set()
    else:
        evidence_keys = {row.get("key") for row in evidence_classes if row.get("key")}
    if not isinstance(milestones, list) or not milestones:
        errors.append("diffusion_watch.milestones must be non-empty")
    else:
        for index, milestone in enumerate(milestones):
            if milestone.get("evidence_class") not in evidence_keys:
                errors.append(
                    "diffusion_watch.milestones[%d].evidence_class is unknown" % index
                )
            if not milestone.get("date") or not milestone.get("headline"):
                errors.append(
                    "diffusion_watch.milestones[%d] needs a date and headline" % index
                )
            if not safe_url(milestone.get("source_url")):
                errors.append(
                    "diffusion_watch.milestones[%d].source_url must be safe" % index
                )
    if not is_number(coverage.get("story_count")) or coverage.get("story_count", -1) < 0:
        errors.append("diffusion_watch.coverage.story_count must be non-negative")
    if not isinstance(coverage.get("daily"), list):
        errors.append("diffusion_watch.coverage.daily must be a list")

    lifecycle = payload.get("topic_lifecycle", {})
    series = lifecycle.get("series")
    if not isinstance(series, list) or not series:
        errors.append("topic_lifecycle.series must be a non-empty list")
    else:
        for index, row in enumerate(series):
            if not row.get("term"):
                errors.append("topic_lifecycle.series[%d].term is required" % index)
            points = row.get("points")
            if not isinstance(points, list) or not points:
                errors.append("topic_lifecycle.series[%d].points must be non-empty" % index)
                continue
            for point_index, point in enumerate(points):
                share = point.get("share")
                if not is_number(share) or not 0 <= share <= 100:
                    errors.append(
                        "topic_lifecycle.series[%d].points[%d].share must be 0-100"
                        % (index, point_index)
                    )

    stack = payload.get("industry_stack", {})
    layers = stack.get("layers")
    companies = stack.get("companies")
    if not isinstance(layers, list) or len(layers) != 5:
        errors.append("industry_stack.layers must contain five layers")
    if not isinstance(companies, list) or not companies:
        errors.append("industry_stack.companies must be a non-empty list")
    elif isinstance(layers, list):
        for index, company in enumerate(companies):
            if len(company.get("cells", [])) != len(layers):
                errors.append("industry_stack.companies[%d] must have one cell per layer" % index)

    models = payload.get("model_frontier", {})
    if models.get("status") != "unavailable":
        rows = models.get("models")
        if not isinstance(rows, list) or not rows:
            errors.append("model_frontier.models must be non-empty when available")
        else:
            for index, row in enumerate(rows):
                if not is_number(row.get("price")) or row["price"] <= 0:
                    errors.append("model_frontier.models[%d].price must be positive" % index)
                if not is_number(row.get("score")):
                    errors.append("model_frontier.models[%d].score must be numeric" % index)

    adoption = payload.get("adoption", {})
    if adoption.get("status") != "unavailable":
        sectors = adoption.get("sectors")
        if not isinstance(sectors, list) or not sectors:
            errors.append("adoption.sectors must be non-empty when available")
        else:
            for index, sector in enumerate(sectors):
                for field in ("current", "expected"):
                    value = sector.get(field)
                    if not is_number(value) or not 0 <= value <= 100:
                        errors.append("adoption.sectors[%d].%s must be 0-100" % (index, field))

    economics = payload.get("company_economics", {})
    if economics.get("status") != "unavailable":
        rows = economics.get("companies")
        if not isinstance(rows, list) or not rows:
            errors.append("company_economics.companies must be non-empty when available")
        else:
            for index, row in enumerate(rows):
                for field in ("funding", "revenue"):
                    if not is_number(row.get(field)) or row[field] <= 0:
                        errors.append(
                            "company_economics.companies[%d].%s must be positive"
                            % (index, field)
                        )

    sources = payload.get("sources")
    if not isinstance(sources, dict) or len(sources) < 4:
        errors.append("sources must include all atlas datasets")
    else:
        for key, source in sources.items():
            if not source.get("label") or not safe_url(source.get("url")):
                errors.append("sources.%s must have a label and safe URL" % key)
    return errors


def main():
    with open(INDUSTRY_PATH, "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    errors = validate(payload)
    if errors:
        for error in errors:
            print("ERROR: %s" % error, file=sys.stderr)
        return 1
    print("Validated %s" % INDUSTRY_PATH)
    return 0


if __name__ == "__main__":
    sys.exit(main())
