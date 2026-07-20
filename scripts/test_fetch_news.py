import re
import unittest
from unittest import mock

import fetch_news


class StoryRelevanceTests(unittest.TestCase):
    def test_rejects_unrelated_personnel_story_from_research(self):
        self.assertFalse(fetch_news.is_story_relevant(
            "research",
            "Benchmark Mortgage Names Traci Bell Chief Human Resources Officer",
            "Benchmark Mortgage announces a new member of its executive team.",
            "https://news.google.com/rss/search?q=AI+research",
        ))

    def test_rejects_ai_business_story_without_research_signal(self):
        self.assertFalse(fetch_news.is_story_relevant(
            "research",
            "AI startup appoints a new chief human resources officer",
            "The generative AI company expanded its executive team.",
        ))

    def test_dot_ai_domain_is_not_ai_evidence(self):
        self.assertFalse(fetch_news.is_story_relevant(
            "research",
            "ScamInfo.ai Research Finds 38% of Domains Carry High Risk Ratings",
            "The cybersecurity company published its findings.",
        ))

    def test_accepts_ai_research_story(self):
        self.assertTrue(fetch_news.is_story_relevant(
            "research",
            "Perplexity open sources WANDR benchmark for AI agents",
            "The evaluation measures how well agentic systems perform research tasks.",
        ))

    def test_accepts_arxiv_category_feed(self):
        self.assertTrue(fetch_news.is_story_relevant(
            "research",
            "A Novel Method for Structured Prediction",
            "We present experimental results.",
            "http://export.arxiv.org/rss/cs.LG",
        ))

    def test_rejects_non_ai_story_from_other_categories(self):
        self.assertFalse(fetch_news.is_story_relevant(
            "business",
            "Mortgage lender names new executive",
            "The company announced the appointment Tuesday.",
        ))


