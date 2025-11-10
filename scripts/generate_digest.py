import feedparser, datetime, pathlib, textwrap, sys
FEEDS = [
  'https://ai.googleblog.com/atom.xml',
  'https://openai.com/blog/rss.xml',
  'https://stability.ai/blog/rss.xml'
]
entries = []
for url in FEEDS:
    try:
        d = feedparser.parse(url)
        entries += d.entries[:10]
    except Exception as e:
        print(f'ERR feed {url}: {e}', file=sys.stderr)
entries.sort(key=lambda x: x.get('published_parsed') or x.get('updated_parsed') or datetime.datetime.min.timetuple(), reverse=True)
date = datetime.date.today().isoformat()
out = pathlib.Path('src/content/posts')/f'ai-digest-{date}.md'
out.parent.mkdir(parents=True, exist_ok=True)
lines = ['---', f'title: AI Digest {date}', f'date: {date}', 'tags: [digest]', '---', '']
for e in entries[:40]:
    title = (e.get('title') or 'Untitled').strip()
    link  = (e.get('link') or '').strip()
    summary = textwrap.shorten((e.get('summary') or '').replace('\n',' '), width=260)
    lines.append(f'- [{title}]({link}) — {summary}')
out.write_text('\n'.join(lines), encoding='utf-8')
print(f'Wrote {out}')