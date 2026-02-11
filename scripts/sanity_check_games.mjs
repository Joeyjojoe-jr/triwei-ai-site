import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];
const infos = [];

const manifestPath = path.join(root, 'games', 'manifest.json');

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

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    errors.push(`Unable to read file: ${filePath} (${err.message})`);
    return '';
  }
}

function parseJs(source, label) {
  try {
    // Parse-only check for syntax errors.
    // eslint-disable-next-line no-new-func
    new Function(source);
  } catch (err) {
    errors.push(`JavaScript parse failed in ${label}: ${err.message}`);
  }
}

function loadManifest() {
  if (!isFile(manifestPath)) {
    errors.push('Missing game manifest: games/manifest.json');
    return { games: [] };
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    errors.push(`Invalid JSON in games/manifest.json: ${err.message}`);
    return { games: [] };
  }

  if (!data || typeof data !== 'object' || !Array.isArray(data.games)) {
    errors.push('games/manifest.json must contain a top-level "games" array.');
    return { games: [] };
  }

  const seenSlug = new Set();
  const seenRoute = new Set();
  for (const item of data.games) {
    if (!item || typeof item !== 'object') {
      errors.push('Manifest entry is not an object.');
      continue;
    }
    const slug = String(item.slug || '').trim();
    const route = String(item.route || '').trim();
    const title = String(item.title || '').trim();
    if (!slug) errors.push('Manifest entry missing slug.');
    if (!title) errors.push(`Manifest entry missing title for slug "${slug || '<unknown>'}".`);
    if (!route) errors.push(`Manifest entry missing route for slug "${slug || '<unknown>'}".`);
    if (slug && seenSlug.has(slug)) errors.push(`Duplicate slug in manifest: ${slug}`);
    if (route && seenRoute.has(route)) errors.push(`Duplicate route in manifest: ${route}`);
    if (slug) seenSlug.add(slug);
    if (route) seenRoute.add(route);

    const expectedRoute = slug ? `/games/${slug}/` : '';
    if (slug && route && route !== expectedRoute) {
      errors.push(`Manifest route mismatch for slug "${slug}". Expected ${expectedRoute}, found ${route}`);
    }
  }

  infos.push(`Manifest games listed: ${data.games.length}`);
  return data;
}

function parseFrontMatterRoute(content, filePath) {
  const match = content.match(/^\s*---[\s\S]*?^\s*permalink:\s*(\/games\/[^\s]+)\s*$/m);
  if (!match) {
    errors.push(`Missing or invalid game permalink front matter in ${filePath}`);
    return null;
  }
  return match[1];
}

function resolveRoute(route, sourcePath) {
  if (!route) return;
  if (/^(https?:|mailto:|tel:|#)/.test(route)) return;

  if (route.startsWith('/')) {
    const cleaned = route.replace(/^\/+|\/+$/g, '');
    if (!cleaned) return;

    const abs = path.join(root, cleaned);
    if (isFile(abs)) return;
    if (isDir(abs)) {
      if (!isFile(path.join(abs, 'index.html')) && !isFile(path.join(abs, 'index.md'))) {
        errors.push(`Route has no index file: ${route} (referenced in ${sourcePath})`);
      }
      return;
    }

    // Allow collection index-style routes if a matching top-level markdown exists.
    const topMd = path.join(root, `${cleaned}.md`);
    if (!isFile(topMd)) {
      errors.push(`Unresolved route: ${route} (referenced in ${sourcePath})`);
    }
    return;
  }

  const resolved = path.resolve(path.dirname(sourcePath), route);
  if (!exists(resolved)) {
    errors.push(`Unresolved relative path: ${route} (referenced in ${sourcePath})`);
  }
}

function collectRoutesFromFile(content) {
  const routes = [];

  const liquidMatches = content.matchAll(/\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}/g);
  for (const m of liquidMatches) {
    routes.push(m[1]);
  }

  const hrefSrcMatches = content.matchAll(/(?:href|src)="([^"]+)"/g);
  for (const m of hrefSrcMatches) {
    const route = m[1];
    if (route.startsWith('{{')) continue;
    routes.push(route);
  }

  return routes;
}

