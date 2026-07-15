import copy
import unittest

import validate_news_data


class NewsDataValidationTests(unittest.TestCase):
    def payload(self):
        item = {
            "title": "Example",
            "link": "https://example.com/story",
            "source": "Example",
            "category": "labs",
            "summary": "Summary",
            "ethics_tags": [],
            "trend_score": 1,
        }
        return {
            "category_order": ["labs"],
            "categories": {
                "labs": {
                    "items": [copy.deepcopy(item)],
                    "subcategories": [{
                        "key": "models",
                        "label": "Models",
                        "count": 1,
                        "folder_items": [copy.deepcopy(item)],
                    }],
                }
            },
        }

    def test_accepts_valid_payload(self):
        self.assertEqual([], validate_news_data.validate(self.payload()))

    def test_rejects_non_http_link(self):
        payload = self.payload()
        payload["categories"]["labs"]["items"][0]["link"] = "javascript:alert(1)"
        self.assertTrue(any("HTTP(S)" in error for error in validate_news_data.validate(payload)))

    def test_rejects_null_required_field(self):
        payload = self.payload()
        payload["categories"]["labs"]["items"][0]["trend_score"] = None
        errors = validate_news_data.validate(payload)
        self.assertTrue(any("missing or null" in error for error in errors))

    def test_rejects_empty_subcategory(self):
        payload = self.payload()
        subcategory = payload["categories"]["labs"]["subcategories"][0]
        subcategory["count"] = 0
        subcategory["folder_items"] = []
        self.assertTrue(any("positive integer" in error for error in validate_news_data.validate(payload)))

    def test_accepts_empty_subcategories_when_category_has_no_items(self):
        payload = self.payload()
        payload["categories"]["labs"]["items"] = []
        payload["categories"]["labs"]["subcategories"] = []
        self.assertEqual([], validate_news_data.validate(payload))

    def test_rejects_non_object_subcategory(self):
        payload = self.payload()
        payload["categories"]["labs"]["subcategories"] = [None]
        errors = validate_news_data.validate(payload)
        self.assertTrue(any("must be an object" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
