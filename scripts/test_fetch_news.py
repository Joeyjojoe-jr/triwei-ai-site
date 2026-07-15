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


if __name__ == "__main__":
    unittest.main()
