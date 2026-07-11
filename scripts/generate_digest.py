import datetime
import pathlib
import re
import sys
import textwrap

import feedparser

FEEDS = [
    'https://ai.googleblog.com/atom.xml',
    'https://openai.com/blog/rss.xml',
    'https://stability.ai/blog/rss.xml',
]

entries = []
for url in FEEDS:
    try:
        feed = feedparser.parse(url)
        entries.extend(feed.entries[:10])
    except Exception as exc:  # pragma: no cover - defensive logging
        print(f'ERR feed {url}: {exc}', file=sys.stderr)

entries.sort(
    key=lambda item: (
        item.get('published_parsed')
        or item.get('updated_parsed')
        or datetime.datetime.min.timetuple()
    ),
    reverse=True,
)

today = datetime.date.today().isoformat()
output_path = pathlib.Path('src/content/posts') / f'ai-digest-{today}.md'
output_path.parent.mkdir(parents=True, exist_ok=True)

lines = [
    '---',
    f'title: AI Digest {today}',
    f'date: {today}',
    'tags: [digest]',
    '---',
    '',
]

for entry in entries[:40]:
    title = (entry.get('title') or 'Untitled').strip()
    link = (entry.get('link') or '').strip()
    summary_text = re.sub('<[^<]+?>', '', (entry.get('summary') or '')).replace('\n', ' ')
    summary = textwrap.shorten(summary_text, width=260)
    lines.append(f'- [{title}]({link}) — {summary}')

output_path.write_text('\n'.join(lines), encoding='utf-8')
print(f'Wrote {output_path}')
