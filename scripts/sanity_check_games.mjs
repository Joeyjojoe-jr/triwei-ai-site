import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];
const infos = [];

const manifestPath = path.join(root, 'games', 'manifest.json');
const cardOverridesPath = path.join(root, 'games', 'card_overrides.json');
const dataManifestPath = path.join(root, '_data', 'games_manifest.json');
const dataOverridesPath = path.join(root, '_data', 'games_card_overrides.json');

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

function normalizeSlug(raw) {
  return String(raw || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '');
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
    const slug = normalizeSlug(item.slug);
    const route = String(item.route || '').trim();
    const title = String(item.title || '').trim();
    const added = String(item.added || '').trim();
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

    if (added && !/^\d{4}-\d{2}-\d{2}$/.test(added)) {
      errors.push(`Invalid "added" date in manifest for slug "${slug}". Expected YYYY-MM-DD.`);
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
    if (route.includes('${')) continue;
    routes.push(route);
  }

  return routes;
}

function checkGameFoldersAndPages(manifest) {
  const expectedGameDirs = manifest.games.map((g) => normalizeSlug(g.slug)).filter(Boolean);
  const expectedSet = new Set(expectedGameDirs);
  const gamesDir = path.join(root, 'games');
  if (!isDir(gamesDir)) {
    errors.push('Missing games directory.');
    return { gameDirs: [], gamePages: [] };
  }

  for (const dirName of expectedGameDirs) {
    const dirPath = path.join(gamesDir, ...dirName.split('/'));
    if (!isDir(dirPath)) {
      errors.push(`Expected game folder missing: games/${dirName}`);
      continue;
    }
    const indexPath = path.join(dirPath, 'index.html');
    if (!isFile(indexPath)) {
      errors.push(`Expected game page missing: games/${dirName}/index.html`);
    }
  }

  const gamePages = [];
  function collectGamePages(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const subdir = path.join(dirPath, entry.name);
      const indexPath = path.join(subdir, 'index.html');
      if (isFile(indexPath)) {
        gamePages.push(indexPath);
      }
      collectGamePages(subdir);
    }
  }
  collectGamePages(gamesDir);
  gamePages.sort();

  const gameDirs = gamePages.map((p) =>
    path.relative(gamesDir, path.dirname(p)).replace(/\\/g, '/')
  );
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
  const gamesDir = path.join(root, 'games');
  for (const pagePath of gamePages) {
    const content = readText(pagePath);
    if (!content) continue;

    const relFolder = path.relative(gamesDir, path.dirname(pagePath)).replace(/\\/g, '/');
    const permalink = parseFrontMatterRoute(content, pagePath);
    const expected = `/games/${relFolder}/`;
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

function checkGamesHubManifestRendering() {
  const hubPath = path.join(root, 'games', 'index.md');
  if (!isFile(hubPath)) {
    errors.push('Missing games hub page: games/index.md');
    return;
  }

  const content = readText(hubPath);
  if (!content) return;

  if (!content.includes('site.data.games_manifest.games')) {
    errors.push('games/index.md should render from site.data.games_manifest.games.');
  }
  if (!content.includes('site.data.games_card_overrides')) {
    warnings.push('games/index.md should use site.data.games_card_overrides for card metadata.');
  }

  if (!/id="game-grid"/.test(content)) {
    warnings.push('games/index.md is missing #game-grid container.');
  }

  if (!/id="game-filter-bar"/.test(content)) {
    warnings.push('games/index.md is missing #game-filter-bar container.');
  }
}

function checkCardOverrides(manifest) {
  if (!isFile(cardOverridesPath)) {
    warnings.push('Optional card overrides file missing: games/card_overrides.json');
    return;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(cardOverridesPath, 'utf8'));
  } catch (err) {
    errors.push(`Invalid JSON in games/card_overrides.json: ${err.message}`);
    return;
  }

  if (!data || typeof data !== 'object') {
    errors.push('games/card_overrides.json must be a JSON object.');
    return;
  }

  const map = data.games && typeof data.games === 'object' && !Array.isArray(data.games)
    ? data.games
    : data;
  if (!map || typeof map !== 'object' || Array.isArray(map)) {
    errors.push('games/card_overrides.json must be an object map keyed by slug.');
    return;
  }

  const manifestSlugs = new Set(manifest.games.map((g) => normalizeSlug(g.slug)).filter(Boolean));
  for (const [rawSlug, value] of Object.entries(map)) {
    const slug = normalizeSlug(rawSlug);
    if (!slug) {
      warnings.push('Found empty slug key in games/card_overrides.json.');
      continue;
    }
    if (!manifestSlugs.has(slug)) {
      warnings.push(`Card override slug not found in manifest: ${slug}`);
    }
    if (value && typeof value === 'object') {
      if ('meta' in value && typeof value.meta !== 'string') {
        errors.push(`Card override "meta" must be a string for slug: ${slug}`);
      }
      if ('summary' in value && typeof value.summary !== 'string') {
        errors.push(`Card override "summary" must be a string for slug: ${slug}`);
      }
      if ('icon' in value && typeof value.icon !== 'string') {
        errors.push(`Card override "icon" must be a string for slug: ${slug}`);
      }
      if ('thumb' in value && typeof value.thumb !== 'string') {
        errors.push(`Card override "thumb" must be a string for slug: ${slug}`);
      }
      if ('button' in value && typeof value.button !== 'string') {
        errors.push(`Card override "button" must be a string for slug: ${slug}`);
      }
      if ('new_label' in value && typeof value.new_label !== 'string') {
        errors.push(`Card override "new_label" must be a string for slug: ${slug}`);
      }
    } else if (value !== null && value !== undefined) {
      errors.push(`Card override entry must be an object for slug: ${slug}`);
    }
  }
}

function checkDataSync() {
  if (!isFile(dataManifestPath)) {
    errors.push('Missing synced data file: _data/games_manifest.json');
  }
  if (!isFile(dataOverridesPath)) {
    errors.push('Missing synced data file: _data/games_card_overrides.json');
  }
  if (errors.length > 0) return;

  const sourceManifest = readText(manifestPath);
  const sourceOverrides = readText(cardOverridesPath);
  const dataManifest = readText(dataManifestPath);
  const dataOverrides = readText(dataOverridesPath);
  if (!sourceManifest || !sourceOverrides || !dataManifest || !dataOverrides) return;

  try {
    const a = JSON.stringify(JSON.parse(sourceManifest));
    const b = JSON.stringify(JSON.parse(dataManifest));
    if (a !== b) {
      errors.push('games/manifest.json and _data/games_manifest.json are out of sync. Run npm run sync:games-data.');
    }
  } catch (err) {
    errors.push(`Unable to compare manifest sync state: ${err.message}`);
  }

  try {
    const a = JSON.stringify(JSON.parse(sourceOverrides));
    const b = JSON.stringify(JSON.parse(dataOverrides));
    if (a !== b) {
      errors.push('games/card_overrides.json and _data/games_card_overrides.json are out of sync. Run npm run sync:games-data.');
    }
  } catch (err) {
    errors.push(`Unable to compare card override sync state: ${err.message}`);
  }
}

function run() {
  const manifest = loadManifest();
  const { gameDirs, gamePages } = checkGameFoldersAndPages(manifest);
  checkGamesHubManifestRendering();
  checkCardOverrides(manifest);
  checkDataSync();
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
