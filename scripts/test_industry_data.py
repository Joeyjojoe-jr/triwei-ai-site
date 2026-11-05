import datetime as dt
import unittest
from unittest import mock

import build_industry_data
import validate_industry_data


class IndustryDataTests(unittest.TestCase):
    def test_current_model_prices_are_source_dated_and_scheduled_changes_apply(self):
        july = build_industry_data.build_model_value(
            dt.datetime(2026, 7, 20, tzinfo=dt.timezone.utc)
        )
        sonnet = next(row for row in july["models"] if row["name"] == "Claude Sonnet 5")
        self.assertEqual(2.0, sonnet["input_price"])
        self.assertEqual("current", july["freshness"])

        september = build_industry_data.build_model_value(
            dt.datetime(2026, 9, 2, tzinfo=dt.timezone.utc)
        )
        sonnet = next(row for row in september["models"] if row["name"] == "Claude Sonnet 5")
        self.assertEqual(3.0, sonnet["input_price"])
        self.assertEqual(15.0, sonnet["output_price"])
        self.assertEqual("expired", september["freshness"])

    def test_supply_chain_exposes_parallel_memory_and_destination_routes(self):
        chain = build_industry_data.build_supply_chain(
            dt.datetime(2026, 7, 20, tzinfo=dt.timezone.utc)
        )
        self.assertEqual(8, len(chain["stages"]))
        memory = next(row for row in chain["stages"] if row["key"] == "memory")
        self.assertEqual("parallel", memory["lane"])
        self.assertAlmostEqual(100.0, sum(row["share"] for row in chain["destinations"]))

    def test_diffusion_watch_requires_a_tracked_lab_and_core_signal(self):
        match = build_industry_data.diffusion_story({
            "title": "Moonshot announces open-weight Kimi model",
            "summary": "The model targets frontier coding benchmarks.",
        })
        self.assertEqual(["Moonshot / Kimi"], match["labs"])
        self.assertIn("Open weights", match["signals"])
        self.assertIsNone(build_industry_data.diffusion_story({
            "title": "Kimi adds a spreadsheet feature",
            "summary": "A routine product update.",
        }))
        self.assertIsNone(build_industry_data.diffusion_story({
            "title": "Open-weight model released",
            "summary": "No tracked lab is named.",
        }))

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
        previous = {"adoption": {"period": "example", "sectors": [{"current": 20, "expected": 25}]}}

        def fail():
            raise RuntimeError("temporary")

        result = build_industry_data.preserve_or_build(previous, "adoption", fail)
        self.assertEqual("retained", result["status"])
        self.assertEqual("example", result["period"])

    def test_empty_census_period_fails_before_publication(self):
        # The newest workbook column can exist before its sector estimates.
        rows = [
            {"F": "202611"},
            {"A": "51", "B": "7", "E": "Yes", "F": "26.1"},
            {"A": "51", "B": "24", "E": "Yes", "F": "S"},
        ]
        with (
            mock.patch.object(build_industry_data, "fetch_bytes", return_value=b"fake"),
            mock.patch.object(build_industry_data, "xlsx_rows", return_value=rows),
        ):
            with self.assertRaisesRegex(ValueError, "no complete adoption-sector"):
                build_industry_data.build_adoption()

    def test_empty_census_period_retains_previously_valid_data(self):
        previous = {
            "adoption": {
                "period": "Reference period ending Oct 4, 2026",
                "sectors": [{"current": 46.4, "expected": 51.1}],
                "status": "fresh",
            }
        }
        rows = [
            {"F": "202611"},
            {"A": "51", "B": "7", "E": "Yes", "F": "26.1"},
        ]
        with (
            mock.patch.object(build_industry_data, "fetch_bytes", return_value=b"fake"),
            mock.patch.object(build_industry_data, "xlsx_rows", return_value=rows),
        ):
            result = build_industry_data.preserve_or_build(
                previous, "adoption", build_industry_data.build_adoption
            )
        self.assertEqual("retained", result["status"])
        self.assertEqual(previous["adoption"]["period"], result["period"])
        self.assertEqual(previous["adoption"]["sectors"], result["sectors"])
        self.assertEqual("fresh", previous["adoption"]["status"])

    def test_empty_adoption_cache_is_not_treated_as_valid(self):
        previous = {"adoption": {"period": "empty", "sectors": []}}

        def fail():
            raise RuntimeError("temporary")

        result = build_industry_data.preserve_or_build(previous, "adoption", fail)
        self.assertEqual("unavailable", result["status"])

    def test_validator_accepts_minimal_complete_payload(self):
        payload = {
            "diffusion_watch": {
                "coverage": {"story_count": 1, "daily": []},
                "evidence_classes": [{"key": "disclosed"}],
                "milestones": [{
                    "date": "2026-01-01",
                    "headline": "Example",
                    "evidence_class": "disclosed",
                    "source_url": "https://example.com/source",
                }],
            },
            "topic_lifecycle": {
                "series": [{"term": "AI", "points": [{"share": 25}]}]
            },
            "industry_stack": {
                "layers": [{"key": str(i)} for i in range(5)],
                "companies": [{"cells": [{} for _ in range(5)]}],
            },
            "supply_chain": {
                "stages": [{
                    "label": "Stage",
                    "hubs": ["Somewhere"],
                    "choke": "Constraint",
                    "choke_level": "high",
                    "sources": [{"label": "Source", "url": "https://example.com/source"}],
                } for _ in range(8)],
                "destinations": [{"share": 100}],
            },
            "model_value": {
                "freshness": "current",
                "models": [{
                    "input_price": 1,
                    "output_price": 2,
                    "blended_price": 1.25,
                    "source_url": "https://example.com/pricing",
                }],
            },
            "model_history": {
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
                "model_history": {"label": "Model history", "url": "https://example.com/history"},
                "company": {"label": "Companies", "url": "https://example.com/companies"},
                "diffusion": {"label": "Diffusion", "url": "/sources/"},
                "supply_chain": {"label": "Supply chain", "url": "/sources/"},
            },
        }
        self.assertEqual([], validate_industry_data.validate(payload))


if __name__ == "__main__":
    unittest.main()
