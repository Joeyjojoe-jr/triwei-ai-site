#!/usr/bin/env python3
"""Validate generated news data before Jekyll renders or deploys it."""

import json
import os
import sys
from urllib.parse import urlsplit


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NEWS_PATH = os.path.join(ROOT, "_data", "news.json")
REQUIRED_ITEM_FIELDS = (
    "title", "link", "source", "category", "summary", "ethics_tags", "trend_score"
)


def is_safe_http_url(value):
    if not isinstance(value, str):
        return False
    try:
        parsed = urlsplit(value)
    except ValueError:
        return False
    return parsed.scheme.lower() in ("http", "https") and bool(parsed.netloc)


def validate_item(item, location, errors):
    if not isinstance(item, dict):
        errors.append("%s must be an object" % location)
        return
    for field in REQUIRED_ITEM_FIELDS:
        if field not in item or item[field] is None:
            errors.append("%s.%s is missing or null" % (location, field))
    if not is_safe_http_url(item.get("link")):
        errors.append("%s.link must be an absolute HTTP(S) URL" % location)
    if not isinstance(item.get("ethics_tags"), list):
        errors.append("%s.ethics_tags must be a list" % location)
    if not isinstance(item.get("trend_score"), (int, float)):
        errors.append("%s.trend_score must be numeric" % location)


def validate(payload):
    errors = []
    order = payload.get("category_order")
    categories = payload.get("categories")
    if not isinstance(order, list) or not order:
        return ["category_order must be a non-empty list"]
    if not isinstance(categories, dict):
        return ["categories must be an object"]

    pulse = payload.get("ai_pulse")
    if not isinstance(pulse, dict):
        errors.append("ai_pulse must be an object")
    else:
        for field in ("story_count", "source_count", "topic_count", "ethics_count"):
            if not isinstance(pulse.get(field), int) or pulse[field] < 0:
                errors.append("ai_pulse.%s must be a non-negative integer" % field)
        if (isinstance(pulse.get("story_count"), int) and
                isinstance(pulse.get("ethics_count"), int) and
                pulse["ethics_count"] > pulse["story_count"]):
            errors.append("ai_pulse.ethics_count cannot exceed story_count")
        if (isinstance(payload.get("item_count"), int) and
                pulse.get("story_count") != payload["item_count"]):
            errors.append("ai_pulse.story_count must match item_count")
        if (isinstance(payload.get("trending"), list) and
                pulse.get("topic_count") != len(payload["trending"])):
            errors.append("ai_pulse.topic_count must match trending length")
        coverage = pulse.get("coverage")
        if not isinstance(coverage, list) or len(coverage) > 4:
            errors.append("ai_pulse.coverage must contain at most four cards")
        else:
            seen_pulse_links = set()
            for card_index, card in enumerate(coverage):
                card_location = "ai_pulse.coverage[%d]" % card_index
                if not isinstance(card, dict):
                    errors.append("%s must be an object" % card_location)
                    continue
                if not card.get("term"):
                    errors.append("%s.term must be present" % card_location)
                for field in ("story_count", "source_count", "category_count"):
                    if not isinstance(card.get(field), int) or card[field] <= 0:
                        errors.append("%s.%s must be a positive integer" %
                                      (card_location, field))
                if (isinstance(card.get("story_count"), int) and
                        isinstance(card.get("source_count"), int) and
                        card["source_count"] > card["story_count"]):
                    errors.append("%s.source_count cannot exceed story_count" %
                                  card_location)
                if (isinstance(card.get("story_count"), int) and
                        isinstance(card.get("category_count"), int) and
                        card["category_count"] > card["story_count"]):
                    errors.append("%s.category_count cannot exceed story_count" %
                                  card_location)
                strength = card.get("strength_percent")
                if not isinstance(strength, int) or not 0 <= strength <= 100:
                    errors.append("%s.strength_percent must be from 0 to 100" %
                                  card_location)
                stories = card.get("stories")
                if not isinstance(stories, list) or not 2 <= len(stories) <= 3:
                    errors.append("%s.stories must contain two or three items" %
                                  card_location)
                    continue
                for story_index, item in enumerate(stories):
                    validate_item(item, "%s.stories[%d]" %
                                  (card_location, story_index), errors)
                    link = item.get("link") if isinstance(item, dict) else None
                    if link in seen_pulse_links:
                        errors.append("%s.stories cannot reuse a link" % card_location)
                    seen_pulse_links.add(link)

    for category in order:
        group = categories.get(category)
        location = "categories.%s" % category
        if not isinstance(group, dict):
            errors.append("%s is missing" % location)
            continue
        items = group.get("items")
        subcategories = group.get("subcategories")
        if not isinstance(items, list):
            errors.append("%s.items must be a list" % location)
            continue
        if not isinstance(subcategories, list):
            errors.append("%s.subcategories must be a list" % location)
            continue
        if items and not subcategories:
            errors.append("%s.subcategories cannot be empty when items are present" % location)
            continue
        for index, item in enumerate(items):
            validate_item(item, "%s.items[%d]" % (location, index), errors)

        seen_keys = set()
        assigned = 0
        for index, subcategory in enumerate(subcategories):
            sub_location = "%s.subcategories[%d]" % (location, index)
            if not isinstance(subcategory, dict):
                errors.append("%s must be an object" % sub_location)
                continue
            key = subcategory.get("key")
            count = subcategory.get("count")
            previews = subcategory.get("folder_items")
            if not key or key in seen_keys:
                errors.append("%s.key must be present and unique" % sub_location)
            seen_keys.add(key)
            if not isinstance(count, int) or count <= 0:
                errors.append("%s.count must be a positive integer" % sub_location)
            else:
                assigned += count
            if not isinstance(previews, list) or len(previews) > 3:
                errors.append("%s.folder_items must contain at most three items" % sub_location)
            else:
                for preview_index, item in enumerate(previews):
                    validate_item(
                        item,
                        "%s.folder_items[%d]" % (sub_location, preview_index),
                        errors,
                    )
        if assigned != len(items):
            errors.append(
                "%s subcategory counts total %d, expected %d"
                % (location, assigned, len(items))
            )
    return errors


def main():
    with open(NEWS_PATH, "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    errors = validate(payload)
    if errors:
        for error in errors:
            print("ERROR: %s" % error, file=sys.stderr)
        return 1
    print("Validated %s" % NEWS_PATH)
    return 0


if __name__ == "__main__":
    sys.exit(main())
