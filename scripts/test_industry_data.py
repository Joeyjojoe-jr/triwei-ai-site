import unittest

import build_industry_data
import validate_industry_data


class IndustryDataTests(unittest.TestCase):
    def test_stack_counts_company_layer_intersections(self):
        items = [
            {"title": "OpenAI rents cloud compute", "summary": "New model training deal"},
            {"title": "OpenAI faces copyright law", "summary": "Policy challenge"},
            {"title": "Nvidia launches AI chip", "summary": "GPU hardware"},
        ]
        stack = build_industry_data.build_stack(items)
        openai = next(row for row in stack["companies"] if row["name"] == "OpenAI")
        cells = {cell["key"]: cell["count"] for cell in openai["cells"]}
        self.assertEqual(2, openai["story_count"])
        self.assertEqual(1, cells["cloud"])
        self.assertEqual(1, cells["society"])

    def test_preserve_or_build_retains_last_good_section(self):
        previous = {"adoption": {"period": "example", "sectors": []}}

        def fail():
            raise RuntimeError("temporary")

        result = build_industry_data.preserve_or_build(previous, "adoption", fail)
        self.assertEqual("retained", result["status"])
        self.assertEqual("example", result["period"])

    def test_validator_accepts_minimal_complete_payload(self):
        payload = {
            "topic_lifecycle": {
                "series": [{"term": "AI", "points": [{"share": 25}]}]
            },
            "industry_stack": {
                "layers": [{"key": str(i)} for i in range(5)],
                "companies": [{"cells": [{} for _ in range(5)]}],
            },
            "model_frontier": {
                "status": "fresh",
                "models": [{"price": 1, "score": 50}],
            },
            "adoption": {
                "status": "fresh",
                "sectors": [{"current": 20, "expected": 25}],
            },
            "company_economics": {
                "status": "fresh",
                "companies": [{"funding": 10, "revenue": 5}],
            },
            "sources": {
                "coverage": {"label": "Coverage", "url": "/sources/"},
                "census": {"label": "Census", "url": "https://example.com/census"},
                "model": {"label": "Models", "url": "https://example.com/models"},
                "company": {"label": "Companies", "url": "https://example.com/companies"},
            },
        }
        self.assertEqual([], validate_industry_data.validate(payload))


if __name__ == "__main__":
    unittest.main()
