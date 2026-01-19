#!/usr/bin/env node
/**
 * Simple codemod helper (regex-based) to replace inline `handleImageUpload`
 * functions with `useImageUpload` hook usage on client components.
 *
 * This is intentionally conservative and meant as a demo: it performs a
 * best-effort regex replacement. For robust AST-based transforms, use
 * jscodeshift or ts-morph (see README).
 *
 * Usage:
 *   node scripts/codemods/replace-upload-with-hook.js <file1> <file2> ...
 */

import fs from "fs";
import path from "path";

function ensureImport(content) {
  if (/useImageUpload/.test(content)) return content;
  // Find the last import and insert after it
  const m = content.match(/(import[\S\s]*?from\s+["'][^"']+["'];?\s*)+/);
  if (m) {
    const insertAt = m[0].length;
    const before = content.slice(0, insertAt);
    const after = content.slice(insertAt);
    return `${before}\nimport { useImageUpload } from 'hooks/useImageUpload';\n${after}`;
  }
  return `import { useImageUpload } from 'hooks/useImageUpload';\n${content}`;
}

function transform(content) {
  // Remove async function handleImageUpload(...) { ... }
  const funcRe = /async function handleImageUpload\([\S\s]*?\n}\n\n/;
  let out = content.replace(funcRe, "");

  // Add hook usage: const { fileInputRef, isUploading, handleFileSelect } = useImageUpload({ uploadType: 'avatar', onChange: (url) => form?.setValue ? form.setValue("profileImage", url) : document.getElementById("profile-upload")?.value = url, onUploadComplete: (url) => { try { const { toast } = await import("sonner"); toast.success("Image uploaded successfully"); } catch {}}});
  // Because we can't easily insert inside function, we'll append near top after imports
  if (!/useImageUpload/.test(out)) {
    out = ensureImport(out);
  }

  // Insert a simple hook usage placeholder after imports
  const hookSnippet = `\n// Auto-inserted: useImageUpload hook (adjust callbacks as needed)\nconst { fileInputRef, isUploading, handleFileSelect } = useImageUpload({ uploadType: 'avatar', onChange: (url) => { try { if (typeof form?.setValue === 'function') { form.setValue('profileImage', url); } else { document.getElementById('profile-upload')?.setAttribute('value', url); } } catch (e) { /* ignore */ } }, onUploadComplete: (url) => { /* optional: show toast */ } });\n`;
  // Only add once
  if (!/useImageUpload\(/.test(out)) {
    // place after the last import block
    const lastImportMatch = out.match(/(import[\S\s]*?from\s+["'][^"']+["'];?\s*)+/);
    if (lastImportMatch) {
      const idx = lastImportMatch[0].length;
      out = out.slice(0, idx) + "\n" + hookSnippet + out.slice(idx);
    } else {
      out = hookSnippet + out;
    }
  }

  // Replace onChange={handleImageUpload} -> onChange={handleFileSelect}
  out = out.replaceAll("onChange={handleImageUpload}", "onChange={handleFileSelect}");

  // Replace clicks that invoke document.getElementById(...).click() to use ref
  out = out.replaceAll(
    /document.getElementById\(([^)]+)\)\?\.click\(\)/g,
    "fileInputRef.current?.click()"
  );

  return out;
}

function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("Usage: node replace-upload-with-hook.js <file1> <file2> ...");
    process.exit(1);
  }

  for (const file of files) {
    const p = path.resolve(file);
    if (!fs.existsSync(p)) {
      console.warn("File not found:", p);
      continue;
    }
    const content = fs.readFileSync(p, "utf8");
    const transformed = transform(content);
    fs.writeFileSync(p, transformed, "utf8");
    console.log("Transformed", p);
  }
}

main();
