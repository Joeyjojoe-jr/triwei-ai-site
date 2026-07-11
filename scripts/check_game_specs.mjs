import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const warnings = [];
const infos = [];

const manifestPath = path.join(root, "games", "manifest.json");
const specsIndexPath = path.join(root, "games", "specs", "index.md");

function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function isDir(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    errors.push(`Unable to read ${path.relative(root, filePath)}: ${err.message}`);
    return "";
  }
}

function parseManifest() {
  if (!isFile(manifestPath)) {
    errors.push("Missing games manifest: games/manifest.json");
    return [];
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (!parsed || !Array.isArray(parsed.games)) {
      errors.push("games/manifest.json must contain a top-level games array.");
      return [];
    }
    return parsed.games;
  } catch (err) {
    errors.push(`Invalid JSON in games/manifest.json: ${err.message}`);
    return [];
  }
}

function parseFrontMatter(content, relPath) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    errors.push(`Missing front matter in ${relPath}`);
    return { raw: "", body: content, map: new Map() };
  }
  const raw = match[1];
  const body = content.slice(match[0].length);
  const map = new Map();
  for (const line of raw.split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    map.set(kv[1], kv[2]);
  }
  return { raw, body, map };
}

function hasHeading(body, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^##\\s+${escaped}\\s*$`, "m");
  return pattern.test(body);
}

function resolveRoute(route, sourcePath) {
  if (!route) return;
  if (/^(https?:|mailto:|tel:|#)/.test(route)) return;

  if (route.startsWith("/")) {
    const cleaned = route.replace(/^\/+|\/+$/g, "");
    if (!cleaned) return;

    const abs = path.join(root, cleaned);
    if (isFile(abs)) return;
    if (isDir(abs)) {
      if (!isFile(path.join(abs, "index.html")) && !isFile(path.join(abs, "index.md"))) {
        errors.push(`Route has no index file: ${route} (from ${sourcePath})`);
      }
      return;
    }

    const topMd = path.join(root, `${cleaned}.md`);
    if (!isFile(topMd)) {
      errors.push(`Unresolved route: ${route} (from ${sourcePath})`);
    }
    return;
  }

  const baseDir = path.dirname(path.join(root, sourcePath));
  const resolved = path.resolve(baseDir, route);
  if (!isFile(resolved) && !isDir(resolved)) {
    errors.push(`Unresolved relative route: ${route} (from ${sourcePath})`);
  }
}

function collectLinks(content) {
  const links = [];

  const markdownLinks = content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g);
  for (const match of markdownLinks) {
    links.push(match[1]);
  }

  const htmlLinks = content.matchAll(/(?:href|src)="([^"]+)"/g);
  for (const match of htmlLinks) {
    const route = match[1];
    if (route.startsWith("{{")) continue;
    links.push(route);
  }

  return links;
}

function checkSpecsIndex() {
  if (!isFile(specsIndexPath)) {
    errors.push("Missing specs index: games/specs/index.md");
    return;
  }
  const content = readText(specsIndexPath);
  if (!content) return;
  if (!content.includes("site.data.games_manifest.games")) {
    errors.push("games/specs/index.md should render entries from site.data.games_manifest.games.");
  }
}

function checkSpecEntry(game) {
  const slug = String(game.slug || "").trim().replace(/^\/+|\/+$/g, "");
  if (!slug) {
    errors.push("Manifest entry missing slug.");
    return;
  }

  const expectedSpecUrl = `/games/specs/${slug}/`;
  if (game.spec_url !== expectedSpecUrl) {
    errors.push(`Manifest spec_url mismatch for ${slug}. Expected ${expectedSpecUrl}, found ${game.spec_url || "<missing>"}`);
  }

  const specPath = path.join(root, "games", "specs", `${slug}.md`);
  const relSpecPath = path.relative(root, specPath).replace(/\\/g, "/");
  if (!isFile(specPath)) {
    errors.push(`Missing spec page for ${slug}: ${relSpecPath}`);
    return;
  }

  const content = readText(specPath);
  if (!content) return;
  const { raw, body, map } = parseFrontMatter(content, relSpecPath);
  if (!raw) return;

  const requiredFrontMatterKeys = [
    "layout",
    "title",
    "slug",
    "kind",
    "game_url",
    "permalink",
    "tags",
    "difficulty",
    "session_length",
    "last_reviewed",
    "asset_budget"
  ];

  for (const key of requiredFrontMatterKeys) {
    if (!map.has(key)) {
      errors.push(`Missing front matter key "${key}" in ${relSpecPath}`);
    }
  }

  const requiredBudgetKeys = [
    "initial_transfer_kb",
    "interactive_transfer_kb",
    "max_runtime_ram_mb",
    "max_gpu_tex_mb"
  ];
  for (const key of requiredBudgetKeys) {
    if (!new RegExp(`^\\s*${key}:\\s*`, "m").test(raw)) {
      errors.push(`Missing asset_budget key "${key}" in ${relSpecPath}`);
    }
  }

  const slugInSpec = (map.get("slug") || "").replace(/^["']|["']$/g, "");
  if (slugInSpec !== slug) {
    errors.push(`Spec slug mismatch in ${relSpecPath}. Expected "${slug}", found "${slugInSpec || "<missing>"}"`);
  }

  const permalink = (map.get("permalink") || "").replace(/^["']|["']$/g, "");
  if (permalink !== expectedSpecUrl) {
    errors.push(`Spec permalink mismatch in ${relSpecPath}. Expected "${expectedSpecUrl}", found "${permalink || "<missing>"}"`);
  }

  const gameUrl = (map.get("game_url") || "").replace(/^["']|["']$/g, "");
  if (gameUrl !== game.route) {
    errors.push(`Spec game_url mismatch in ${relSpecPath}. Expected "${game.route}", found "${gameUrl || "<missing>"}"`);
  }

  const requiredSections = [
    "Overview",
    "Learning Lens",
    "Controls",
    "Core Loop",
    "Scoring and Metrics",
    "Failure States",
    "Determinism and Randomness",
    "Instrumentation Contract",
    "Accessibility Notes",
    "Test Checklist"
  ];
  for (const section of requiredSections) {
    if (!hasHeading(body, section)) {
      errors.push(`Missing section "${section}" in ${relSpecPath}`);
    }
  }

  for (const link of collectLinks(content)) {
    resolveRoute(link, relSpecPath);
  }
}

function run() {
  const games = parseManifest();
  checkSpecsIndex();
  for (const game of games) {
    checkSpecEntry(game);
  }

  infos.push(`Spec entries checked: ${games.length}`);
  for (const info of infos) console.log(`INFO: ${info}`);
  for (const warning of warnings) console.log(`WARN: ${warning}`);
  if (errors.length > 0) {
    console.error(`FAIL: ${errors.length} issue(s) found.`);
    for (const err of errors) console.error(`ERROR: ${err}`);
    process.exit(1);
  }
  console.log("PASS: check_game_specs");
}

run();
