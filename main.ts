// main.ts - post-x-promote-make-your-own-bounty-01
// Copies POST.json from the repository root to the output directory.
// Validates the post address first: it must name an X status URL.
// Node 22, stdlib only, no network.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const src = join(repoRoot, "POST.json");
const dst = join(outDir, "POST.json");

// X status URL as X shows it: https://x.com/<handle>/status/<digits>
// (twitter.com, www./mobile. prefixes and /i/web/status/<id> also read,
// but this entry always writes the plain x.com form.)
const STATUS_URL = /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/status\/\d+$/;

if (!existsSync(src)) {
  console.error(`POST.json not found at ${src}`);
  process.exit(1);
}

let post: unknown;
try {
  post = JSON.parse(readFileSync(src, "utf8"));
} catch (err) {
  console.error(`POST.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}

const url = (post as { url?: unknown } | null)?.url;
if (typeof url !== "string" || !STATUS_URL.test(url)) {
  console.error(`POST.json url is not an X status address: ${String(url)}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(src, dst);
console.log(`copied POST.json -> ${dst} (url: ${url})`);
