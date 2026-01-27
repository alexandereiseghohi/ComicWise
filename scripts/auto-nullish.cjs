#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

const exts = new Set([".ts", ".tsx", ".js", ".jsx"]);

function walk(dir) {
  const res = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      res.push(...walk(p));
    } else if (exts.has(path.extname(name))) {
      res.push(p);
    }
  }
  return res;
}

const literalRe =
  /(\|\|)\s*(?:('(?:\\.|[^'\\])*')|("(?:\\.|[^"\\])*")|(`(?:\\.|[^\\`])*`)|\b\d+\b|\btrue\b|\bfalse\b)/g;

function processFile(file) {
  const src = fs.readFileSync(file, "utf8");
  let count = 0;
  const newSrc = src.replaceAll(literalRe, (m, p1) => {
    count += 1;
    // m starts with '|| ...', we want '?? ...'
    return "?? " + m.slice(p1.length).trim();
  });
  if (count > 0 && newSrc !== src) {
    fs.writeFileSync(file, newSrc, "utf8");
  }
  return count;
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error("src/ not found, abort");
    process.exit(1);
  }
  const files = walk(SRC);
  let total = 0;
  const changedFiles = [];
  for (const f of files) {
    try {
      const c = processFile(f);
      if (c > 0) {
        total += c;
        changedFiles.push({ file: f, changes: c });
      }
    } catch (error) {
      console.error("failed", f, error?.message);
    }
  }
  console.log(
    `Processed ${files.length} files. Replaced ${total} occurrences in ${changedFiles.length} files.`
  );
  for (const cf of changedFiles) console.log(`${cf.changes} -> ${cf.file}`);
}

main();
