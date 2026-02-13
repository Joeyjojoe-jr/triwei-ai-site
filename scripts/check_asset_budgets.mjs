import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const warnings = [];
const infos = [];

const packsPath = path.join(root, "_data", "asset_packs.json");
const gamesPath = path.join(root, "games", "manifest.json");

function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function readJson(filePath, label) {
  if (!isFile(filePath)) {
    errors.push(`Missing JSON file: ${label}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    errors.push(`Invalid JSON in ${label}: ${err.message}`);
    return null;
  }
}

function toPosix(value) {
  return String(value || "").replace(/\\/g, "/");
}

function escapeRegex(input) {
  return input.replace(/[.+^${}()|[\]\\]/g, "\\$&");
}

function globToRegex(globPattern) {
  let pattern = toPosix(globPattern).replace(/^\.?\//, "");
  pattern = escapeRegex(pattern);
  pattern = pattern.replace(/\\\*\\\*/g, "###DOUBLE_STAR###");
  pattern = pattern.replace(/\\\*/g, "[^/]*");
  pattern = pattern.replace(/###DOUBLE_STAR###/g, ".*");
  return new RegExp(`^${pattern}$`);
}

function listAllFiles(startDir) {
  const out = [];
  const stack = [startDir];
  while (stack.length > 0) {
    const dir = stack.pop();
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(abs);
      } else if (entry.isFile()) {
        out.push(toPosix(path.relative(root, abs)));
      }
    }
  }
  return out;
}

function readSpecBudget(gameSlug) {
  const specPath = path.join(root, "games", "specs", `${gameSlug}.md`);
  if (!isFile(specPath)) {
    warnings.push(`Missing spec for budget check: games/specs/${gameSlug}.md`);
    return null;
  }
  const content = fs.readFileSync(specPath, "utf8");
  const initialMatch = content.match(/^\s*initial_transfer_kb:\s*(\d+(?:\.\d+)?)\s*$/m);
  const interactiveMatch = content.match(/^\s*interactive_transfer_kb:\s*(\d+(?:\.\d+)?)\s*$/m);
  if (!initialMatch || !interactiveMatch) {
    warnings.push(`Missing spec budget fields in games/specs/${gameSlug}.md`);
    return null;
  }
  return {
    initialKb: Number(initialMatch[1]),
    interactiveKb: Number(interactiveMatch[1])
  };
}

function bytesToKb(bytes) {
  return bytes / 1024;
}

function run() {
  const packs = readJson(packsPath, "_data/asset_packs.json");
  const gamesManifest = readJson(gamesPath, "games/manifest.json");
  if (!packs || !gamesManifest || !Array.isArray(packs) || !Array.isArray(gamesManifest.games)) {
    if (errors.length === 0) errors.push("Invalid asset pack or game manifest shape.");
    finish();
    return;
  }

  const files = listAllFiles(root);
  const fileSet = new Set(files);

  const packBySlug = new Map();
  const packFiles = new Map();
  const packBytes = new Map();
  const packLargestFile = new Map();

  for (const pack of packs) {
    const slug = String(pack.slug || "").trim();
    if (!slug) {
      errors.push("Asset pack missing slug.");
      continue;
    }
    if (packBySlug.has(slug)) {
      errors.push(`Duplicate asset pack slug: ${slug}`);
      continue;
    }
    if (!Array.isArray(pack.globs) || pack.globs.length === 0) {
      errors.push(`Asset pack "${slug}" must define a non-empty globs array.`);
      continue;
    }
    packBySlug.set(slug, pack);

    const matched = new Set();
    for (const glob of pack.globs) {
      const regex = globToRegex(glob);
      for (const rel of files) {
        if (regex.test(rel)) matched.add(rel);
      }
    }
    if (matched.size === 0) {
      warnings.push(`Asset pack "${slug}" matched no files.`);
    }

    let total = 0;
    let largestBytes = 0;
    let largestRel = "";
    for (const rel of matched) {
      const abs = path.join(root, rel);
      const size = fs.statSync(abs).size;
      total += size;
      if (size > largestBytes) {
        largestBytes = size;
        largestRel = rel;
      }
    }
    packFiles.set(slug, [...matched].sort());
    packBytes.set(slug, total);
    packLargestFile.set(slug, { rel: largestRel, bytes: largestBytes });

    const budgets = pack.budgets || {};
    const maxTransferKb = Number(budgets.max_transfer_kb);
    const maxSingleKb = Number(budgets.max_single_file_kb);
    if (Number.isFinite(maxTransferKb) && bytesToKb(total) > maxTransferKb) {
      errors.push(
        `Pack "${slug}" exceeds max_transfer_kb (${bytesToKb(total).toFixed(1)} KB > ${maxTransferKb} KB).`
      );
    }
    if (Number.isFinite(maxSingleKb) && bytesToKb(largestBytes) > maxSingleKb) {
      errors.push(
        `Pack "${slug}" exceeds max_single_file_kb (${largestRel}: ${bytesToKb(largestBytes).toFixed(1)} KB > ${maxSingleKb} KB).`
      );
    }
  }

  for (const game of gamesManifest.games) {
    const slug = String(game.slug || "").trim();
    if (!slug) continue;
    const packsForGame = Array.isArray(game.asset_packs) ? game.asset_packs : [];
    const unique = Array.isArray(game.unique_assets) ? game.unique_assets : [];
    if (packsForGame.length === 0) {
      errors.push(`Game "${slug}" must declare at least one asset pack.`);
    }
    if (unique.length === 0) {
      warnings.push(`Game "${slug}" has no unique_assets entries.`);
    }

    let initialBytes = 0;
    let interactiveBytes = 0;

    for (const packSlug of packsForGame) {
      const pack = packBySlug.get(packSlug);
      if (!pack) {
        errors.push(`Game "${slug}" references missing pack "${packSlug}".`);
        continue;
      }
      const bytes = packBytes.get(packSlug) || 0;
      interactiveBytes += bytes;
      if (pack.preload_policy === "precache") {
        initialBytes += bytes;
      }
    }

    for (const relRaw of unique) {
      const rel = toPosix(relRaw);
      if (!fileSet.has(rel)) {
        errors.push(`Game "${slug}" unique asset missing: ${rel}`);
        continue;
      }
      const size = fs.statSync(path.join(root, rel)).size;
      initialBytes += size;
      interactiveBytes += size;
    }

    const specBudget = readSpecBudget(slug);
    if (specBudget) {
      const initialKb = bytesToKb(initialBytes);
      const interactiveKb = bytesToKb(interactiveBytes);
      if (initialKb > specBudget.initialKb) {
        errors.push(
          `Game "${slug}" initial transfer exceeds spec budget (${initialKb.toFixed(1)} KB > ${specBudget.initialKb} KB).`
        );
      }
      if (interactiveKb > specBudget.interactiveKb) {
        errors.push(
          `Game "${slug}" interactive transfer exceeds spec budget (${interactiveKb.toFixed(1)} KB > ${specBudget.interactiveKb} KB).`
        );
      }
      infos.push(
        `Game ${slug}: initial ${initialKb.toFixed(1)} KB, interactive ${interactiveKb.toFixed(1)} KB`
      );
    }
  }

  const sortedPacks = [...packBySlug.keys()].sort((a, b) => (packBytes.get(b) || 0) - (packBytes.get(a) || 0));
  for (const slug of sortedPacks) {
    const total = packBytes.get(slug) || 0;
    const largest = packLargestFile.get(slug) || { rel: "", bytes: 0 };
    infos.push(
      `Pack ${slug}: ${bytesToKb(total).toFixed(1)} KB total, largest ${largest.rel || "(none)"} (${bytesToKb(largest.bytes).toFixed(1)} KB)`
    );
  }

  finish();
}

function finish() {
  for (const info of infos) console.log(`INFO: ${info}`);
  for (const warning of warnings) console.log(`WARN: ${warning}`);
  if (errors.length > 0) {
    console.error(`FAIL: ${errors.length} issue(s) found.`);
    for (const err of errors) console.error(`ERROR: ${err}`);
    process.exit(1);
  }
  console.log("PASS: check_asset_budgets");
}

run();
