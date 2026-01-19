/**
 * jscodeshift transform: replace-upload-with-hook.jscodeshift.js
 * - Removes a top-level `async function handleImageUpload(...)` declaration
 * - Adds an import for `useImageUpload` from `hooks/useImageUpload` if missing
 * - Inserts a conservative hook usage snippet after imports when `handleImageUpload` was present
 * - Replaces `onChange={handleImageUpload}` with `onChange={handleFileSelect}`
 * - Replaces `document.getElementById(...)? .click()` patterns with `fileInputRef.current?.click()`
 *
 * This transform is intentionally conservative — it will only modify files
 * that reference `handleImageUpload`. Always run with `--dry` to preview.
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const hasHandleFn =
    root.find(j.FunctionDeclaration, { id: { name: "handleImageUpload" } }).size() > 0 ||
    root.find(j.VariableDeclarator, { id: { name: "handleImageUpload" } }).size() > 0;

  if (!hasHandleFn && !file.source.includes("handleImageUpload")) {
    return null; // nothing to do
  }

  // Remove top-level function declaration named handleImageUpload
  root.find(j.FunctionDeclaration, { id: { name: "handleImageUpload" } }).forEach((p) => {
    j(p).remove();
  });

  // Also remove var/const declarations like: const handleImageUpload = async (...) => { ... }
  root.find(j.VariableDeclarator, { id: { name: "handleImageUpload" } }).forEach((p) => {
    const parent = p.parentPath?.parentPath;
    if (parent?.node?.type === "VariableDeclaration") {
      j(parent).remove();
    } else {
      j(p).remove();
    }
  });

  // Ensure import for useImageUpload exists
  const existingImport = root.find(j.ImportDeclaration, {
    source: { value: "hooks/useImageUpload" },
  });
  if (existingImport.size() === 0) {
    // insert after last import
    const imports = root.find(j.ImportDeclaration);
    const hookImport = j.importDeclaration(
      [j.importSpecifier(j.identifier("useImageUpload"))],
      j.literal("hooks/useImageUpload")
    );

    if (imports.size() > 0) {
      imports.at(imports.size() - 1).insertAfter(hookImport);
    } else {
      root.get().node.program.body.unshift(hookImport);
    }
  }

  // Insert hook usage snippet after imports if not already present
  const hasHookCall =
    root.find(j.CallExpression, { callee: { name: "useImageUpload" } }).size() > 0;
  if (!hasHookCall) {
    const hookVar = j.variableDeclaration("const", [
      j.variableDeclarator(
        j.objectPattern([
          j.property("init", j.identifier("fileInputRef"), j.identifier("fileInputRef")),
          j.property("init", j.identifier("isUploading"), j.identifier("isUploading")),
          j.property("init", j.identifier("handleFileSelect"), j.identifier("handleFileSelect")),
        ]),
        j.callExpression(j.identifier("useImageUpload"), [
          j.objectExpression([j.property("init", j.identifier("uploadType"), j.literal("avatar"))]),
        ])
      ),
    ]);

    // Insert after last import
    const imports = root.find(j.ImportDeclaration);
    if (imports.size() > 0) {
      imports.at(imports.size() - 1).insertAfter(hookVar);
    } else {
      root.get().node.program.body.unshift(hookVar);
    }
  }

  // Replace JSX onChange={handleImageUpload} -> onChange={handleFileSelect}
  root
    .find(j.JSXAttribute, { name: { name: "onChange" } })
    .filter(
      (path) =>
        path.node.value?.expression?.type === "Identifier" &&
        path.node.value.expression.name === "handleImageUpload"
    )
    .forEach((path) => {
      path.get("value").get("expression").replace(j.identifier("handleFileSelect"));
    });

  // Replace document.getElementById('...')?.click() with fileInputRef.current?.click()
  root
    .find(j.CallExpression, {
      callee: {
        type: "MemberExpression",
        property: { name: "click" },
      },
    })
    .forEach((path) => {
      const callee = path.node.callee;
      if (callee.object?.type === "OptionalCallExpression") return; // skip odd patterns
      // look for MemberExpression: document.getElementById(...).click
      if (
        callee.object?.type === "CallExpression" &&
        callee.object.callee.type === "MemberExpression"
      ) {
        const mem = callee.object.callee;
        if (mem.object?.name === "document" && mem.property?.name === "getElementById") {
          // replace the entire call expression with optional chaining on ref
          j(path).replaceWith(
            j.callExpression(
              j.memberExpression(
                j.optionalMemberExpression(
                  j.memberExpression(j.identifier("fileInputRef"), j.identifier("current")),
                  j.identifier("click"),
                  true
                ),
                [],
                false
              ),
              []
            )
          );
        }
      }
    });

  return root.toSource({ quote: "single" });
};