class SubcategoryTests(unittest.TestCase):
    def make_item(self, category, title, trend_score=0, ethics_tags=None):
        return {
            "title": title,
            "link": "https://example.com/story",
            "source": "Example",
            "category": category,
            "published_iso": "2026-07-15T00:00:00Z",
            "summary": "",
            "ethics_tags": ethics_tags or [],
            "trend_score": trend_score,
        }

    def test_each_category_has_five_unique_subcategories(self):
        for category in fetch_news.CATEGORY_ORDER:
            rules = fetch_news.SUBCATEGORY_RULES[category]
            self.assertEqual(5, len(rules))
            self.assertEqual(5, len({rule[0] for rule in rules}))
            self.assertEqual([], rules[-1][2])

    def test_research_evaluation_has_priority_over_broad_model_terms(self):
        item = self.make_item(
            "research", "A transformer benchmark for language model evaluation")
        self.assertEqual(
            "evaluation", fetch_news.classify_subcategory("research", item))

    def test_ethics_story_can_be_classified_from_ethics_tags(self):
        item = self.make_item(
            "ethics", "New report", ethics_tags=["Privacy & Surveillance"])
        self.assertEqual(
            "privacy", fetch_news.classify_subcategory("ethics", item))

    def test_unmatched_story_uses_stable_catch_all(self):
        item = self.make_item("business", "Quarterly AI market outlook")
        self.assertEqual(
            "markets", fetch_news.classify_subcategory("business", item))

    def test_display_subcategories_assigns_every_story_once_and_ranks_previews(self):
        items = [
            self.make_item("labs", "New AI model release", trend_score=2),
            self.make_item("labs", "Another AI model release", trend_score=9),
            self.make_item("labs", "AI chip announced", trend_score=4),
            self.make_item("labs", "General lab update", trend_score=1),
        ]
        groups = fetch_news.display_subcategories("labs", items)
        self.assertEqual(3, len(groups))
        self.assertEqual(len(items), sum(group["count"] for group in groups))
        self.assertNotIn(0, [group["count"] for group in groups])
        models = next(group for group in groups if group["key"] == "models")
        self.assertEqual("Another AI model release", models["folder_items"][0]["title"])

    def test_null_feed_fields_do_not_crash_classification_or_display(self):
        item = self.make_item("labs", None, ethics_tags=None)
        item.update({"summary": None, "source": None, "published_iso": None})
        self.assertEqual("frontier", fetch_news.classify_subcategory("labs", item))
        groups = fetch_news.display_subcategories("labs", [item])
        self.assertEqual(1, len(groups))
        self.assertEqual("", groups[0]["folder_items"][0]["title"])

    def test_null_and_malformed_trend_scores_rank_as_zero(self):
        first = self.make_item("labs", "AI model alpha", trend_score=None)
        second = self.make_item("labs", "AI model beta", trend_score="not-a-number")
        groups = fetch_news.display_subcategories("labs", [first, second])
        self.assertEqual(2, groups[0]["count"])
        self.assertEqual(0, groups[0]["folder_items"][0]["trend_score"])

    def test_subcategory_terms_respect_word_boundaries(self):
        self.assertFalse(fetch_news.matches_subcategory_term("Apple launches", "app"))
        self.assertTrue(fetch_news.matches_subcategory_term("models released", "model*"))

    def test_external_urls_are_restricted_to_absolute_http_or_https(self):
        self.assertEqual(
            "https://example.com/story",
            fetch_news.safe_external_url("https://example.com/story"),
        )
        self.assertEqual("", fetch_news.safe_external_url("javascript:alert(1)"))
        self.assertEqual("", fetch_news.safe_external_url("data:text/html,bad"))
        self.assertEqual("", fetch_news.safe_external_url("//example.com/story"))
        self.assertEqual("", fetch_news.safe_external_url(None))

    def test_trend_scores_match_complete_terms_only(self):
        items = [{"title": "Chip design", "summary": "Shipping update"}]
        fetch_news.annotate_trend_scores(items, [
            {"term": "chip", "count": 7},
            {"term": "shipping", "count": 3},
            {"term": "hip", "count": 20},
        ])
        self.assertEqual(10, items[0]["trend_score"])

    def test_trend_terms_match_simple_plurals_but_not_substrings(self):
        self.assertIsNotNone(re.search(
            fetch_news.trend_term_pattern("chip"), "AI chips", re.IGNORECASE))
        self.assertIsNone(re.search(
            fetch_news.trend_term_pattern("chip"), "shipping", re.IGNORECASE))


