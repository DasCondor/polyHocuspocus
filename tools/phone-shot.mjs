// Saves a phone-sized (390x844) screenshot of a page at twice the pixel density,
// for the README. Runs inside the Playwright Docker image; see tools/screenshots.ps1.
//   node phone-shot.mjs <url> <output.png>
import { chromium, devices } from 'playwright';

const [url, out] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ ...devices['iPhone 13'], deviceScaleFactor: 2, reducedMotion: 'reduce' });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: out });
await browser.close();
