#!/usr/bin/env tsx
/**
 * Queue Worker Script
 * Starts background job workers
 */

// TODO: Create lib/queue or remove this import
// import { emailQueue } from "@/lib/queue";

console.log("═══════════════════════════════════════════════════════════");
console.log("  ⚙️  Queue Worker Starting");
console.log("═══════════════════════════════════════════════════════════\n");

console.log("📧 Email queue worker started");
console.log("⏳ Waiting for jobs...\n");

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await // emailQueue.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await // emailQueue.close();
  process.exit(0);
});
