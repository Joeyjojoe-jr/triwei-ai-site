#!/usr/bin/env python3

"""
This script builds a static HTML site from Markdown posts contained in
the ``posts`` directory.  It reads YAML front matter from each post
(title, date, author), converts the Markdown content into rudimentary
HTML, and writes pages into the ``docs`` directory.  The index page
lists all posts in reverse chronological order.

Run this script every time you add or update posts to regenerate
the HTML output.
"""

import datetime
import pathlib
import re
import yaml
import shutil


def parse_front_matter(markdown_text: str):
    """
    Parse YAML front matter from a Markdown file.  Returns a tuple
    (metadata: dict, body: str).  If no front matter is found, metadata
    is an empty dict.
    """
    lines = markdown_text.split('\n')
    if lines and lines[0].strip() == "---":
        # Find the closing '---'
        end_index = None
        for i in range(1, len(lines)):
            if lines[i].strip() == "---":
                end_index = i
                break
        if end_index is not None:
            fm_lines = lines[1:end_index]
            metadata = yaml.safe_load("\n".join(fm_lines)) or {}
            body = "\n".join(lines[end_index + 1:])
            return metadata, body
    # No front matter
    return {}, markdown_text


def markdown_to_html(text: str) -> str:
    """
    Very simple Markdown to HTML converter.  Supports headings (levels
    1–3) and paragraphs.  This implementation avoids external
    dependencies and should be replaced with a full Markdown library
    (e.g., markdown2 or markdown) if needed.
    """
    html_lines = []
    for line in text.split('\n'):
        stripped = line.strip()
        if not stripped:
            continue
        # Headings
        if stripped.startswith('### '):
            html_lines.append(f"<h3>{stripped[4:]}</h3>")
        elif stripped.startswith('## '):
            html_lines.append(f"<h2>{stripped[3:]}</h2>")
        elif stripped.startswith('# '):
            html_lines.append(f"<h1>{stripped[2:]}</h1>")
        else:
            # Paragraph
            html_lines.append(f"<p>{stripped}</p>")
    return "\n".join(html_lines)


def build_site():
    root = pathlib.Path(__file__).resolve().parent.parent
    posts_dir = root / "posts"
    docs_dir = root / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)

    # Write a basic stylesheet.  The body uses a background image (logo.png) if
    # the file exists.  To change the logo, place your image in the root of
    # the repository as ``logo.png``.  The build script will copy it into
    # the ``docs`` folder automatically.
    css = """
    body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background: #f7f7f7;
        color: #333;
    }
    /* Apply a logo as a background if present */
    body.logo-background {
        background-image: url('logo.png');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
    }
    header {
        background: #333;
        color: #fff;
        padding: 1rem;
        text-align: center;
    }
    .container {
        max-width: 800px;
        margin: 1rem auto;
        padding: 1rem;
        background: #fff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1, h2, h3 {
        margin-top: 0;
    }
    footer {
        text-align: center;
        margin: 2rem 0;
        font-size: 0.8rem;
        color: #777;
    }
    ul {
        list-style: none;
        padding-left: 0;
    }
    li {
        margin-bottom: 0.5rem;
    }
    a {
        color: #007acc;
        text-decoration: none;
    }
    a:hover {
        text-decoration: underline;
    }
    """
    (docs_dir / "style.css").write_text(css.strip(), encoding="utf-8")

    # Copy logo into docs if present.  A user should place ``logo.png`` at the
    # repository root.  If the file exists, copy it so the site can reference
    # it; otherwise, skip this step.  The HTML template will apply the
    # ``logo-background`` class only when the file exists.
    logo_src = root / "logo.png"
    if logo_src.exists():
        shutil.copy(logo_src, docs_dir / "logo.png")

    # Collect posts for index page
    posts_info = []
    for md_file in sorted(posts_dir.glob("*.md")):
        text = md_file.read_text(encoding="utf-8")
        meta, body = parse_front_matter(text)
        title = meta.get("title", md_file.stem)
        date_str = meta.get("date", "")
        slug = md_file.stem
        posts_info.append((date_str, title, slug, body))

    # Sort posts by date descending
    posts_info.sort(key=lambda x: x[0], reverse=True)

    # Determine if a logo is available.  If the repository contains
    # ``logo.png`` at the root, we add a CSS class to apply the
    # background image to the body element.  Otherwise, no class is used.
    logo_exists = (root / "logo.png").exists()

    # Build individual post pages
    for date_str, title, slug, body in posts_info:
        post_html = markdown_to_html(body)
        post_dir = docs_dir / slug
        post_dir.mkdir(parents=True, exist_ok=True)
        with open(post_dir / "index.html", "w", encoding="utf-8") as f:
            body_class = "logo-background" if logo_exists else ""
            f.write(f"""<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{title}</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body class="{body_class}">
    <header>
        <h1>{title}</h1>
    </header>
    <div class="container">
        <article>
        {post_html}
        </article>
        <p><a href="/">Back to home</a></p>
    </div>
    <footer>&copy; {datetime.date.today().year} TriWei AI Blog</footer>
</body>
</html>
""")

    # Build index page
    list_items = "".join([
        f'<li><a href="{slug}/">{title}</a> — <time>{date}</time></li>'
        for date, title, slug, _ in posts_info
    ])
    with open(docs_dir / "index.html", "w", encoding="utf-8") as f:
        body_class = "logo-background" if logo_exists else ""
        f.write(f"""<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TriWei AI Blog</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="{body_class}">
    <header>
        <h1>TriWei AI Blog</h1>
    </header>
    <div class="container">
        <h2>Latest Posts</h2>
        <ul>
            {list_items}
        </ul>
    </div>
    <footer>&copy; {datetime.date.today().year} TriWei AI Blog</footer>
</body>
</html>
""")


if __name__ == "__main__":
    build_site()