class StoryDeduplicationTests(unittest.TestCase):
    def story(self, title, link=""):
        return {"title": title, "link": link}

    def test_same_url_ignores_tracking_parameters(self):
        self.assertTrue(fetch_news.is_same_story(
            self.story("A first headline", "https://example.com/story?utm_source=feed"),
            self.story("A rewritten headline", "https://www.example.com/story"),
        ))

    def test_rejects_syndicated_headline_rewrite(self):
        self.assertTrue(fetch_news.is_same_story(
            self.story("OpenAI launches its new GPT-5 AI model today"),
            self.story("OpenAI unveils GPT-5 AI model"),
        ))

    def test_rejects_punctuation_only_headline_change(self):
        self.assertTrue(fetch_news.is_same_story(
            self.story("Nvidia, Microsoft announce major AI partnership"),
            self.story("Nvidia and Microsoft announce a major AI partnership"),
        ))

    def test_rejects_same_facts_with_light_rewrite(self):
        self.assertTrue(fetch_news.is_same_story(
            self.story("OpenAI's first hardware device is a screenless speaker that can move"),
            self.story("OpenAI first device will be a movable, screenless speaker built as an AI companion"),
        ))

    def test_rejects_source_boilerplate_appended_to_headline(self):
        self.assertTrue(fetch_news.is_same_story(
            self.story("TYLSemi raises $43 million to create building blocks of custom AI chips"),
            self.story("TYLSemi raises $43 million to create building blocks of custom AI chips - Euronext Markets: Real-time Stock Market Data"),
        ))

    def test_allows_different_take_on_same_event(self):
        self.assertFalse(fetch_news.is_same_story(
            self.story("OpenAI launches GPT-5 AI model"),
            self.story("GPT-5 launch renews safety and copyright concerns"),
        ))

    def test_angle_marker_wins_even_when_rest_of_headline_is_nearly_identical(self):
        self.assertFalse(fetch_news.is_same_story(
            self.story("OpenAI launches GPT-5 AI model for enterprise developers worldwide"),
            self.story("OpenAI launches GPT-5 AI model for enterprise developers amid safety concerns worldwide"),
        ))

    def test_allows_distinct_business_take_on_same_event(self):
        self.assertFalse(fetch_news.is_same_story(
            self.story("Anthropic launches Claude 5"),
            self.story("Claude 5 could reshape Anthropic's enterprise pricing"),
        ))

    def test_collect_deduplicates_globally_but_keeps_distinct_angle(self):
        feeds = {
            "labs": [("rss", "labs-feed")],
            "business": [("rss", "business-feed")],
        }
        rows = {
            b"labs-feed": [{
                "title": "OpenAI launches its new GPT-5 AI model today",
                "link": "https://labs.example/gpt5",
                "desc": "An artificial intelligence model launch.",
                "date": "2026-07-19T12:00:00Z",
            }],
            b"business-feed": [
                {
                    "title": "OpenAI unveils GPT-5 AI model",
                    "link": "https://business.example/gpt5-wire-copy",
                    "desc": "An artificial intelligence model launch.",
                    "date": "2026-07-19T12:05:00Z",
                },
                {
                    "title": "GPT-5 launch renews safety and copyright concerns",
                    "link": "https://business.example/gpt5-analysis",
                    "desc": "The AI model raises artificial intelligence safety questions.",
                    "date": "2026-07-19T12:10:00Z",
                },
            ],
        }
        with mock.patch.object(fetch_news, "FEEDS", feeds), \
                mock.patch.object(fetch_news, "fetch", side_effect=lambda url: url.encode()), \
                mock.patch.object(fetch_news, "parse_rss", side_effect=lambda raw: rows[raw]), \
                mock.patch.object(fetch_news.time, "sleep"):
            categories, all_items = fetch_news.collect()

        self.assertEqual(len(all_items), 2)
        self.assertEqual(len(categories["labs"]["items"]), 1)
        self.assertEqual(len(categories["business"]["items"]), 1)
        self.assertEqual(categories["labs"]["successful_feeds"], 1)
        self.assertEqual(categories["business"]["successful_feeds"], 1)
        self.assertIn("safety", categories["business"]["items"][0]["title"])

    def test_preserves_full_headline_text(self):
        headline = "A" * 220
        self.assertEqual(fetch_news.clean_text(headline, None), headline)


