/**
 * TriWei Games Labs Smoke Tests
 *
 * Runs headless Chromium checks against the static site served locally.
 *
 * What we check:
 *  - page loads
 *  - no console.error during load/idle
 *  - required elements exist (controls/canvases)
 *
 * This is intentionally lightweight and dependency-minimal.
 */
import { chromium } from "playwright";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findRepoRoot(startDir) {
  // Walk up until we find a directory containing "games/"
  let cur = startDir;
  for (let i = 0; i < 12; i++) {
    if (fs.existsSync(path.join(cur, "games")) && fs.statSync(path.join(cur, "games")).isDirectory()) {
      return cur;
    }
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  throw new Error("Could not find repo root containing a 'games/' folder. Run from inside your repo.");
}

function serveStatic(rootDir, port = 0) {
  const server = http.createServer((req, res) => {
    try {
      let urlPath = decodeURIComponent(req.url.split("?")[0]);
      if (urlPath.endsWith("/")) urlPath += "index.html";
      const fsPath = path.join(rootDir, urlPath);

      // Prevent directory traversal
      const norm = path.normalize(fsPath);
      if (!norm.startsWith(path.normalize(rootDir))) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      if (!fs.existsSync(norm) || fs.statSync(norm).isDirectory()) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const ext = path.extname(norm).toLowerCase();
      const mime = ({
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".ico": "image/x-icon",
      })[ext] || "application/octet-stream";

      res.writeHead(200, { "Content-Type": mime });
      fs.createReadStream(norm).pipe(res);
    } catch (e) {
      res.writeHead(500);
      res.end("Server error");
    }
  });

  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      const addr = server.address();
      resolve({ server, port: addr.port });
    });
  });
}

// Lab definitions with selectors and optional test logic. Each test returns true on pass, false on failure.
const LABS = [
  {
    name: "linreg",
    path: "/games/labs/linreg/",
    requiredSelectors: [
      "#plotCanvas",
      "#surfaceCanvas",
      "#w",
      "#b",
      "#train",
      "#gradCheck"
    ],
    async test(page) {
      try {
        // Select the simplest dataset to ensure stable convergence
        await page.selectOption('#dataset', 'line');
        // Set a modest number of gradient steps and run training
        await page.fill('#steps', '10');
        // Capture metrics after initial render
        const trainBefore = parseFloat((await page.locator('#trainMSE').innerText()).trim());
        // Click Train button
        await page.click('#train');
        await page.waitForTimeout(300);
        const trainAfter = parseFloat((await page.locator('#trainMSE').innerText()).trim());
        const testAfter  = parseFloat((await page.locator('#testMSE').innerText()).trim());
        const warnText   = (await page.locator('#warn').innerText()).trim();
        // Pass if losses are finite, warning empty, and training loss did not increase dramatically
        const finite = Number.isFinite(trainAfter) && Number.isFinite(testAfter);
        const improved = !Number.isNaN(trainBefore) && Number.isFinite(trainBefore) ? (trainAfter <= trainBefore) : true;
        return finite && warnText === '' && improved;
      } catch (e) {
        console.error(`linreg test error`, e);
        return false;
      }
    },
  },
  {
    name: "overfitting",
    path: "/games/labs/overfitting/",
    requiredSelectors: [
      "#curveCanvas",
      "#lossCanvas",
      "#degree",
      "#lambda",
      "#fit",
      "#gradcheck"
    ],
    async test(page) {
      try {
        // Run a fit with current sliders
        await page.click('#fit');
        await page.waitForTimeout(300);
        const train = parseFloat((await page.locator('#trainMSE').innerText()).trim());
        const test  = parseFloat((await page.locator('#testMSE').innerText()).trim());
        const warn  = (await page.locator('#warn').innerText()).trim();
        return Number.isFinite(train) && Number.isFinite(test) && warn === '';
      } catch (e) {
        console.error(`overfitting test error`, e);
        return false;
      }
    },
  },
  {
    name: "backprop",
    path: "/games/labs/backprop/",
    requiredSelectors: [
      "#graphSvg",
      "#step",
      "#gradcheck",
      "#x1",
      "#x2",
      "#y"
    ],
    async test(page) {
      try {
        // Set input values to reasonable numbers
        await page.fill('#x1','0.3');
        await page.fill('#x2','0.4');
        await page.fill('#y','1');
        // Set a moderate learning rate via slider
        await page.locator('#lr').evaluate(el => { el.value = '0.1'; el.dispatchEvent(new Event('input')); });
        // Perform one training step
        await page.click('#step');
        await page.waitForTimeout(200);
        const lossText = (await page.locator('#loss').innerText()).trim();
        const warn    = (await page.locator('#warn').innerText()).trim();
        const loss    = parseFloat(lossText);
        return Number.isFinite(loss) && warn === '';
      } catch (e) {
        console.error(`backprop test error`, e);
        return false;
      }
    },
  },
  {
    name: "knn-vs-logreg",
    path: "/games/labs/knn-vs-logreg/",
    requiredSelectors: [
      "canvas",
      "#model",
      "#k",
      "#train",
      "#gradcheck"
    ],
    async test(page) {
      try {
        // Draw a few points for two classes
        // Add two class 0 points
        await page.selectOption('#cls','0');
        const canvas = page.locator('canvas');
        const box = await canvas.boundingBox();
        const offX = box.x + box.width * 0.25;
        const offY = box.y + box.height * 0.25;
        await page.mouse.click(offX, offY);
        await page.mouse.click(offX + 10, offY + 10);
        // Add two class 1 points
        await page.selectOption('#cls','1');
        await page.mouse.click(box.x + box.width * 0.75, box.y + box.height * 0.75);
        await page.mouse.click(box.x + box.width * 0.75 + 10, box.y + box.height * 0.75 + 10);
        // Train logistic regression
        await page.fill('#steps', '200');
        await page.click('#train');
        await page.waitForTimeout(400);
        const warn = (await page.locator('#warn').innerText()).trim();
        return warn === '';
      } catch (e) {
        console.error(`knn-vs-logreg test error`, e);
        return false;
      }
    },
  },
  {
    name: "qlearning-grid",
    path: "/games/labs/qlearning-grid/",
    requiredSelectors: [
      "canvas",
      "#step",
      "#episode",
      "#reset",
      "#train100"
    ],
    async test(page) {
      try {
        // Run multiple episodes to update Q-values
        await page.click('#train100');
        await page.waitForTimeout(500);
        const warn = (await page.locator('#warn').innerText()).trim();
        const retVal = parseFloat((await page.locator('#ret').innerText()).trim());
        return warn === '' && Number.isFinite(retVal);
      } catch (e) {
        console.error(`qlearning-grid test error`, e);
        return false;
      }
    },
  },
];

