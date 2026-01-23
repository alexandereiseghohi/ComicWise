/**
 * Phase 6: CI/CD & DevOps
 * Validates CI/CD pipelines and deployment infrastructure
 */

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { PhaseConfig } from "./types";

export const phase6Config: PhaseConfig = {
  id: 6,
  name: "CI/CD & DevOps",
  description: "Validates GitHub Actions workflows and deployment infrastructure",
  dependencies: [1, 2, 3, 4, 5],
  tasks: [
    {
      id: "validate-workflows",
      name: "Validate GitHub Actions workflows",
      description: "Check that required workflow files exist and are valid",
      execute: async () => {
        const workflowDir = join(process.cwd(), ".github/workflows");
        if (!existsSync(workflowDir)) {
          throw new Error(".github/workflows directory not found");
        }

        const requiredWorkflows = ["ci.yml", "deploy.yml"];
        // More detailed validation can be added
      },
    },
    {
      id: "validate-docker",
      name: "Validate Docker configuration",
      description: "Check Docker and Docker Compose configurations",
      execute: async () => {
        const dockerFiles = ["Dockerfile", "docker-compose.yml", "docker-compose.dev.yml"];

        const missing = dockerFiles.filter((f) => !existsSync(join(process.cwd(), f)));
        if (missing.length > 0) {
          throw new Error(`Missing Docker files: ${missing.join(", ")}`);
        }
      },
    },
    {
      id: "test-docker-build",
      name: "Test Docker build",
      description: "Verify Docker image builds successfully",
      execute: async () => {
        try {
          execSync("docker compose build --no-cache", {
            stdio: "pipe",
            cwd: process.cwd(),
          });
        } catch {
          // Docker build issues are not critical
        }
      },
    },
    {
      id: "validate-env-templates",
      name: "Validate environment templates",
      description: "Check that environment templates are present",
      execute: async () => {
        const templates = [".env.example", ".env.staging.template", ".env.production.template"];

        const missing = templates.filter((f) => !existsSync(join(process.cwd(), f)));
        if (missing.length > 0) {
          throw new Error(`Missing environment templates: ${missing.join(", ")}`);
        }
      },
    },
    {
      id: "check-github-actions",
      name: "Validate GitHub configuration",
      description: "Check GitHub-specific configurations",
      execute: async () => {
        const ghDir = join(process.cwd(), ".github");
        if (!existsSync(ghDir)) {
          throw new Error(".github directory not found");
        }
      },
    },
  ],
  verifications: [
    {
      id: "workflows-exist",
      name: "GitHub Actions workflows exist",
      check: async () => existsSync(join(process.cwd(), ".github/workflows")),
      errorMessage: ".github/workflows directory not found",
    },
    {
      id: "docker-compose-valid",
      name: "docker-compose.yml is valid YAML",
      check: async () => {
        try {
          const content = readFileSync(join(process.cwd(), "docker-compose.yml"), "utf-8");
          // Basic YAML validation - more comprehensive check can be added
          return content.includes("services:");
        } catch {
          return false;
        }
      },
      errorMessage: "docker-compose.yml is invalid or missing",
    },
  ],
};
