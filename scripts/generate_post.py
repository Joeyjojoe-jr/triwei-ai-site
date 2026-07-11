#!/usr/bin/env python3

"""
This script creates a new Markdown blog post with YAML front matter.  Each
run selects a topic from a predefined list and writes a file into the
``posts`` directory.  You can customise the topics list or extend the logic
to call external APIs for real news and research.

Usage:
    python scripts/generate_post.py
"""

import datetime
import os
import pathlib
import random
import re
import textwrap
import yaml


# A list of themes to inspire weekly articles.  Feel free to modify or
# extend this list with subjects that interest you.  The script will
# randomly select one of these themes each time it runs.
TOPICS = [
    "latest AI news",
    "exciting AI tools",
    "ethical AI considerations",
    "AI research breakthroughs",
    "AI in everyday life",
]


def slugify(value: str) -> str:
    """Convert a string into a slug suitable for filenames and URLs."""
    value = value.lower()
    # Replace non alphanumeric characters with hyphens
    value = re.sub(r'[^a-z0-9]+', '-', value).strip('-')
    return value


def main() -> None:
    # Ensure the posts directory exists
    posts_dir = pathlib.Path(__file__).resolve().parent.parent / "_posts"
    posts_dir.mkdir(parents=True, exist_ok=True)

    # Pick a topic at random
    topic = random.choice(TOPICS)
    today = datetime.date.today()

    # Create title using the date and the capitalised topic
    title = f"{today.strftime('%B %d, %Y')}: {topic.title()}"

    # Build YAML front matter
    front_matter = {
        "title": title,
        "date": today.isoformat(),
        "author": "AI Bot",
    }

    # Compose the body of the post.  Replace these paragraphs with your
    # own content or integrate calls to language models to generate
    # detailed articles.
    body = textwrap.dedent(
        f"""
        ## {topic.title()}

        This article discusses recent developments and tools in the world of artificial intelligence.  It serves as a placeholder example.  In the future, you can replace this with content generated from research APIs or your own AI pipeline.

        ## Summary

        This week's highlights include ... (add summary here).

        ## Resources

        - [Example AI article](https://example.com)
        - [Another resource](https://example.com)
        """
    ).strip()

    # Create filename slug
    slug = f"{slugify(topic)}-{today.strftime('%Y%m%d')}"
    filename = posts_dir / f"{slug}.md"

    # Write the file
    with open(filename, "w", encoding="utf-8") as f:
        f.write("---\n")
        yaml.dump(front_matter, f, sort_keys=False)
        f.write("---\n\n")
        f.write(body)

    print(f"Generated post: {filename}")


if __name__ == "__main__":
    main()
