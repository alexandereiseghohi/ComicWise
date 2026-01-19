import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const actionsDir = join(process.cwd(), "src", "lib", "actions");
const dtoDir = join(process.cwd(), "src", "dto");

// Files to keep
const utilsFiles = new Set(["utils.ts"]);

console.log("Migrating actions to DTO pattern...\n");

// Get all action files except utils
const actionFiles = readdirSync(actionsDir).filter((f) => f.endsWith(".ts") && !utilsFiles.has(f));

let migratedCount = 0;
const errors: string[] = [];

for (const file of actionFiles) {
  const baseName = file.replace(".ts", "");
  const dtoFileName = `${baseName}Dto.ts`;
  const dtoFilePath = join(dtoDir, dtoFileName);
  const actionFilePath = join(actionsDir, file);

  try {
    // Check if DTO file exists
    if (existsSync(dtoFilePath)) {
      const actionContent = readFileSync(actionFilePath, "utf-8");
      const dtoContent = readFileSync(dtoFilePath, "utf-8");

      // Merge: Add "use server" if missing, preserve exports
      let mergedContent = dtoContent;

      if (!dtoContent.includes('"use server"') && !dtoContent.includes("'use server'")) {
        mergedContent = '"use server";\n\n' + dtoContent;
      }

      // Extract exports from action file and add them if not present
      const exportMatches = actionContent.match(/export (async )?function \w+/g) || [];

      if (exportMatches.length > 0) {
        // Add reference comment
        if (!mergedContent.includes("// Exported functions from")) {
          mergedContent += `\n// Exported functions from ${file}\n`;
          mergedContent += `// Re-export all functions from the original actions file\n`;
          mergedContent += `export * from "../actions/${baseName}";\n`;
        }
      }

      writeFileSync(dtoFilePath, mergedContent);
      console.log(`✓ Updated DTO: ${dtoFileName}`);
      migratedCount++;
    } else {
      errors.push(`DTO file not found: ${dtoFileName}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Error processing ${file}: ${errorMessage}`);
  }
}

console.log(`\n✓ Migration complete: ${migratedCount} files updated`);

if (errors.length > 0) {
  console.log("\n⚠ Errors:");
  errors.forEach((err) => console.log(`  - ${err}`));
}

console.log("\nNext steps:");
console.log("1. Review DTO files in src/lib/dto");
console.log("2. Update imports to use DTO files");
console.log("3. Remove old action files after verification");
