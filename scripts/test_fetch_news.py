import unittest

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


if __name__ == "__main__":
    unittest.main()
