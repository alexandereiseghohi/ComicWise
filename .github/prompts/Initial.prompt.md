---
title: ComicWise Project Setup - Complete Guide
version: 2.0.0
updated: 2025-12-29
platforms: Windows, Linux, macOS
packageManager: pnpm
framework: Next.js 16
---
---

# 🚀 ComicWise - Complete Project Setup & Scaffolding Guide

> **Comprehensive setup guide for ComicWise - a modern web comic platform built with Next.js 16, PostgreSQL, Redis, and AI-powered features.**

---
Read And understand @/**/*.ts, @/**/*.tsx, @/**/*.mjs, @/**/*.json , @/**/*.mts, @/**/*.json @/**/*.md, @/**/*.txt,   @/**/*.yml,   @/**/*.ps1, @/**/*.sh, @/**/*/Dockerfile, @/src, @scripts and the overall structure of the project.
After fully understanding the project the package manager is pnpm  and the system is windows, Request all permissions needed to complete all tasks.
Confirm if I have the necessary permissions to complete all tasks.
Complete all  tasks the bests way.
Tasks:
1 - Create, Optimize and Validate all comprehensive configurations listed below if exists copy file to end with .backup and Create, Optimize and Validate an enhanced version of the following files:
- @.vscode/mcp.json
- @.vscode/extensions.json
- @.vscode/launch.json
- @.vscode/tasks.json
- @.vscode/settings.json
2 - Create, Optimize and Validate if exists copy file to end with .backup and Create, Optimize and Validate an enhanced version of  @.env.local and @appConfig.ts file to ensure all environment variables are properly set and configured for development and production environments update all usage of this file across the project.
3 - Create, Create, Optimize and Validate if exists copy file to end with .backup and Create, Optimize and Validate an enhanced version of @src/database/seed/**/*.ts to be dynamic allowing the creation of data from  @users.json @chapters*.json @comics*.json, create and use all needed helpers at @src/database/seed/**/*.ts  to ensure the inserted data is being created or updated if it exists and  ensure all images are not being redownloaded by checking if they are already saved and  downloaded with @src/services/imageService.ts and saved at @public/uploads use best practices if not saved  download the images  use do not repeat yourself practices and  zod validation with all fields  from  @users.json @chapters*.json @comics*.json  update all usages across the project reference @src/database/seed/seeders/universalSeeder.ts as example.


After completing all the tasks above, perform the following additional tasks to further enhance the project:
1 - Create, Optimize and Validate if exists copy file to end with .backup and Create, Optimize and Validate an enhanced version of  all scripts at @/scripts to ensure they are efficient, well-documented, and follow best practices for maintainability and scalability update all usages across the project.
2 - Create and Run once created and validated a script to Analyze the project for performance bottlenecks, security vulnerabilities, and code quality issues generate a report with findings and suggestions for improvements.
3 - Create and Run once created and validated a script to Generate comprehensive documentation for the project including setup instructions, usage guidelines, and API references ensure the documentation is clear, concise, and easy to navigate.
4 - Create and Run once created and validated a script to Set up automated testing for the project including unit tests, integration tests, and end-to-end tests ensure tests are well-structured and provide adequate coverage for critical components.
5 - Create and Run once created and validated  a scripts to Perform a cleanup of the project which  prevent duplicates, deleting unused or duplecate files, functions, Delete all files that ends with .backup, Delete all unused Components,Scripts that are not being used.
6 - Uninstall all unused packages from @package.json.
7 - Create, Optimize and Validate a comprehensive @.github/workflows/*.yml files for ci, automating the testing, building, and deployment of the project.
8 - Create, Optimize and Validate a comprehensive @.github/prompts/Setup.prompt.md if exists update the file  with all the content,tasks, todos, recommendations from @.md, @.txt, @.ts, @.tsx, @.mjs, @.json , @.mts, @.json @.yml   @.ps1 @.sh @Dockerfile files  as Github copilot cli Prompts for a complete setup of this project and scaffolding all necessary files, components, pages and codes   setup handler for long running functions.
9 - Create, Optimize and Validate a comprehensive README.md for the project that includes setup instructions, usage guidelines, contribution instructions, and any other relevant information.
10 - Fix all linting errors
