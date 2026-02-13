import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const mappings = [
  {
    src: path.join(root, 'games', 'manifest.json'),
    dest: path.join(root, '_data', 'games_manifest.json')
  },
  {
    src: path.join(root, 'games', 'card_overrides.json'),
    dest: path.join(root, '_data', 'games_card_overrides.json')
  }
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function formatJsonFile(srcPath, destPath) {
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Missing source JSON: ${path.relative(root, srcPath)}`);
  }
  const raw = fs.readFileSync(srcPath, 'utf8');
  const parsed = JSON.parse(raw);
  ensureDir(destPath);
  fs.writeFileSync(destPath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
}

function run() {
  for (const mapping of mappings) {
    formatJsonFile(mapping.src, mapping.dest);
    console.log(
      `Synced ${path.relative(root, mapping.src)} -> ${path.relative(root, mapping.dest)}`
    );
  }
}

run();