class FeedOutageFallbackTests(unittest.TestCase):
    def cached_item(self, category, title, link):
        return {
            "title": title,
            "link": link,
            "source": "Previous source",
            "category": category,
            "published_iso": "2026-07-20T12:00:00Z",
            "summary": "A previously fetched AI story.",
            "ethics_tags": ["Safety & Alignment"],
            "trend_score": 4,
        }

    def test_empty_or_unparseable_feed_is_not_counted_as_successful(self):
        with mock.patch.object(fetch_news, "FEEDS", {
                "business": [("rss", "empty-feed")]}), \
                mock.patch.object(fetch_news, "fetch", return_value=b"not rss"), \
                mock.patch.object(fetch_news, "parse_rss", return_value=[]), \
                mock.patch.object(fetch_news.time, "sleep"):
            categories, all_items = fetch_news.collect()

        self.assertEqual(categories["business"]["successful_feeds"], 0)
        self.assertEqual(categories["business"]["items"], [])
        self.assertEqual(all_items, [])

    def test_restores_last_good_items_only_when_every_category_feed_failed(self):
        categories = {
            category: {
                "label": fetch_news.CATEGORY_LABELS[category],
                "items": [],
                "successful_feeds": 1,
            }
            for category in fetch_news.CATEGORY_ORDER
        }
        categories["business"]["successful_feeds"] = 0
        previous = {"categories": {
            "business": {"items": [self.cached_item(
                "business", "AI startup raises new funding", "https://example.com/funding")]},
            "ethics": {"items": [self.cached_item(
                "ethics", "AI safety policy advances", "https://example.com/policy")]},
        }}
        all_items = []

        restored = fetch_news.restore_failed_categories(
            categories, all_items, previous)

        self.assertEqual(restored, 1)
        self.assertEqual(len(categories["business"]["items"]), 1)
        self.assertEqual(categories["business"]["items"][0]["category"], "business")
        self.assertEqual(categories["ethics"]["items"], [])
        self.assertEqual(len(all_items), 1)

    def test_cached_story_does_not_duplicate_a_link_in_global_metrics(self):
        existing = self.cached_item(
            "labs", "AI startup raises new funding", "https://example.com/funding")
        existing.update({"epoch": 1})
        categories = {
            category: {
                "label": fetch_news.CATEGORY_LABELS[category],
                "items": [],
                "successful_feeds": 1,
            }
            for category in fetch_news.CATEGORY_ORDER
        }
        categories["business"]["successful_feeds"] = 0
        previous = {"categories": {"business": {"items": [self.cached_item(
            "business", "AI startup raises new funding", "https://example.com/funding")]}}}
        all_items = [existing]

        restored = fetch_news.restore_failed_categories(
            categories, all_items, previous)

        self.assertEqual(restored, 1)
        self.assertEqual(len(categories["business"]["items"]), 1)
        self.assertEqual(len(all_items), 1)


class AiPulseTests(unittest.TestCase):
    def item(self, title, link, source, category, ethics_tags=None, score=1, epoch=1):
        return {
            "title": title,
            "link": link,
            "source": source,
            "category": category,
            "published_iso": "2026-07-20T00:00:00Z",
            "epoch": epoch,
            "summary": "",
            "ethics_tags": ethics_tags or [],
            "trend_score": score,
        }

    def test_source_identity_uses_domain_for_generic_web_source(self):
        item = self.item(
            "Agent project", "https://www.example.com/story", "Web", "community")
        self.assertEqual("example.com", fetch_news.source_identity(item))

    def test_pulse_counts_and_coverage_links_are_truthful_and_unique(self):
        items = [
            self.item("OpenAI agent launch", "https://a.example/1", "A", "labs",
                      ["Safety & Alignment"], 9, 5),
            self.item("OpenAI agent pricing", "https://b.example/2", "B", "business",
                      [], 8, 4),
            self.item("OpenAI privacy response", "https://c.example/3", "C", "ethics",
                      ["Privacy & Surveillance"], 7, 3),
            self.item("Claude agent benchmark", "https://d.example/4", "D", "research",
                      [], 6, 2),
            self.item("Local agent tool", "https://e.example/5", "Web", "community",
                      [], 5, 1),
        ]
        trending = [
            {"term": "agent", "count": 4},
            {"term": "OpenAI", "count": 3},
            {"term": "privacy", "count": 2},
        ]

        pulse = fetch_news.compute_ai_pulse(items, trending)

        self.assertEqual(5, pulse["story_count"])
        self.assertEqual(5, pulse["source_count"])
        self.assertEqual(2, pulse["ethics_count"])
        links = [story["link"] for card in pulse["coverage"]
                 for story in card["stories"]]
        self.assertEqual(len(links), len(set(links)))
        self.assertTrue(all(2 <= len(card["stories"]) <= 3
                            for card in pulse["coverage"]))


if __name__ == "__main__":
    unittest.main()
