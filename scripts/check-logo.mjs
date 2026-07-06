#!/usr/bin/env node
// Build-time guard: verify /public/Logo.png exists with exact casing.
// Fails the build (non-zero exit) on Linux/macOS/Windows if the file is
// missing or the filename casing does not match exactly.
import { readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const REQUIRED = "Logo1.png";
const publicDir = resolve(process.cwd(), "public");

if (!existsSync(publicDir)) {
  console.error(`[check-logo] public/ directory not found at ${publicDir}`);
  process.exit(1);
}

const entries = readdirSync(publicDir);
const exact = entries.includes(REQUIRED);

if (exact) {
  console.log(`[check-logo] OK — public/${REQUIRED} present with correct casing.`);
  process.exit(0);
}

const caseInsensitive = entries.find(
  (n) => n.toLowerCase() === REQUIRED.toLowerCase()
);

if (caseInsensitive) {
  console.error(
    `[check-logo] FAIL — found "public/${caseInsensitive}" but expected exact casing "public/${REQUIRED}".\n` +
      `Vercel's Linux build is case-sensitive; rename the file to "${REQUIRED}".`
  );
} else {
  console.error(
    `[check-logo] FAIL — "public/${REQUIRED}" is missing. Add the logo at public/${REQUIRED}.`
  );
}
process.exit(1);
