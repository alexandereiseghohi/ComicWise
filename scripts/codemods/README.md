# Codemods: replace-upload-with-hook

This folder contains a simple codemod helper to demonstrate automated refactors
that replace inline upload handlers with a shared `useImageUpload` hook.

Notes:

- The provided `replace-upload-with-hook.js` is a conservative regex-based
  helper intended as a demo. For production use, prefer AST-based codemods using
  `jscodeshift` or `ts-morph`.

Usage (demo):

```bash
# Run the simple helper against files that contain inline upload handlers
node scripts/codemods/replace-upload-with-hook.js \
  src/app/admin/artists/[id]/EditArtistForm.tsx \
  src/app/admin/authors/[id]/EditAuthorForm.tsx \
  src/app/admin/artists/new/page.tsx \
  src/app/admin/authors/new/page.tsx
```

JSCodeshift tip (recommended for robust transforms):

1. Install jscodeshift globally or in devDependencies:

```bash
npx jscodeshift -V || npm i -g jscodeshift
```

2. Create a `transform.js` that uses the jscodeshift API to perform AST-aware
   changes (not included here). Then run:

```bash
npx jscodeshift -t scripts/codemods/your-transform.js <path/glob>
```

The quick helper in this folder helps automate simple patterns but always review
changes before committing.

## AST-based jscodeshift transform included

There is an example `jscodeshift` transform available at:

```
scripts/codemods/replace-upload-with-hook.jscodeshift.js
```

Usage (recommended — preview first):

```bash
# install locally (dev)
pnpm add -D jscodeshift

# Preview changes (dry run) across the app folder
npx jscodeshift -t scripts/codemods/replace-upload-with-hook.jscodeshift.js --extensions=ts,tsx src/app --dry

# Apply changes (review before committing)
npx jscodeshift -t scripts/codemods/replace-upload-with-hook.jscodeshift.js --extensions=ts,tsx src/app
```

Notes:

- The transform is conservative but still requires manual review. Use `--dry` or
  `--print` to inspect edits before committing.
- If you prefer an interactive approach, run the transform against a small set
  of files first, review results, and then run across the repo.