async function main() {
  const repoRoot = findRepoRoot(__dirname);
  const { server, port } = await serveStatic(repoRoot, 0);
  const baseURL = `http://127.0.0.1:${port}`;

  console.log(`\nServing: ${baseURL}`);
  console.log(`Repo root: ${repoRoot}\n`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  let failed = 0;

  try {
    for (const lab of LABS) {
      const url = baseURL + lab.path;
      const consoleErrors = [];

      const onConsole = (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      };
      page.on("console", onConsole);

      console.log(`→ ${lab.name}: ${url}`);

      const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      if (!resp || !resp.ok()) {
        console.log(`  ✗ HTTP error: ${resp ? resp.status() : "no response"}`);
        failed++;
        page.off("console", onConsole);
        continue;
      }

      // Give animations/initial render a moment
      await page.waitForTimeout(500);

      // Required selectors
      for (const sel of lab.requiredSelectors) {
        const ok = await page.locator(sel).first().count();
        if (!ok) {
          console.log(`  ✗ Missing selector: ${sel}`);
          failed++;
          break;
        }
      }

      // Run lab-specific test logic, if provided
      let testPassed = true;
      if (typeof lab.test === 'function') {
        try {
          testPassed = await lab.test(page);
        } catch (err) {
          console.error(`  ✗ Test execution error for ${lab.name}:`, err);
          testPassed = false;
        }
      }

      // Console errors
      if (consoleErrors.length) {
        console.log(`  ✗ Console errors:`);
        for (const e of consoleErrors.slice(0, 10)) console.log(`    - ${e}`);
        failed++;
      }

      // Report test failure or success
      if (!testPassed) {
        console.log(`  ✗ Functional test failed`);
        failed++;
      }
      if (!consoleErrors.length && testPassed) {
        console.log(`  ✓ OK`);
      }

      page.off("console", onConsole);
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log("\n==============================");
  if (failed) {
    console.log(`Smoke tests FAILED (${failed} issue(s)).`);
    process.exitCode = 1;
  } else {
    console.log("Smoke tests PASSED ✅");
  }
  console.log("==============================\n");
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