function checkGameFoldersAndPages(manifest) {
  const expectedGameDirs = manifest.games.map((g) => g.slug).filter(Boolean);
  const expectedSet = new Set(expectedGameDirs);
  const gamesDir = path.join(root, 'games');
  if (!isDir(gamesDir)) {
    errors.push('Missing games directory.');
    return { gameDirs: [], gamePages: [] };
  }

  for (const dirName of expectedGameDirs) {
    const dirPath = path.join(gamesDir, dirName);
    if (!isDir(dirPath)) {
      errors.push(`Expected game folder missing: games/${dirName}`);
      continue;
    }
    const indexPath = path.join(dirPath, 'index.html');
    if (!isFile(indexPath)) {
      errors.push(`Expected game page missing: games/${dirName}/index.html`);
    }
  }

  const gameDirs = fs
    .readdirSync(gamesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const gamePages = gameDirs
    .map((d) => path.join(gamesDir, d, 'index.html'))
    .filter((p) => isFile(p));

  const discoveredSet = new Set(gameDirs);
  for (const expected of expectedSet) {
    if (!discoveredSet.has(expected)) {
      errors.push(`Manifest slug has no matching folder: games/${expected}`);
    }
  }
  for (const discovered of discoveredSet) {
    if (!expectedSet.has(discovered)) {
      warnings.push(`Game folder not listed in manifest: games/${discovered}`);
    }
  }

  if (!isFile(path.join(gamesDir, 'index.md'))) {
    errors.push('Missing games hub page: games/index.md');
  }

  return { gameDirs, gamePages };
}

function checkGamePageLoadAndPermalinks(gamePages) {
  for (const pagePath of gamePages) {
    const content = readText(pagePath);
    if (!content) continue;

    const folder = path.basename(path.dirname(pagePath));
    const permalink = parseFrontMatterRoute(content, pagePath);
    const expected = `/games/${folder}/`;
    if (permalink && permalink !== expected) {
      errors.push(`Permalink mismatch in ${pagePath}. Expected ${expected}, found ${permalink}`);
    }
  }
}

function checkScripts(gamePages) {
  let scriptJsCount = 0;
  let inlineScriptCount = 0;

  for (const pagePath of gamePages) {
    const gameDir = path.dirname(pagePath);
    const scriptJsPath = path.join(gameDir, 'script.js');
    if (isFile(scriptJsPath)) {
      scriptJsCount += 1;
      parseJs(readText(scriptJsPath), path.relative(root, scriptJsPath));
    }

    const content = readText(pagePath);
    if (!content) continue;
    const scripts = [...content.matchAll(/<script>\s*([\s\S]*?)\s*<\/script>/g)];
    if (scripts.length === 0) {
      warnings.push(`No inline script found in ${path.relative(root, pagePath)}.`);
      continue;
    }
    for (const [i, match] of scripts.entries()) {
      inlineScriptCount += 1;
      parseJs(match[1], `${path.relative(root, pagePath)} <script #${i + 1}>`);
    }
  }

  if (scriptJsCount === 0) {
    infos.push('No games/*/script.js files detected; validated inline scripts instead.');
  }
  infos.push(`Inline scripts parsed: ${inlineScriptCount}`);
}

function checkRelativePaths(gamePages) {
  const files = [path.join(root, 'games', 'index.md'), ...gamePages];
  for (const filePath of files) {
    if (!isFile(filePath)) {
      errors.push(`Missing file during path scan: ${filePath}`);
      continue;
    }
    const content = readText(filePath);
    const routes = collectRoutesFromFile(content);
    for (const route of routes) {
      resolveRoute(route, path.relative(root, filePath));
    }
  }
}

function run() {
  const manifest = loadManifest();
  const { gameDirs, gamePages } = checkGameFoldersAndPages(manifest);
  checkGamePageLoadAndPermalinks(gamePages);
  checkScripts(gamePages);
  checkRelativePaths(gamePages);

  console.log(`Games discovered: ${gameDirs.length}`);
  console.log(`Game pages checked: ${gamePages.length}`);
  for (const info of infos) console.log(`INFO: ${info}`);
  for (const warning of warnings) console.log(`WARN: ${warning}`);

  if (errors.length > 0) {
    console.error(`FAIL: ${errors.length} issue(s) found.`);
    for (const error of errors) console.error(`ERROR: ${error}`);
    process.exit(1);
  }

  console.log('PASS: sanity_check_games');
}

run();
