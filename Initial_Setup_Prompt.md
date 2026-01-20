---
authentication: NextAuth.js v5
cache: Redis (Upstash)
database: PostgreSQL 16 (Drizzle ORM)
deployment: Vercel, Docker
forms: React Hook Form
framework: Next.js 16
monitoring: Sentry
packageManager: pnpm
platforms: Windows, Linux, macOS
state: Zustand, Jotai
testing: Vitest, Playwright
title: ComicWise - Ultimate GitHub Copilot Setup Prompt
ui: Tailwind CSS 4.1, shadcn/ui
updated: 2026-01-19T00:00:00Z
validation: Zod
version: 5.0.0
---

# 🚀 ComicWise - Complete GitHub Copilot Setup Prompt

> **Ultimate comprehensive setup guide integrating ALL tasks, recommendations, and best practices from the entire ComicWise project documentation. Use these GitHub Copilot prompts to scaffold and complete a production-ready web comic platform.**

---

## 📖 Quick Navigation

- [Phase 0: Prerequisites & Understanding](#phase-0-prerequisites--understanding)
- [Phase 1: Development Environment Setup](#phase-1-development-environment-setup)
- [Phase 2: Configuration & Infrastructure](#phase-2-configuration--infrastructure)
- [Phase 3: Core Components & Utilities](#phase-3-core-components--utilities)
- [Phase 4: Authentication System](#phase-4-authentication-system)
- [Phase 5: User Profile System](#phase-5-user-profile-system)
- [Phase 6: Admin Panel Complete](#phase-6-admin-panel-complete)
- [Phase 7: Comics & Chapters System](#phase-7-comics--chapters-system)
- [Phase 8: Bookmarks & Reading](#phase-8-bookmarks--reading)
- [Phase 9: Root Pages & Homepage](#phase-9-root-pages--homepage)
- [Phase 10: Database & Seeding](#phase-10-database--seeding)
- [Phase 11: State Management](#phase-11-state-management)
- [Phase 12: Refactoring & Optimization](#phase-12-refactoring--optimization)
- [Phase 13: Scripts & CLI](#phase-13-scripts--cli)
- [Phase 14: Testing Suite](#phase-14-testing-suite)
- [Phase 15: CI/CD & Deployment](#phase-15-cicd--deployment)
- [Phase 16: Final Validation](#phase-16-final-validation)

---

## 🎯 Phase 0: Prerequisites & Understanding

### GitHub Copilot Prompt: Project Context Understanding

```md
Read and deeply understand the following files to grasp the complete project architecture:

Core Files:
@/**/*.ts @/**/*.tsx @/**/*.mjs @/**/*.json @/**/*.md @/**/*.txt @/**/*.yml @/**/*.ps1 @/**/*.sh @/**/Dockerfile

Key Directories:
@/src - Source code (app, components, lib, database, stores, schemas, types)
@/scripts - Utility scripts and CLI tools
@/docs - Documentation files
@/public - Static assets
@/tests - Test files

Package Manager: pnpm (required)
Operating System: Windows (PowerShell), Linux/macOS (Bash)
Node.js: 20.x or higher
PostgreSQL: 16.x or higher
Redis: Latest (Upstash)

After understanding, REQUEST ALL NECESSARY PERMISSIONS to:
1. Create, modify, and delete files and folders
2. Install and uninstall packages
3. Run scripts and commands
4. Access database and perform migrations
5. Commit changes to version control
6. Deploy to remote servers
7. Use AI-powered refactoring tools (jscodeshift, ts-morph)

CONFIRM PERMISSIONS before proceeding.

```

### Core Principles (Apply to ALL Tasks)

```csv
For ALL implementations, ensure:

1. DRY (Don't Repeat Yourself) - Create reusable components and functions
2. Type Safety - Use specific types, avoid 'any', leverage generics
3. Performance First - Optimize for speed, use caching, lazy loading
4. Security - Validate inputs, protect routes, sanitize data
5. Accessibility - ARIA labels, keyboard navigation, screen reader support
6. Error Handling - Comprehensive try-catch, user-friendly messages
7. Logging - Clear, concise logs for debugging and monitoring
8. Testing - Write tests alongside implementation
9. Documentation - Self-documenting code with JSDoc where needed
10. Best Practices - Follow Next.js 16, React 19, TypeScript 5 conventions
11. For all failed Create or Edit delete the existing file and retry
```

---

## 🔧 Phase 1: Development Environment Setup

### GitHub Copilot Prompt: VS Code Configuration

```md
Create and optimize VS Code configuration files for the ComicWise Next.js 16 project:

TASK 1.1: Create .vscode/mcp.json
- Configure MCP servers for Next.js, TypeScript, PostgreSQL, Redis, AI development
- Add server configurations for development tools
- Include environment-specific settings
- Create verification script at scripts/verify-mcp-servers.ps1

TASK 1.2: Create .vscode/extensions.json
- Recommend extensions: ESLint, Prettier, Tailwind CSS IntelliSense, TypeScript, PostgreSQL, Redis
- Next.js specific extensions
- Testing and debugging tools
- Create installation script at scripts/install-vscode-extensions.ps1

TASK 1.3: Create .vscode/launch.json
- Debug configurations for Next.js app
- TypeScript debugging setup
- Server actions debugging
- Database query debugging
- Test debugging configurations

TASK 1.4: Create .vscode/tasks.json
- Build tasks (dev, build, start)
- Test tasks (unit, e2e, coverage)
- Database tasks (migrate, seed, studio)
- Lint and format tasks
- Deployment tasks

TASK 1.5: Create .vscode/settings.json
- TypeScript configuration
- ESLint and Prettier settings
- File associations
- Editor configurations
- Extension-specific settings
- Path IntelliSense for aliases (@/)
- Optimize for both development and production

Ensure all configurations work seamlessly with the existing Next.js 16 + TypeScript + Drizzle ORM + Tailwind CSS 4.1 stack.

```

---

## ⚙️ Phase 2: Configuration & Infrastructure

### GitHub Copilot Prompt: Configuration Files Optimization

```md
Optimize and validate all configuration files for the ComicWise project:

TASK 2.1: Optimize next.config.ts
- Image optimization (domains, formats, sizes)
- Build optimization (SWC, minification)
- Environment variables handling
- Redirects and rewrites
- Headers configuration (security, caching)
- Experimental features (serverActions, typedRoutes)
- Output configuration for Vercel/Docker

TASK 2.2: Optimize nextSitemap.config.ts
- Sitemap generation for all routes
- Robot.txt configuration
- Dynamic routes inclusion (/comics/[slug], /comics/[slug]/[chapterNumber])
- Exclude admin and auth routes
- SEO optimization

TASK 2.3: Optimize package.json
- Scripts organization (dev, build, test, lint, db, deploy)
- Dependencies cleanup
- Version management
- Add scripts for all project operations
- Scripts for @scripts directory integration

TASK 2.4: Optimize tsconfig.json
- Strict TypeScript settings
- Path aliases (@/, @/components, @/lib, etc.)
- Compiler options for Next.js 16
- Build configurations
- Include/exclude patterns

TASK 2.5: Optimize eslint.config.ts
- Next.js 16 ESLint rules
- TypeScript rules
- React/React Hooks rules
- Import ordering
- Unused imports detection
- Custom project rules

TASK 2.6: Optimize .prettierrc.ts
- Code formatting rules
- Consistent style across project
- Plugin configurations (tailwindcss)

TASK 2.7: Optimize postcss.config.mjs
- Tailwind CSS 4.1 configuration
- PostCSS plugins
- CSS optimization

TASK 2.8: Update .gitignore
- Ignore build artifacts (.next, out, dist)
- Environment files (.env.local, .env*.local)
- Dependencies (node_modules)
- IDE files (.vscode/*.local)
- Test coverage reports
- Logs and temporary files

TASK 2.9: Create .dockerignore
- Exclude unnecessary files from Docker builds
- Optimize Docker image size

TASK 2.10: Create .prettierignore
- Exclude generated files
- Build outputs
- Dependencies

```

### GitHub Copilot Prompt: Environment Variables

```md
TASK 2.11: Create comprehensive environment configuration

Create .env.example with all required variables:
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/comicwise
DATABASE_DIRECT_URL=postgresql://user:password@localhost:5432/comicwise

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Custom
CUSTOM_PASSWORD=SecurePassword123!

# Upload Storage
NEXT_PUBLIC_UPLOAD_DIR=/uploads

# Sentry (Optional)
SENTRY_DSN=...
SENTRY_ORG=...
SENTRY_PROJECT=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# GitHub OAuth
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

Create src/lib/env.ts:
- Import and validate all environment variables with Zod
- Type-safe environment access
- Runtime validation
- Export typed env object

Create/Update appConfig.ts:
- Centralized configuration
- Use src/lib/env.ts for environment variables
- Export typed configuration object
- Include app metadata, features, limits, etc.
- Update all usages across the project

```

---

## 🧩 Phase 3: Core Components & Utilities

### GitHub Copilot Prompt: Generic Reusable Components

```md
Create a comprehensive set of generic, reusable components following DRY principles:

TASK 3.1: Create src/components/shared/GenericForm.tsx
Generic form component with:
- Zod schema validation
- React Hook Form integration
- Type-safe props using generics
- Loading states with useTransition
- Error handling with toast notifications
- Success feedback
- Submit and Cancel buttons
- Custom className support
- Form reset on success

TASK 3.2: Create src/components/shared/FormFields.tsx
Export reusable form field components:
- TextFormField (text, email, password, number, url)
- TextareaFormField
- SelectFormField (with options prop)
- CheckboxFormField
- RadioGroupFormField
- MultiSelectFormField
- DatePickerFormField
- FileUploadFormField (with preview)
- ImageUploadFormField (with drag & drop)

All fields should:
- Use react-hook-form's useFormContext
- Include label, description, placeholder
- Show validation errors
- Support accessibility (ARIA labels)

TASK 3.3: Create src/components/shared/GenericDataTable.tsx
Data table component with:
- @tanstack/react-table integration
- Sorting (column-based)
- Filtering (global and column-based)
- Pagination controls
- Search functionality
- Customizable columns
- Row actions (edit, delete, view)
- Loading and empty states
- Responsive design

TASK 3.4: Create src/components/shared/Pagination.tsx
Pagination component with:
- Current page indicator
- Total pages display
- Previous/Next buttons
- Page number links
- Configurable page size
- URL-based navigation

TASK 3.5: Create src/components/shared/LoadingSpinner.tsx
Loading states with various sizes and styles

TASK 3.6: Create src/components/shared/ErrorBoundary.tsx
Error boundary for graceful error handling

TASK 3.7: Create src/components/shared/ConfirmDialog.tsx
Confirmation dialog for destructive actions

All components should be:
- Fully typed with TypeScript
- Accessible (WCAG 2.1 AA)
- Responsive
- Using shadcn/ui primitives where applicable

```

---

## 🔐 Phase 4: Authentication System

### GitHub Copilot Prompt: Auth Schemas & Validation

```sql
TASK 4.1: Create src/schemas/authSchemas.ts

Define comprehensive Zod schemas:
- signUpSchema (name, email, password, confirmPassword, agreeToTerms)
- signInSchema (email, password, rememberMe optional)
- forgotPasswordSchema (email)
- resetPasswordSchema (password, confirmPassword)
- verifyEmailSchema (code - 6 digits)
- updateProfileSchema (name, email, bio, avatar optional)
- changePasswordSchema (currentPassword, newPassword, confirmPassword)

Include password strength validation:
- Minimum 8 characters
- Must contain uppercase, lowercase, number, special character

Export TypeScript types for each schema using z.infer

```

### GitHub Copilot Prompt: Auth Server Actions

```yaml
TASK 4.2: Create src/lib/actions/auth.ts

Implement server actions:
- signUpAction(data: SignUpInput)
  - Validate with signUpSchema
  - Check if user exists
  - Hash password with bcryptjs
  - Create user in database
  - Send verification email
  - Return success/error response

- signInAction(data: SignInInput)
  - Validate with signInSchema
  - Verify credentials with NextAuth
  - Check email verification
  - Handle session creation
  - Return success/error response

- signOutAction()
  - Clear session
  - Redirect to sign-in

- forgotPasswordAction(data: ForgotPasswordInput)
  - Validate email
  - Generate reset token
  - Send reset email
  - Return success/error

- resetPasswordAction(token: string, data: ResetPasswordInput)
  - Validate token
  - Hash new password
  - Update user password
  - Return success/error

- verifyEmailAction(code: string)
  - Verify code
  - Update user emailVerified
  - Return success/error

- resendVerificationAction(email: string)
  - Generate new code
  - Send email
  - Return success/error

All actions should:
- Use 'use server' directive
- Return { success: boolean; error?: string; data?: any }
- Handle errors gracefully
- Log important operations

```

### GitHub Copilot Prompt: Auth Pages

```md
TASK 4.3: Create complete authentication pages using GenericForm

Create src/app/(auth)/sign-up/page.tsx:
- Use GenericForm with signUpSchema
- Fields: name, email, password, confirmPassword, agreeToTerms
- Call signUpAction on submit
- Redirect to sign-in on success
- Link to sign-in page
- Social auth buttons (Google, GitHub) optional

Create src/app/(auth)/sign-in/page.tsx:
- Use GenericForm with signInSchema
- Fields: email, password, rememberMe
- Call signInAction on submit
- Redirect to homepage on success
- Links to forgot-password and sign-up
- Social auth buttons optional

Create src/app/(auth)/forgot-password/page.tsx:
- Use GenericForm with forgotPasswordSchema
- Field: email
- Call forgotPasswordAction on submit
- Show success message
- Link back to sign-in

Create src/app/(auth)/reset-password/page.tsx:
- Use GenericForm with resetPasswordSchema
- Fields: password, confirmPassword
- Get token from URL query params
- Call resetPasswordAction on submit
- Redirect to sign-in on success

Create src/app/(auth)/verify-email/page.tsx:
- Use GenericForm with verifyEmailSchema
- Field: code (6-digit input)
- Call verifyEmailAction on submit
- Resend code button
- Success/error states

Create src/app/(auth)/layout.tsx:
- Auth pages layout
- Centered card design
- Logo and branding
- Responsive design

All pages should:
- Be client components ('use client')
- Use the shared GenericForm component
- Handle loading states
- Show toast notifications
- Be accessible and responsive

```

---

## 👤 Phase 5: User Profile System

### GitHub Copilot Prompt: Profile Schemas & Actions

```md
TASK 5.1: Create src/schemas/profileSchemas.ts

Define Zod schemas:
- updateProfileSchema (name, email, bio, avatar optional)
- changePasswordSchema (currentPassword, newPassword, confirmPassword)
- userSettingsSchema (emailNotifications, marketingEmails, darkMode, language)

TASK 5.2: Create src/lib/actions/profile.ts

Implement server actions:
- getUserProfile(userId: string)
  - Fetch user data
  - Get bookmark stats
  - Get reading stats
  - Return profile with stats

- updateProfileAction(data: UpdateProfileInput)
  - Get current user from session
  - Validate with updateProfileSchema
  - Update user in database
  - Revalidate profile page
  - Return success/error

- changePasswordAction(data: ChangePasswordInput)
  - Get current user
  - Verify current password
  - Hash new password
  - Update user
  - Return success/error

- updateSettingsAction(data: UserSettingsInput)
  - Update user settings
  - Return success/error

- deleteAccountAction()
  - Soft delete user account
  - Clear session
  - Return success/error

```

### GitHub Copilot Prompt: Profile Pages

```md
TASK 5.3: Create user profile pages

Create src/app/(root)/profile/page.tsx:
- Server component
- Get session with getServerSession
- Redirect to sign-in if not authenticated
- Fetch user profile with getUserProfile
- Display:
  - Avatar with AvatarImage component
  - Name and email
  - Bio
  - Stats cards (bookmarks, reading, completed)
  - Recent activity
- Edit Profile button linking to /profile/edit

Create src/app/(root)/profile/edit/page.tsx:
- Client component
- Use GenericForm with updateProfileSchema
- Fields: name, email, bio, avatar
- Prefill with current data
- Call updateProfileAction on submit
- Redirect to /profile on success
- Cancel button

Create src/app/(root)/profile/change-password/page.tsx:
- Client component
- Use GenericForm with changePasswordSchema
- Fields: currentPassword, newPassword, confirmPassword
- Call changePasswordAction on submit
- Show success message
- Redirect to /profile

Create src/app/(root)/profile/settings/page.tsx:
- Client component
- Use GenericForm with userSettingsSchema
- Toggle switches for notifications and preferences
- Language selector
- Theme toggle (dark mode)
- Call updateSettingsAction on submit
- Delete account section with confirmation

Create src/app/(root)/profile/layout.tsx:
- Profile layout with sidebar navigation
- Links: View Profile, Edit Profile, Change Password, Settings
- Highlight active link

```

---

## 🎨 Phase 6: Admin Panel Complete

### GitHub Copilot Prompt: Admin Schemas

```sql
TASK 6.1: Create src/schemas/adminSchemas.ts

Define Zod schemas for all database entities:

- comicSchema
  - title, slug, description
  - coverImage (URL), alternativeTitles (array)
  - status (enum: Ongoing, Completed, Hiatus, Cancelled)
  - authorId, artistId, typeId
  - genreIds (array of numbers)
  - rating, views, releaseYear

- chapterSchema
  - title, slug, chapterNumber
  - comicId
  - images (array of URLs)
  - publishedAt (date)
  - views

- genreSchema (name, slug, description)
- authorSchema (name, slug, bio, photo)
- artistSchema (name, slug, bio, photo)
- typeSchema (name, slug, description - e.g., Manga, Manhwa, Manhua)
- userAdminSchema (name, email, role, isActive)
- bookmarkSchema (userId, comicId, status, progress)

Export TypeScript types for all schemas

```

### GitHub Copilot Prompt: Admin Server Actions

```md
TASK 6.2: Create server actions for all admin entities

Create src/lib/actions/admin/comics.ts:
- getComics(filters?) - list with pagination
- getComic(id: number) - single comic
- createComicAction(data: ComicInput)
- updateComicAction(id: number, data: ComicInput)
- deleteComicAction(id: number)

Create src/lib/actions/admin/chapters.ts:
- getChapters(comicId?, filters?)
- getChapter(id: number)
- createChapterAction(data: ChapterInput)
- updateChapterAction(id: number, data: ChapterInput)
- deleteChapterAction(id: number)

Create similar action files for:
- src/lib/actions/admin/genres.ts
- src/lib/actions/admin/authors.ts
- src/lib/actions/admin/artists.ts
- src/lib/actions/admin/types.ts
- src/lib/actions/admin/users.ts
- src/lib/actions/admin/bookmarks.ts (view only)

All actions should:
- Check admin role from session
- Validate with Zod schemas
- Handle image uploads if applicable
- Use Drizzle ORM for database operations
- Return { success: boolean; error?: string; data?: any }
- Revalidate relevant pages

```

### GitHub Copilot Prompt: Admin CRUD Pages Template

```md
TASK 6.3: Create admin CRUD pages for ALL entities

For each entity (comics, chapters, genres, authors, artists, types, users, bookmarks):

Create src/app/admin/[entity]/page.tsx (List):
- Server component
- Check admin auth
- Fetch data with get[Entity]s
- Use GenericDataTable with columns
- Search functionality
- Filter options
- Create button linking to /admin/[entity]/create
- Edit and delete actions per row

Create src/app/admin/[entity]/create/page.tsx:
- Client component
- Use GenericForm with [entity]Schema
- All necessary form fields
- Call create[Entity]Action on submit
- Redirect to /admin/[entity] on success

Create src/app/admin/[entity]/[id]/edit/page.tsx:
- Client component
- Fetch entity data in useEffect
- Use GenericForm with prefilled data
- Call update[Entity]Action on submit
- Redirect to /admin/[entity] on success

Create src/app/admin/[entity]/[id]/page.tsx (View):
- Server component
- Display entity details
- Related data
- Edit and delete buttons

Create src/app/admin/[entity]/columns.tsx:
- Define table columns for GenericDataTable
- Use @tanstack/react-table ColumnDef
- Include actions column with edit/delete

SPECIFIC IMPLEMENTATIONS:

Admin Comics:
- src/app/admin/comics/* (all CRUD pages)
- Multi-select for genres
- Selects for author, artist, type
- Image upload for cover
- Slug auto-generation from title

Admin Chapters:
- src/app/admin/chapters/* (all CRUD pages)
- Select for comic
- Multiple image uploads with reordering
- Chapter number auto-increment

Admin Genres, Authors, Artists, Types:
- Simple CRUD with name, slug, description
- Image upload for authors/artists

Admin Users:
- List, view, edit only (no create/delete)
- Role management
- Account activation toggle

Admin Bookmarks:
- View only (list with filters)
- User and comic information

```

### GitHub Copilot Prompt: Admin Layout & Dashboard

```md
TASK 6.4: Create admin layout and dashboard

Create src/app/admin/layout.tsx:
- Admin layout with sidebar navigation
- Navigation links for all entities
- User menu with logout
- Breadcrumbs
- Role-based access control
- Responsive design (collapsible sidebar)

Create src/app/admin/page.tsx (Dashboard):
- Server component
- Statistics cards:
  - Total comics
  - Total chapters
  - Total users
  - Recent bookmarks
- Charts (optional):
  - Comics by status
  - User registrations over time
  - Most popular comics
- Recent activity feed
- Quick actions

Create src/components/admin/AdminSidebar.tsx:
- Reusable sidebar component
- Navigation items with icons
- Active state highlighting
- Collapsible on mobile

Create src/components/admin/StatsCard.tsx:
- Reusable stats card component
- Icon, title, value, change percentage

```

---

## 📚 Phase 7: Comics & Chapters System

### GitHub Copilot Prompt: Comics Listing & Filters

```hs
TASK 7.1: Create comics listing page with advanced filters

Create src/app/(root)/comics/page.tsx:
- Server component
- Get searchParams (page, genre, status, sort, search)
- Fetch comics with getComics(filters)
- Display with ComicCard grid (3-4 columns responsive)
- Include ComicFilters component
- Pagination component
- SEO metadata

Create src/components/comics/ComicCard.tsx:
- Comic preview card
- Cover image with Next Image
- Title (line-clamp-2)
- Genres badges (first 2-3)
- Status badge
- Rating display
- Link to /comics/[slug]
- Hover effects
- Skeleton loading state

Create src/components/comics/ComicFilters.tsx:
- Client component
- Filter by genre (multi-select)
- Filter by status (select)
- Filter by type (select)
- Sort by (Latest, Popular, Rating, Title A-Z, Title Z-A)
- Search input
- Clear filters button
- Update URL params on change
- Responsive design (drawer on mobile)

Create src/lib/actions/comics.ts:
- getComics(filters: { page?, genre?, status?, sort?, search? })
  - Build dynamic query with Drizzle
  - Include joins for author, artist, genres, type
  - Pagination (20 per page)
  - Return { comics, total, page, totalPages }

- getComicBySlug(slug: string)
  - Fetch comic with all relations
  - Include chapters (sorted by number)
  - Increment view count
  - Return comic or null

```

### GitHub Copilot Prompt: Comic Details Page

```md
TASK 7.2: Create comic details page with bookmark functionality

Create src/app/(root)/comics/[slug]/page.tsx:
- Server component
- Fetch comic with getComicBySlug(slug)
- Get user session
- Check bookmark status with checkBookmarkStatus
- Display:
  - Large cover image (aspect-ratio 2:3)
  - Title and alternative titles
  - Description
  - Metadata grid: Author, Artist, Status, Type, Rating, Views, Year
  - Genre badges (all)
  - BookmarkActions component (if authenticated)
  - Chapters list with ChapterList component
  - Related comics carousel
  - Comments section (optional)
- SEO metadata (Open Graph, Twitter Cards)

Create src/components/comics/BookmarkActions.tsx:
- Client component
- Props: comicId, comicSlug, isBookmarked, initialStatus?
- State: bookmarked, status, isPending
- If not bookmarked: Show dropdown to add with status selection
  - Options: Reading, Plan to Read, Completed, Dropped
  - Call addToBookmarksAction on selection
- If bookmarked: Show status dropdown + Remove button
  - Change status calls updateBookmarkStatusAction
  - Remove button calls removeFromBookmarksAction
  - Confirm before removing
- Optimistic UI updates
- Toast notifications
- Icons: BookmarkIcon, BookmarkFilledIcon, ChevronDownIcon

Create src/lib/actions/bookmarks.ts:
- addToBookmarksAction(data: { comicId, status })
  - Get user from session
  - Create bookmark
  - Revalidate pages
  - Return success/error

- removeFromBookmarksAction(data: { comicId })
  - Get user from session
  - Delete bookmark
  - Revalidate pages
  - Return success/error

- updateBookmarkStatusAction(data: { comicId, status })
  - Update bookmark status
  - Revalidate pages
  - Return success/error

- checkBookmarkStatus(userId: string, comicId: number)
  - Return bookmark or null

- getUserBookmarks(userId: string, status?: string)
  - Fetch user bookmarks with comic data
  - Filter by status if provided
  - Return bookmarks array

```

### GitHub Copilot Prompt: Chapter Reader

```yaml
TASK 7.3: Create chapter reader with image gallery

Create src/app/(root)/comics/[slug]/[chapterNumber]/page.tsx:
- Server component
- Fetch chapter with getChapterBySlug(slug, chapterNumber)
- Get prev/next chapter info
- Track reading progress (server action)
- Display:
  - ChapterNavigation component
  - ChapterReader component
- Minimal UI (immersive reading experience)
- SEO metadata

Create src/components/chapters/ChapterNavigation.tsx:
- Client component
- Fixed top bar with:
  - Back button (to comic details)
  - Chapter dropdown selector
  - Previous chapter button
  - Next chapter button
  - Reading settings button
- Keyboard shortcuts (Arrow keys, ESC)
- Auto-hide on scroll down, show on scroll up

Create src/components/chapters/ChapterReader.tsx:
- Client component
- Props: images[], title, comicSlug, chapterNumber
- State: currentPage, zoom, viewMode, settings
- View modes:
  - Vertical (default): All images stacked with lazy loading
  - Horizontal: One image at a time with navigation arrows
- Features:
  - Swipe gestures (react-swipeable)
  - Zoom controls (50%-200%)
  - Keyboard navigation (arrows, page up/down, space)
  - Page counter
  - Progress bar
  - Lazy loading images
  - Reading settings panel:
    - View mode toggle
    - Background color picker
    - Image quality selector
  - Progress tracking (auto-save on scroll/page change)
- Use Zustand readerStore for settings persistence

Install and configure:
pnpm add react-swipeable yet-another-react-lightbox

Create src/components/chapters/ChapterList.tsx:
- List of chapters for a comic
- Chapter number, title, release date
- Read status indicator
- Last read marker
- Link to chapter reader
- Sort order toggle (asc/desc)

Create src/lib/actions/chapters.ts:
- getChapterBySlug(comicSlug: string, chapterNumber: string)
  - Fetch chapter with images
  - Get comic data
  - Get prev/next chapter info
  - Increment view count
  - Return chapter data

- trackReadingProgressAction(data: { chapterId, page, completed })
  - Save user reading progress
  - Update bookmark if exists
  - Return success/error

```

---

## 🔖 Phase 8: Bookmarks & Reading

### GitHub Copilot Prompt: Bookmarks System

```sql
TASK 8.1: Create bookmarks pages

Create src/app/(root)/bookmarks/page.tsx:
- Server component
- Get user session (redirect if not authenticated)
- Get searchParams (status filter)
- Fetch bookmarks with getUserBookmarks(userId, status)
- Display:
  - Page title and stats
  - BookmarkFilters component
  - ComicCard grid for bookmarked comics
  - Empty state if no bookmarks
- SEO metadata

Create src/components/bookmarks/BookmarkFilters.tsx:
- Client component
- Filter by status tabs:
  - All
  - Reading
  - Plan to Read
  - Completed
  - Dropped
- Display counts per status
- Update URL params on change

Create src/app/(root)/bookmarks/[id]/page.tsx (optional):
- Bookmark details page
- Comic information
- Reading progress
- Notes section
- Update status and progress
- Remove bookmark button

Create src/schemas/bookmarkSchemas.ts:
- createBookmarkSchema
- updateBookmarkSchema
- bookmarkStatusSchema

Bookmark statuses enum:
- Reading
- PlanToRead
- Completed
- Dropped
- OnHold

```

---

## 🏠 Phase 9: Root Pages & Homepage

### GitHub Copilot Prompt: Homepage & Root Pages

```md
TASK 9.1: Create homepage

Create src/app/(root)/page.tsx:
- Server component
- Fetch data:
  - Latest comics (6-8)
  - Popular comics (6-8)
  - Recently updated chapters (10-12)
  - Trending comics (6-8)
- Display sections:
  - Hero section (featured comic or carousel)
  - Latest comics grid
  - Popular comics grid
  - Recent chapters list
  - Trending comics grid
  - CTA section (Sign up if not authenticated)
- SEO metadata (Open Graph, JSON-LD)

Create src/app/(root)/layout.tsx:
- Root layout for public pages
- Header component
- Footer component
- Main content area
- Toast container

Create src/components/layout/Header.tsx:
- Site logo and name
- Navigation: Home, Comics, Genres (dropdown), About
- Search bar (expandable on mobile)
- User menu (if authenticated):
  - Profile
  - Bookmarks
  - Settings
  - Admin (if admin role)
  - Logout
- Sign In button (if not authenticated)
- Mobile menu (drawer)
- Responsive design

Create src/components/layout/Footer.tsx:
- Site information
- Links: About, Contact, Privacy Policy, Terms of Service
- Social media links
- Copyright notice

Create src/components/home/HeroSection.tsx:
- Featured comic carousel or static hero
- CTA buttons
- Responsive design

Create src/components/home/ComicSection.tsx:
- Reusable section component
- Title and "View All" link
- Comic cards grid
- Skeleton loading states

Create src/app/(root)/search/page.tsx:
- Search results page
- Get query from searchParams
- Search across comics and chapters
- Filter and sort options
- Results grid

```

---

## 💾 Phase 10: Database & Seeding

### GitHub Copilot Prompt: Database Seeding System Optimization

```md
TASK 10.1: Create optimized database seeding system

Create src/database/seed/helpers/validationSchemas.ts:
- Zod schemas for all seed data
- UserSeedSchema (validate fields from users.json)
- ComicSeedSchema (validate fields from comics*.json)
- ChapterSeedSchema (validate fields from chapters*.json)
- GenreSeedSchema, AuthorSeedSchema, ArtistSeedSchema, TypeSeedSchema
- Comprehensive field validation

Create src/database/seed/helpers/passwordHelper.ts:
- hashPassword(password: string): Promise<string>
  - Use bcryptjs to hash
- getDefaultPassword(): string
  - Return CUSTOM_PASSWORD from env

Create src/database/seed/helpers/imageDownloader.ts:
- downloadImage(url: string, destination: string): Promise<string>
  - Check if file exists in filesystem (return path if exists)
  - Check if URL exists in database (return path if exists)
  - Download image with retry logic (3 attempts)
  - Save with original filename and extension
  - Return saved path
- checkImageExists(url: string): Promise<boolean>
- checkFileExists(path: string): boolean
- getImageExtension(url: string): string
- saveImage(buffer: Buffer, path: string): Promise<void>

Create src/database/seed/helpers/seedLogger.ts:
- logOperation(message: string, data?: any): void
- logProgress(current: number, total: number, entity: string): void
- logSuccess(message: string): void
- logError(error: Error, context?: string): void
- Colorized console output
- Progress bars for batch operations

Create src/database/seed/helpers/batchProcessor.ts:
- processBatch<T>(items: T[], batchSize: number, processor: Function): Promise<void>
  - Process items in batches for performance
  - Show progress
  - Handle errors per batch
- chunkArray<T>(array: T[], size: number): T[][]

TASK 10.2: Create seeder files

Create src/database/seed/seeders/userSeeder.ts:
- Seed users from users.json
- Validate with UserSeedSchema
- Hash passwords with CUSTOM_PASSWORD
- Use default avatar: /shadcn.jpg
- onConflictDoUpdate for email uniqueness
- Log progress and errors

Create src/database/seed/seeders/comicSeeder.ts:
- Seed comics from comics.json, comicsdata1.json, comicsdata2.json
- Validate with ComicSeedSchema
- Download and save cover images to:
  - public/comics/covers/\${comic.slug}/
  - Use /placeholder-comic.jpg as fallback
- Create relationships: genres, author, artist, type
- onConflictDoUpdate for slug uniqueness
- Batch processing (50 comics at a time)
- Log progress and errors

Create src/database/seed/seeders/chapterSeeder.ts:
- Seed chapters from chapters.json, chaptersdata1.json, chaptersdata2.json
- Validate with ChapterSeedSchema
- Download and save chapter images to:
  - public/comics/chapters/\${comic.slug}/\${chapter.slug}/
- Maintain image order
- onConflictDoUpdate for slug uniqueness
- Batch processing (100 chapters at a time)
- Log progress and errors

Create similar seeders for:
- genreSeeder.ts
- authorSeeder.ts
- artistSeeder.ts
- typeSeeder.ts

TASK 10.3: Create main seeder

Create src/database/seed/index.ts:
- Import all seeders
- Execute in order:
  1. Types
  2. Genres
  3. Authors
  4. Artists
  5. Users
  6. Comics
  7. Chapters
- Wrap in transaction
- Handle errors gracefully
- Log overall progress
- Report summary (counts, time taken, errors)

Create src/database/seed/run.ts:
- CLI runner for seeder
- Support --dry-run flag (validate without inserting)
- Support --entity flag (seed specific entity only)
- Comprehensive logging
- Error reporting

Update package.json scripts:
- "db:seed": "tsx src/database/seed/run.ts"
- "db:seed:dry-run": "tsx src/database/seed/run.ts --dry-run"
- "db:seed:users": "tsx src/database/seed/run.ts --entity=users"
- etc.

REQUIREMENTS:
- Dynamic and fast (batch processing, parallel where possible)
- Validated onConflictDoUpdate for all entities
- Zod validation for all data
- Password encryption with bcryptjs
- Image download optimization (check before download)
- Comprehensive logging
- Dry-run capability
- Data integrity checks

```

---

## 🏪 Phase 11: State Management

### GitHub Copilot Prompt: Zustand Stores

```yaml
TASK 11.1: Create Zustand stores for global state management

Create src/stores/authStore.ts:
- User state (id, name, email, role, avatar)
- isAuthenticated boolean
- setUser(user | null)
- logout()
- Persist with zustand/middleware

Create src/stores/readerStore.ts:
- Reading settings:
  - viewMode: 'vertical' | 'horizontal'
  - zoom: number (50-200)
  - backgroundColor: string
  - imageQuality: 'low' | 'medium' | 'high'
  - autoAdvance: boolean
  - pageTransition: 'none' | 'fade' | 'slide'
- setViewMode, setZoom, setBackgroundColor, etc.
- reset() to defaults
- Persist settings

Create src/stores/bookmarkStore.ts:
- Bookmarks cache (for offline access)
- Recently viewed comics
- Reading history
- addBookmark, removeBookmark, updateBookmark
- getBookmarkByComicId
- Sync with server on changes
- Persist to localStorage

Create src/stores/searchStore.ts:
- Search history
- Recent searches
- Popular searches
- addSearch, clearHistory
- getRecentSearches
- Persist search history

Create src/stores/themeStore.ts:
- Theme mode: 'light' | 'dark' | 'system'
- Custom theme colors
- setTheme
- toggleTheme
- Persist theme preference

Create src/stores/notificationStore.ts:
- Notifications array
- Unread count
- addNotification, markAsRead, clearAll
- Fetch from server periodically

Create src/stores/uiStore.ts:
- Global UI state:
  - sidebarOpen: boolean
  - mobileMenuOpen: boolean
  - searchOpen: boolean
  - modal state
- toggleSidebar, toggleMobileMenu, etc.

All stores should:
- Use TypeScript for type safety
- Use zustand/middleware for persistence where needed
- Export typed hooks
- Include devtools integration (in development)

Install dependencies:
pnpm add zustand

Example usage in components documented in each store file

```

---

## 🔄 Phase 12: Refactoring & Optimization

### GitHub Copilot Prompt: AST-Based Refactoring

```md
TASK 12.1: Create AST-based refactoring scripts with ts-morph

Install ts-morph:
pnpm add -D ts-morph

Create scripts/codemods/refactorImports.ts:
- Use ts-morph to load project
- Find all relative imports (../, ../../, etc.)
- Replace with path aliases:
  - ../../../components → @/components
  - ../../lib → @/lib
  - etc.
- Save files
- Log changes made

Create scripts/codemods/removeDuplicates.ts:
- Detect duplicate functions by hashing code
- Detect duplicate Zod schemas
- Detect duplicate components
- Detect duplicate type definitions
- Report duplicates with file locations
- Option to auto-remove (with confirmation)

Create scripts/codemods/fixAnyTypes.ts:
- Find all 'any' type occurrences
- Attempt to infer type from usage context
- Suggest specific types or generic alternatives
- Report findings
- Option to auto-fix simple cases

Create scripts/codemods/optimizeImports.ts:
- Sort imports (built-in, external, internal, relative)
- Remove unused imports
- Combine imports from same module
- Format import statements

Create scripts/codemods/addJsDoc.ts:
- Add JSDoc comments to public functions
- Include @param, @returns, @throws
- Infer from TypeScript types

TASK 12.2: Run refactoring tasks

Create scripts/refactor-all.ts:
- Run all codemods in sequence
- Generate refactoring report
- Create backup before changes
- Rollback option if issues found

Update package.json:
- "refactor:imports": "tsx scripts/codemods/refactorImports.ts"
- "refactor:duplicates": "tsx scripts/codemods/removeDuplicates.ts"
- "refactor:types": "tsx scripts/codemods/fixAnyTypes.ts"
- "refactor:all": "tsx scripts/refactor-all.ts"

```

### GitHub Copilot Prompt: Code Cleanup

```yaml
TASK 12.3: Create cleanup scripts

Create scripts/cleanup/deleteDuplicates.ts:
- Delete all duplicate files
- Delete files ending with .backup
- Delete empty folders
- Delete unused components (not imported anywhere)
- Delete unused functions (not used anywhere)
- Generate cleanup report
- Dry-run mode

Create scripts/cleanup/uninstallUnusedPackages.ts:
- Analyze package.json dependencies
- Check actual imports in codebase
- Identify unused packages
- List packages to remove
- Option to auto-remove
- Dry-run mode

Create scripts/cleanup/optimizeFolderStructure.ts:
- Analyze current folder structure
- Suggest optimizations
- Move files to better locations
- Create missing folders
- Update imports after moves

Update package.json:
- "cleanup": "tsx scripts/cleanup/deleteDuplicates.ts"
- "cleanup:dry-run": "tsx scripts/cleanup/deleteDuplicates.ts --dry-run"
- "cleanup:packages": "tsx scripts/cleanup/uninstallUnusedPackages.ts"

```

---

## 📜 Phase 13: Scripts & CLI

### GitHub Copilot Prompt: Master CLI System

```md
TASK 13.1: Create comprehensive CLI for ComicWise platform

Install dependencies:
pnpm add commander inquirer chalk ora

Create scripts/cli/index.ts:
- Main CLI entry point
- Use commander for command structure
- Commands:
  - dev - Start development server
  - build - Build for production
  - start - Start production server
  - db - Database operations (seed, migrate, reset, studio)
  - test - Run tests (unit, e2e, coverage)
  - lint - Lint and format code
  - validate - Run all validations (type-check, lint, test)
  - deploy - Deploy to platform (vercel, docker)
  - analyze - Analyze project (bundle size, performance, security)
  - refactor - Run refactoring tasks
  - cleanup - Cleanup project
  - generate - Generate code scaffolds
  - docs - Generate documentation

Create scripts/cli/commands/dev.ts:
- Start development server
- Watch for changes
- Show QR code for mobile access
- Open browser automatically

Create scripts/cli/commands/db.ts:
- Subcommands: seed, migrate, reset, studio
- Interactive prompts for dangerous operations
- Dry-run options
- Progress indicators

Create scripts/cli/commands/test.ts:
- Run unit tests (vitest)
- Run e2e tests (playwright)
- Generate coverage report
- Watch mode

Create scripts/cli/commands/deploy.ts:
- Deploy to Vercel
- Deploy with Docker
- Environment selection (staging, production)
- Pre-deployment checks (build, test, lint)

Create scripts/cli/commands/analyze.ts:
- Bundle size analysis
- Performance metrics
- Security audit
- Code quality metrics
- Generate comprehensive report

Create scripts/cli/commands/generate.ts:
- Generate page (with template selection)
- Generate component (with type: page, client, server, shared)
- Generate API route
- Generate server action
- Generate Zod schema
- Generate test file
- Use templates from scripts/templates/

Create scripts/cli/utils/logger.ts:
- Colored console output with chalk
- Log levels (info, warn, error, success)
- Spinner with ora
- Progress bars

Create scripts/cli/utils/prompts.ts:
- Reusable inquirer prompts
- Confirmation prompts
- Selection prompts
- Input prompts

TASK 13.2: Add CLI to package.json

Add to package.json:
"bin": {
  "comicwise": "./scripts/cli/index.js"
}

Make CLI executable:
chmod +x scripts/cli/index.js

Add shebang to scripts/cli/index.ts:
#!/usr/bin/env node

Usage:
pnpm comicwise dev
pnpm comicwise db seed
pnpm comicwise test --coverage
pnpm comicwise deploy --platform vercel --env production

```

### GitHub Copilot Prompt: Script Organization

```ini
TASK 13.3: Organize all existing scripts

Create scripts/README.md:
- Document all scripts
- Usage examples
- Options and flags
- Troubleshooting

Organize scripts into categories:
scripts/
├── cli/           # Main CLI
├── codemods/      # AST-based refactoring
├── cleanup/       # Cleanup tasks
├── deploy/        # Deployment scripts
├── dev/           # Development utilities
├── db/            # Database scripts
├── test/          # Testing utilities
├── analyze/       # Analysis scripts
├── generate/      # Code generation
└── templates/     # Code templates

Update package.json scripts to use new CLI:
- "dev": "comicwise dev"
- "build": "comicwise build"
- "test": "comicwise test"
- etc.

```

---

## 🧪 Phase 14: Testing Suite

### GitHub Copilot Prompt: Testing Setup

```yaml
TASK 14.1: Set up comprehensive testing suite

Install testing dependencies:
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react
pnpm add -D @playwright/test

Create vitest.config.ts:
- Configure Vitest for React
- Setup test environment (jsdom)
- Path aliases
- Coverage configuration (c8)
- Test globals

Create playwright.config.ts:
- Configure browsers (chromium, firefox, webkit)
- Base URL
- Retry logic
- Screenshots on failure
- Video on failure
- Parallel execution

TASK 14.2: Write unit tests

Create src/__tests__/setup.ts:
- Global test setup
- Mock environment variables
- Mock Next.js router
- Mock authentication

Create tests for components:
src/components/__tests__/
├── shared/
│   ├── GenericForm.test.tsx
│   ├── GenericDataTable.test.tsx
│   └── FormFields.test.tsx
├── comics/
│   ├── ComicCard.test.tsx
│   └── BookmarkActions.test.tsx
└── ...

Create tests for server actions:
src/lib/actions/__tests__/
├── auth.test.ts
├── profile.test.ts
├── comics.test.ts
└── bookmarks.test.ts

Create tests for utilities:
src/lib/__tests__/
├── utils.test.ts
├── validation.test.ts
└── ...

Create tests for schemas:
src/schemas/__tests__/
├── authSchemas.test.ts
├── adminSchemas.test.ts
└── ...

TASK 14.3: Write E2E tests

Create tests/e2e/:
- auth.spec.ts (sign up, sign in, logout)
- profile.spec.ts (view, edit, change password)
- comics.spec.ts (browse, filter, view details)
- bookmarks.spec.ts (add, remove, update status)
- admin.spec.ts (CRUD operations)
- reader.spec.ts (chapter reading)

TASK 14.4: Testing best practices

All tests should:
- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names
- Mock external dependencies
- Test edge cases and error states
- Achieve 80%+ code coverage
- Run in isolation (no shared state)

Update package.json:
- "test:unit": "vitest"
- "test:unit:run": "vitest run"
- "test:unit:coverage": "vitest run --coverage"
- "test:e2e": "playwright test"
- "test:e2e:ui": "playwright test --ui"
- "test": "pnpm test:unit:run && pnpm test:e2e"

```

---

## 🚀 Phase 15: CI/CD & Deployment

### GitHub Copilot Prompt: GitHub Actions Workflows

```yaml
TASK 15.1: Create CI/CD workflows

Create .github/workflows/ci.yml:
- Trigger on push and pull request to main/development
- Jobs:
  - lint (ESLint, Prettier check)
  - type-check (TypeScript)
  - test-unit (Vitest with coverage)
  - test-e2e (Playwright)
  - build (Next.js build)
- Upload coverage reports
- Comment PR with results
- Fail on errors

Create .github/workflows/cd.yml:
- Trigger on push to main (production) or development (staging)
- Jobs:
  - build-and-deploy:
    - Run tests
    - Build application
    - Deploy to Vercel (using vercel-action)
    - Run smoke tests
    - Notify on success/failure

Create .github/workflows/migrations.yml:
- Trigger manually or on database schema changes
- Jobs:
  - backup-database
  - run-migrations (drizzle-kit migrate)
  - seed-data (optional, staging only)
  - rollback-on-failure

Create .github/workflows/security.yml:
- Trigger weekly and on pull requests
- Jobs:
  - dependency-audit (npm audit)
  - code-scanning (CodeQL)
  - secrets-scanning
  - Report findings as issues

Create .github/workflows/performance.yml:
- Trigger on main branch changes
- Jobs:
  - lighthouse-audit
  - bundle-size-analysis
  - performance-metrics
  - Comment PR with results

TASK 15.2: Docker deployment

Create Dockerfile:
- Multi-stage build
- Base: node:20-alpine
- Install dependencies (pnpm)
- Build application
- Production stage (minimal)
- Optimize layers
- Security best practices (non-root user)

Create docker-compose.yml:
- Services:
  - app (Next.js)
  - postgres (database)
  - redis (cache)
- Volumes for persistence
- Networks
- Environment variables
- Health checks

Create docker-compose.dev.yml:
- Development configuration
- Hot reload volumes
- Debugging ports
- Development tools

Create .dockerignore:
- Exclude node_modules, .next, .git, etc.

Create scripts/docker-build.sh:
- Build Docker image
- Tag with version
- Push to registry

Create scripts/docker-deploy.sh:
- Pull latest image
- Stop old container
- Start new container
- Health check
- Rollback on failure

TASK 15.3: Vercel deployment

Create vercel.json:
- Build settings
- Environment variables
- Redirects
- Headers
- Regions

Create scripts/deploy-vercel.ts:
- Deploy using Vercel CLI
- Environment selection
- Pre-deployment checks
- Post-deployment verification

Update package.json:
- "deploy:vercel": "tsx scripts/deploy-vercel.ts"
- "deploy:docker": "sh scripts/docker-deploy.sh"

```

---

## ✅ Phase 16: Final Validation

### GitHub Copilot Prompt: Complete Validation & Checklist

```md
TASK 16.1: Run complete validation suite

Create scripts/validate-all.ts:
- Run in sequence:
  1. TypeScript type checking (tsc --noEmit)
  2. ESLint (all files)
  3. Prettier check (all files)
  4. Unit tests with coverage
  5. E2E tests
  6. Build check
  7. Security audit
  8. Performance check
  9. Accessibility audit
- Generate comprehensive report
- Exit with error code if any check fails

Run validation:
pnpm validate

TASK 16.2: Database validation

Run database seeding dry-run:
pnpm db:seed:dry-run

Fix all:
- Database errors
- Validation errors
- Data integrity warnings
- Ensure all validations pass

Run full seeding:
pnpm db:seed

Verify data integrity:
pnpm db:check

TASK 16.3: Final checklist

Verify all tasks completed:

VS Code & Development:
- [ ] .vscode/mcp.json configured
- [ ] .vscode/extensions.json configured
- [ ] .vscode/launch.json configured
- [ ] .vscode/tasks.json configured
- [ ] .vscode/settings.json configured

Configuration:
- [ ] next.config.ts optimized
- [ ] tsconfig.json optimized
- [ ] eslint.config.ts optimized
- [ ] .prettierrc.ts configured
- [ ] Environment variables set (.env.local)
- [ ] appConfig.ts created

Core Components:
- [ ] GenericForm component
- [ ] FormFields components
- [ ] GenericDataTable component
- [ ] Pagination component
- [ ] All shared components

Authentication:
- [ ] Auth schemas (authSchemas.ts)
- [ ] Auth server actions
- [ ] Sign up page
- [ ] Sign in page
- [ ] Forgot password page
- [ ] Reset password page
- [ ] Verify email page

User Profile:
- [ ] Profile schemas
- [ ] Profile server actions
- [ ] View profile page
- [ ] Edit profile page
- [ ] Change password page
- [ ] Settings page

Admin Panel:
- [ ] Admin schemas for all entities
- [ ] Admin server actions for all entities
- [ ] Comics CRUD pages
- [ ] Chapters CRUD pages
- [ ] Genres CRUD pages
- [ ] Authors CRUD pages
- [ ] Artists CRUD pages
- [ ] Types CRUD pages
- [ ] Users management pages
- [ ] Bookmarks view page
- [ ] Admin dashboard
- [ ] Admin layout

Comics & Chapters:
- [ ] Comics listing page
- [ ] Comic filters component
- [ ] Comic card component
- [ ] Comic details page
- [ ] Chapter reader page
- [ ] Chapter navigation component
- [ ] Chapter list component
- [ ] Bookmark actions component

Bookmarks:
- [ ] Bookmarks listing page
- [ ] Bookmark filters component
- [ ] Bookmark schemas
- [ ] Bookmark server actions

Root Pages:
- [ ] Homepage
- [ ] Root layout
- [ ] Header component
- [ ] Footer component
- [ ] Search page

Database:
- [ ] Seed helpers (validation, password, image, logger, batch)
- [ ] User seeder
- [ ] Comic seeder
- [ ] Chapter seeder
- [ ] Genre/Author/Artist/Type seeders
- [ ] Main seeder (index.ts)
- [ ] CLI runner (run.ts)
- [ ] Dry-run capability

State Management:
- [ ] Auth store
- [ ] Reader store
- [ ] Bookmark store
- [ ] Search store
- [ ] Theme store
- [ ] Notification store
- [ ] UI store

Refactoring:
- [ ] Import refactoring script
- [ ] Duplicate detection script
- [ ] Type fixing script
- [ ] Import optimization script

Scripts & CLI:
- [ ] Master CLI (scripts/cli/index.ts)
- [ ] CLI commands (dev, build, db, test, deploy, etc.)
- [ ] Cleanup scripts
- [ ] Analysis scripts
- [ ] Generate scripts

Testing:
- [ ] Vitest configuration
- [ ] Playwright configuration
- [ ] Unit tests for components
- [ ] Unit tests for server actions
- [ ] Unit tests for utilities
- [ ] E2E tests for all flows
- [ ] 80%+ code coverage

CI/CD:
- [ ] CI workflow (.github/workflows/ci.yml)
- [ ] CD workflow (.github/workflows/cd.yml)
- [ ] Migrations workflow
- [ ] Security workflow
- [ ] Performance workflow

Deployment:
- [ ] Dockerfile
- [ ] docker-compose.yml
- [ ] vercel.json
- [ ] Deployment scripts

Validation:
- [ ] All TypeScript errors fixed
- [ ] All ESLint errors fixed
- [ ] All ESLint warnings fixed (if possible)
- [ ] All tests passing
- [ ] Build successful
- [ ] No security vulnerabilities
- [ ] Performance optimized
- [ ] Accessibility compliant

Documentation:
- [ ] README.md updated
- [ ] API documentation
- [ ] Scripts documentation
- [ ] Setup guide
- [ ] Contributing guide

TASK 16.4: Performance audit

Run performance checks:
- Bundle size analysis: pnpm build:analyze
- Lighthouse audit: pnpm lighthouse
- Performance metrics: pnpm analyze:performance

Optimize as needed:
- Code splitting
- Image optimization
- Lazy loading
- Caching strategies

TASK 16.5: Security audit

Run security checks:
- Dependency audit: pnpm audit
- Code scanning: pnpm analyze:security
- Environment variables check
- Authentication flows verification

Fix all security issues found.

TASK 16.6: Generate final documentation

Run documentation generation:
pnpm docs:generate

Create comprehensive README.md:
- Project overview
- Features
- Tech stack
- Prerequisites
- Installation
- Configuration
- Running the app
- Testing
- Deployment
- Contributing
- License

Create CHANGELOG.md:
- Document all changes
- Version history

Create CONTRIBUTING.md:
- Contribution guidelines
- Code style
- Pull request process

TASK 16.7: Final deployment

Deploy to staging:
pnpm deploy --env staging

Run smoke tests on staging

Deploy to production:
pnpm deploy --env production

Verify production deployment

TASK 16.8: Success criteria

Verify all criteria met:
- ✅ All pages scaffolded and functional
- ✅ 100% TypeScript type safety (no 'any' types)
- ✅ All ESLint errors resolved
- ✅ All tests passing (unit + E2E)
- ✅ 80%+ code coverage
- ✅ Database seeding working correctly
- ✅ Generic components reused across application
- ✅ Zustand stores managing state efficiently
- ✅ AST-based refactoring completed
- ✅ Master CLI operational
- ✅ Folder structure optimized
- ✅ Production build successful
- ✅ Zero critical security vulnerabilities
- ✅ Lighthouse score > 90
- ✅ Deployed successfully
- ✅ Documentation complete

```

---

## 🎯 GitHub Copilot Workspace Prompts

### Quick Reference Prompts for GitHub Copilot

#### Prompt 1: Complete Project Setup

```md
Set up a complete ComicWise web comic platform using Next.js 16, TypeScript, PostgreSQL (Drizzle ORM), Redis, NextAuth.js v5, Tailwind CSS 4.1, and shadcn/ui. Follow DRY principles and create:

1. All authentication pages (sign-up, sign-in, forgot-password, reset-password, verify-email) with Zod schemas and React Hook Form
2. User profile pages (view, edit, change-password, settings)
3. Admin panel with CRUD for all entities (comics, chapters, genres, authors, artists, types, users, bookmarks)
4. Comics browsing (listing with filters, details with bookmark actions)
5. Chapter reader with image gallery and progress tracking
6. Bookmarks system (add, remove, update status)
7. Homepage with latest/popular comics
8. Generic reusable form components
9. Database seeding system with image downloads
10. Zustand stores for state management
11. Complete testing suite (Vitest + Playwright)
12. CI/CD workflows
13. Master CLI for all operations

Use path aliases (@/), optimize for performance, ensure accessibility, and maintain type safety throughout.

```

#### Prompt 2: Authentication System Only

```md
Create a complete authentication system for Next.js 16 with:
- Zod schemas (sign-up, sign-in, forgot-password, reset-password, verify-email)
- Server actions with NextAuth.js v5
- Generic form component with React Hook Form
- All auth pages using the generic form
- Password hashing with bcryptjs
- Email verification flow
- Social auth (Google, GitHub)
- Protected routes
- TypeScript types for all schemas

```

#### Prompt 3: Admin Panel Only

```yaml
Create a complete admin panel for managing comics with:
- CRUD pages for comics, chapters, genres, authors, artists, types, users
- Generic form component with Zod validation
- Generic data table with sorting, filtering, pagination
- Image upload functionality
- Drizzle ORM integration
- Role-based access control
- Admin layout with sidebar navigation
- Dashboard with statistics
- TypeScript throughout

```

#### Prompt 4: Comics & Reader System

```sql
Create a complete comics reading system with:
- Comics listing page with filters (genre, status, type) and search
- Comic details page with full information and bookmark actions
- Chapter reader with vertical/horizontal modes
- Image gallery with zoom and keyboard navigation
- Progress tracking
- Bookmark functionality (add, remove, update status)
- Related comics
- Responsive design
- Zustand store for reader settings

```

#### Prompt 5: Database Seeding System

```md
Create an optimized database seeding system with:
- Zod schemas for validation
- Image downloader with duplicate checks
- Batch processing for performance
- Progress logging
- Seed users with hashed passwords
- Seed comics with cover images (download to public/comics/covers/)
- Seed chapters with images (download to public/comics/chapters/)
- onConflictDoUpdate for all entities
- Dry-run capability
- CLI runner with options
- Comprehensive error handling

```

#### Prompt 6: State Management with Zustand

```sql
Create Zustand stores for:
- Authentication (user, isAuthenticated, setUser, logout)
- Reader settings (viewMode, zoom, backgroundColor, persist)
- Bookmarks (cache, add, remove, update, sync)
- Search (history, recent, add, clear)
- Theme (mode, colors, toggle, persist)
- Notifications (add, read, clear)
- UI state (sidebar, mobile menu, modals)

All stores with TypeScript types and persistence where needed.

```

#### Prompt 7: Testing Suite

```md
Set up comprehensive testing with:
- Vitest for unit tests
- Playwright for E2E tests
- Test all components (GenericForm, DataTable, ComicCard, etc.)
- Test all server actions (auth, profile, comics, bookmarks)
- Test all user flows (sign-up, browsing, reading, bookmarking)
- Mock Next.js router and authentication
- Achieve 80%+ code coverage
- CI integration

```

#### Prompt 8: AST Refactoring

```md
Create AST-based refactoring scripts using ts-morph to:
- Replace relative imports with path aliases (@/)
- Detect and remove duplicate functions/components
- Find and fix 'any' types with specific types
- Optimize imports (sort, remove unused, combine)
- Add JSDoc comments to functions
- Generate refactoring report
- Dry-run and rollback capabilities

```

#### Prompt 9: Master CLI

```md
Create a master CLI using Commander.js with commands:
- dev (start development)
- build (build for production)
- db (seed, migrate, reset, studio)
- test (unit, e2e, coverage)
- deploy (vercel, docker)
- analyze (bundle, performance, security)
- refactor (imports, types, duplicates)
- cleanup (unused files, packages)
- generate (pages, components, actions, schemas)

Include interactive prompts, progress indicators, colored output, and comprehensive help.

```

#### Prompt 10: CI/CD Complete

```md
Create GitHub Actions workflows for:
- CI: lint, type-check, test, build (on push/PR)
- CD: deploy to Vercel staging/production
- Database migrations with rollback
- Security scanning (dependencies, code, secrets)
- Performance monitoring (Lighthouse, bundle size)

Create Dockerfile with multi-stage build and docker-compose.yml with app, postgres, redis services.

```

---

## 📋 Final Notes

### Project Health Indicators

**Strengths:**

- Comprehensive infrastructure
- Type-safe throughout
- Modern tech stack
- Extensive tooling
- Well-documented

**Areas to Focus:**

1. Complete all user-facing pages
2. Expand test coverage
3. Optimize performance
4. Enhance documentation
5. Implement monitoring

### Recommended Next Steps

1. **Immediate (Today):**

   - Complete authentication pages
   - Create generic form components
   - Set up profile pages

2. **Short-term (This Week):**

   - Build comics listing and details
   - Implement chapter reader
   - Create bookmark functionality
   - Set up admin CRUD pages

3. **Medium-term (Next 2 Weeks):**

   - Complete database seeding
   - Implement all Zustand stores
   - Write comprehensive tests
   - Set up CI/CD pipelines

4. **Long-term (Next Month):**

   - Performance optimization
   - Security hardening
   - Documentation completion
   - Production deployment

### Success Metrics

- **Code Quality:** 100% TypeScript, 0 'any' types, 0 ESLint errors
- **Testing:** 80%+ coverage, all tests passing
- **Performance:** Lighthouse score > 90, bundle size optimized
- **Security:** 0 critical vulnerabilities
- **Accessibility:** WCAG 2.1 AA compliance
- **Documentation:** Complete setup and API docs

---

**END OF COMICWISE GITHUB COPILOT SETUP PROMPT**

> This prompt integrates all tasks, recommendations, and best practices from the entire ComicWise project documentation. Use these prompts with GitHub Copilot to scaffold and complete a production-ready web comic platform following DRY principles and best practices.

**Version:** 5.0.0  
**Updated:** 2026-01-19  
**License:** MIT
