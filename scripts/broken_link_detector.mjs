import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];

const scanRoots = ['_includes', '_layouts', 'games'];
const singleFiles = ['index.md', 'about.md', 'experiments.md', 'guides.md', 'knowledge.md', 'blog.md', 'contact.md'];

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function collectFilesFromDir(dirPath) {
  const out = [];
  const stack = [dirPath];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(abs);
      } else if (/\.(html|md)$/i.test(entry.name)) {
        out.push(abs);
      }
    }
  }
  return out;
}

function normalizeRoute(route) {
  if (!route) return route;
  const trimmed = route.trim();
  if (trimmed === '/') return '/';
  return trimmed;
}

function routeHasPermalink(route, permalinkSet) {
  if (permalinkSet.has(route)) return true;
  if (!route.endsWith('/') && permalinkSet.has(`${route}/`)) return true;
  if (route.endsWith('/') && permalinkSet.has(route.slice(0, -1))) return true;
  return false;
}

function buildPermalinkSet(files) {
  const set = new Set(['/']);
  for (const filePath of files) {
    if (!/\.(html|md)$/i.test(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    const m = content.match(/^\s*permalink:\s*(\/[^\s]+)\s*$/m);
    if (!m) continue;
    const route = normalizeRoute(m[1]);
    set.add(route);
    if (!route.endsWith('/')) {
      set.add(`${route}/`);
    }
  }
  return set;
}

function resolveInternalRoute(route, sourceFile, permalinkSet) {
  if (!route) return;
  if (/^(https?:|mailto:|tel:|#)/.test(route)) return;

  const cleaned = normalizeRoute(route);
  if (!cleaned) return;
  if (cleaned === '/feed.xml' || cleaned === '/sitemap.xml') return;

  if (cleaned.startsWith('/')) {
    if (routeHasPermalink(cleaned, permalinkSet)) return;

    const rel = cleaned.replace(/^\/+|\/+$/g, '');
    if (!rel) return;
    const abs = path.join(root, rel);
    if (isFile(abs)) return;
    if (isDir(abs)) {
      if (isFile(path.join(abs, 'index.html')) || isFile(path.join(abs, 'index.md'))) return;
      errors.push(`Route directory has no index: ${cleaned} (from ${sourceFile})`);
      return;
    }
    errors.push(`Unresolved internal route: ${cleaned} (from ${sourceFile})`);
    return;
  }

  const sourceDir = path.dirname(sourceFile);
  const absRel = path.resolve(sourceDir, cleaned);
  if (!exists(absRel)) {
    errors.push(`Unresolved relative path: ${cleaned} (from ${sourceFile})`);
  }
}

function extractLinks(content) {
  const results = [];

  const liquid = content.matchAll(/\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}/g);
  for (const m of liquid) {
    results.push(m[1]);
  }

  const hrefSrc = content.matchAll(/(?:href|src)="([^"]+)"/g);
  for (const m of hrefSrc) {
    const value = m[1];
    if (value.startsWith('{{')) continue;
    results.push(value);
  }

  return results;
}

function run() {
  const files = [];
  for (const dir of scanRoots) {
    const abs = path.join(root, dir);
    if (!isDir(abs)) {
      warnings.push(`Scan root missing: ${dir}`);
      continue;
    }
    files.push(...collectFilesFromDir(abs));
  }

  for (const f of singleFiles) {
    const abs = path.join(root, f);
    if (isFile(abs)) {
      files.push(abs);
    }
  }

  const uniqueFiles = [...new Set(files)];
  const permalinkSet = buildPermalinkSet(uniqueFiles);

  let linkCount = 0;
  for (const absFile of uniqueFiles) {
    const relFile = path.relative(root, absFile);
    const content = fs.readFileSync(absFile, 'utf8');
    const links = extractLinks(content);
    linkCount += links.length;
    for (const link of links) {
      resolveInternalRoute(link, relFile, permalinkSet);
    }
  }

  console.log(`Scanned files: ${uniqueFiles.length}`);
  console.log(`Detected links: ${linkCount}`);
  console.log(`Known permalinks: ${permalinkSet.size}`);
  for (const warning of warnings) {
    console.log(`WARN: ${warning}`);
  }

  if (errors.length > 0) {
    console.error(`FAIL: broken_link_detector found ${errors.length} issue(s).`);
    for (const err of errors) {
      console.error(`ERROR: ${err}`);
    }
    process.exit(1);
  }

  console.log('PASS: broken_link_detector');
}

run();
