#!/usr/bin/env node
// Lightweight env secret scanner for local/CI use
// Usage: node ./scripts/check-env-secrets.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const targets = [
  ".env",
  ".env.local",
  ".env.example",
  ".env.production",
  ".env.staging",
  ".envs",
  ".env.*.template",
];

function readFileSafe(fp) {
  try {
    return fs.readFileSync(fp, "utf8");
  } catch (e) {
    return null;
  }
}

function isPlaceholder(val) {
  if (!val) return true;
  const v = val.toLowerCase();
  return (
    v.includes("<redacted") ||
    v.includes("change-me") ||
    v.includes("your-") ||
    v.includes("example") ||
    v.includes("<db_") ||
    v.includes("dev")
  );
}

function looksLikeSecret(val) {
  if (!val) return false;
  // Trim quotes
  const v = val.replace(/^\s*['\"]?|['\"]?\s*$/g, "");
  if (isPlaceholder(v)) return false;
  // Long base64-like strings
  if (/^[A-Za-z0-9+\/=]{32,}$/.test(v)) return true;
  // JWT-like (three base64 segments separated by .)
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(v)) return true;
  // URLs containing credentials (protocol://user:pass@host)
  if (/:\/\/[^:\s]+:[^@\s]+@/.test(v)) return true;
  // Redis URL with auth
  if (/redis:\/\/.+:.+@/.test(v)) return true;
  // Contains long sequences of special chars or pipes (escape the slash)
  if (/[|`~!@#$%^&*()_+=\[\]{};:'"\\|<>\/\?]{6,}/.test(v)) return true;
  // Common key names with non-placeholder short tokens
  if (/^(?:[A-Za-z0-9_\-]{8,})$/.test(v) && v.length >= 20) return true;
  return false;
}

function walkDir(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // skip node_modules
      if (e.name === "node_modules" || e.name === ".git") continue;
      walkDir(full, list);
    } else {
      list.push(full);
    }
  }
  return list;
}

function scanFile(fp) {
  const txt = readFileSafe(fp);
  if (!txt) return [];
  const lines = txt.split(/\r?\n/);
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([A-Za-z0-9_\-\.]+)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2] || "";
    // remove inline comments
    val = val.replace(/\s+#.*$/, "").trim();
    if (looksLikeSecret(val)) {
      hits.push({
        file: fp,
        line: i + 1,
        key,
        val: val.length > 80 ? val.slice(0, 80) + "..." : val,
      });
    }
  }
  return hits;
}

// Build file list: root-level env files + .envs directory
const fileList = [];
[".env", ".env.local", ".env.example", ".env.production", ".env.staging", ".env.test"].forEach(
  (f) => {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) fileList.push(p);
  }
);
const envsDir = path.join(ROOT, ".envs");
if (fs.existsSync(envsDir)) {
  walkDir(envsDir).forEach((f) => {
    const base = path.basename(f);
    if (base.startsWith(".env") || base.includes("env")) fileList.push(f);
  });
}

// Also include templates
[".env.production.template", ".env.staging.template"].forEach((f) => {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) fileList.push(p);
});

let totalHits = 0;
for (const fp of fileList) {
  const hits = scanFile(fp);
  if (hits.length) {
    console.log("\nPotential secrets found in " + path.relative(ROOT, fp) + ":");
    hits.forEach((h) => {
      console.log(`  - ${h.key} @ line ${h.line}: ${h.val}`);
      totalHits++;
    });
  }
}

if (totalHits > 0) {
  console.error("\nSecret scanner detected " + totalHits + " potential secret(s).");
  console.error(
    "Replace values with placeholders before committing, or add exceptions to the scanner."
  );
  process.exit(1);
} else {
  console.log("No obvious secrets detected in scanned env files.");
  process.exit(0);
}
