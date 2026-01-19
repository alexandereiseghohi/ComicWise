# 🚀 ComicWise - Complete Project Setup & Scaffolding Guide

---

## **Comprehensive setup guide for ComicWise - a modern web comic platform built with Next.js 16, PostgreSQL, Redis, and AI-powered features.**

## Read And understand __/*.ts, @__/_.tsx, @**/_.mjs, @__/*.json , @__/_.mts, @**/_.json @__/*.md, @__/_.txt,   @**/_.yml,   @__/*.ps1, @__/_.sh, @**/_/Dockerfile, @src, @scripts  files to get context on how the project is structured and works, After fully understanding the project the package manager is pnpm  and the system is windows, Request all permissions needed to complete all tasks as listed below.
Confirm if I have the necessary permissions to complete all tasks as listed below, after confirming that you have the necessary permissions to Complete all tasks as listed below the bests way you recommend, Respond with "I have the necessary permissions to complete all tasks." and then proceed to complete all tasks as listed below  (use PowerShell syntax, Create, Optimize and Validate if exists copy file to end with .backup and Create, Optimize and Validate an enhanced version of each file mentioned, used in the tasks, never create summary, take into consideration Model call failed: {"message":"Sorry, you have exceeded your Copilot token usage. Please review our [Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service).","code":"rate_limited"}).

Tasks:

```sh
1 - Setup the project by installing all dependencies using pnpm, setting up the database, and configuring any necessary environment variables at @.env.local, importing it at @src/lib/env.ts use @src/lib/env.ts to Optimize @appConfig.ts (ensure all environment variables are properly set and configured for development and production environments update all usage of this file across the project).
2 - Create, Optimize and Validate if exists copy file to end with .backup and Create, Optimize and Validate an enhanced version of @src/database/seed/**/*  to be faster (ensure all data from @users.json, @comics.json, @comicsdata1.json, @comicsdata2.json, @chapters.json, @chaptersdata1.json, @chaptersdata2.json are validated using zod schemas and  then inserted into the database an onConflictDoUpdate of the inserted data with all its  chapters images, comics images, genres, inserted into the database an onConflictDoUpdate of the inserted data make sure no image is being downloaded twice by only downloading the image file if the file does not exists in the file system, using  @src/services/imageService.ts,   save the comic images at @/public/comics/${comic.slug} set ./public/placeholder-comic.jpg as the default fallback image, if a user image isnt available, save the comic images at @/public/comics/${comic.slug}/chapters/${chapter.slug} ,set ./public/shadcn.jpg as the default fallback image  if a user image isnt available, use nextjs@latest best practices and do not repeat yourself practices, ensure it has a comprehensive logging with clear, concise descriptions,  and update all usage of this files across the project).
3 - Run pnpm  db:seed and fix all its errors and warnings.
4 - Create, Optimize and Validate all comprehensive configurations listed below if exists copy file to end with .backup and Create, Optimize and Validate an enhanced version of the following files:
```

- @.vscode/mcp.json
- @.vscode/extensions.json
- @.vscode/launch.json
- @.vscode/tasks.json
- @.vscode/settings.json

1 - Create, Optimize and Validate a script to Setup and Configure Drizzle ORM with PostgreSQL including connection settings, migrations, and schema definitions ensure the configuration is optimized for performance and scalability.
5 - Create, Optimize and Validate a comprehensive @.github/workflows/*.yml files for ci, automating the testing, building, and deployment of the project.
6 - Create, Optimize and Validate a script to Analyze the project for performance bottlenecks, security vulnerabilities, and code quality issues generate a report with findings and suggestions for improvements.
7 - Create, Optimize and Validate a script to Generate comprehensive documentation for the project including setup instructions, usage guidelines, and API references ensure the documentation is clear, concise, and easy to navigate.
8 - Create, Optimize and Validate a script to Set up automated testing for the project including unit tests, integration tests, and end-to-end tests ensure tests are well-structured and provide adequate coverage for critical components.
9 - Fix all typescript, linting errors and warnings in the project.
10 - Create, Optimize and Validate if exists copy file to end with .backup and Create, Optimize and Validate an enhanced version of  @scripts/projectCleanup2025.ts to Perform a cleanup of the project,Delete all  duplicate or unused zod schemas, Delete all  duplicate or unused components,functions, types, interfaces and classes, Delete unused,duplicate,empty folders, blank files, Delete all backup files, Uninstall all unused packages with pnpm, Run the created scripts.
11 - Create, Optimize and Validate a comprehensive README.md for the project that includes setup instructions, usage guidelines, contribution instructions, and any other relevant information.
12 - Create, Optimize and Validate a comprehensive @.github/prompts/Setup.prompt.md if exists update the file  with all the content,tasks, tasks, recommendations from @.md, @.txt, @.ts, @.tsx, @.mjs, @.json , @.mts, @.json @.yml  @.ps1 @.sh @Dockerfile files  as Github copilot cli Prompts for a complete setup of this project and scaffolding all necessary files, components, pages and codes  setup handler for long running functions, setup any other recommended prompts.
13 - Repo Health & TypeScript Validation Ensure clean builds and type safety
14 - Database Setup & Schema Ensure database schema with Drizzle ORM is properly configured
15 - Environment Variables & App Config Centralize and validate all environment variables
16 - Auth Wiring (NextAuth v5 + Drizzle) Complete authentication setup with NextAuth and Drizzle adapter
17 - Image Upload Integration Unified image upload with Cloudinary/ImageKit/Local support
18 - Database Seeding with Realistic Data Populate test database with sample data
19 - Advanced Email Notifications Workflow-based email notifications for user actions
20 - Complete Admin Dashboard Finish admin CRUD pages and analytics
21 - Full-Text Search Implementation Enable powerful search across comics and chapters
22 - Performance Optimization Implement caching and query optimization
23 - Testing Suite Achieve 80%+ code coverage with unit and E2E tests
24 - CI/CD Pipeline Automate testing and deployment
25 - Docker & Deployment -ready containerization
26 - Documentation Complete project documentation
27 - Enhanced Admin Features Analytics, filtering, file manager, multi-step forms
28 - User Profile Customization Avatars, bios, social links
29 - Social Features Comments, ratings, favorites, reading lists
30 - Mobile Responsiveness & PWA Ensure mobile-friendly design and PWA capabilities
31 - Accessibility Compliance WCAG 2.1 AA standards
32 - Security Enhancements OWASP Top 10 protections
33 - Analytics & Monitoring Integrate tools like Google Analytics and Sentry
34 - Internationalization (i18n) Multi-language support
35 - AI-Powered Features Integrate AI for recommendations, tagging, and content moderation
36 - Community & Support Features Forums, FAQs, support ticketing
37 - Regular Maintenance & Updates Keep dependencies and documentation up to date
38 - User Onboarding & Tutorials Guided tours and tutorials for new users
38 - Feedback Mechanism In-app feedback and surveys
39 - Scalability Planning Database indexing, load balancing, horizontal scaling
40 - Legal & Compliance Privacy policy, terms of service, GDPR compliance
41 - Get all @**/*.ts  files containing "use server" directive Check if DTO file exists if not Create DTO file with all its content optimized for performance and best practices update all usage of this file across the project.

Lastly After completing all tasks, respond with "All tasks have been completed successfully." and provide a summary of the changes made without including any code snippets. Then create a list of your recommendations for this project and await further instructions.
