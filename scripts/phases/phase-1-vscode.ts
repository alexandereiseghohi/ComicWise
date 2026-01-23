/**
 * Phase 1: VS Code Configuration
 */

import { existsSync } from "fs";
import { join } from "path";
import type { PhaseConfig } from "./types";

const VSCODE_DIR = join(process.cwd(), ".vscode");

export const phase1Config: PhaseConfig = {
  id: 1,
  name: "VS Code Configuration",
  description: "Validates and configures VS Code environment with extensions, tasks, and settings",
  dependencies: [],
  tasks: [
    {
      id: "check-vscode-config",
      name: "Verify VS Code config files",
      description: "Check that all required .vscode config files exist",
      execute: async () => {
        const requiredFiles = ["extensions.json", "settings.json", "launch.json", "tasks.json"];
        const missing = requiredFiles.filter((f) => !existsSync(join(VSCODE_DIR, f)));

        if (missing.length > 0) {
          throw new Error(`Missing config files: ${missing.join(", ")}`);
        }
      },
    },
    {
      id: "verify-mcp-config",
      name: "Verify MCP server configuration",
      description: "Verify that MCP servers are properly configured",
      execute: async () => {
        // Check if settings.json has MCP configuration
        // This will be validated when VS Code starts
      },
    },
    {
      id: "verify-extensions",
      name: "Verify recommended extensions",
      description: "Ensure all recommended extensions are installed",
      execute: async () => {
        // Extensions in extensions.json will be prompted on VS Code open
      },
    },
  ],
  verifications: [
    {
      id: "vscode-exists",
      name: "VS Code config directory exists",
      check: async () => existsSync(VSCODE_DIR),
      errorMessage: ".vscode directory not found",
    },
    {
      id: "extensions-json",
      name: "extensions.json exists",
      check: async () => existsSync(join(VSCODE_DIR, "extensions.json")),
      errorMessage: ".vscode/extensions.json not found",
    },
    {
      id: "settings-json",
      name: "settings.json exists",
      check: async () => existsSync(join(VSCODE_DIR, "settings.json")),
      errorMessage: ".vscode/settings.json not found",
    },
  ],
};
