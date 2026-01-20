---
title: ComicWise - Ultimate Complete Setup Prompt
version: 7.0.0
updated: 2026-01-20
type: Production-Ready Comprehensive Setup Guide
platform: Next.js 16, TypeScript, PostgreSQL, Redis
methodology: DRY, Type-Safe, Production-Grade
author: ComicWise Team
---

# 🚀 ComicWise - Ultimate Complete Setup Prompt

> **The definitive comprehensive setup guide consolidating ALL content, tasks, recommendations, and best practices from the entire ComicWise project. This is your single source of truth for scaffolding and completing a production-ready web comic platform with advanced features.**

---

## 📖 Table of Contents

1. [Prerequisites & Understanding](#prerequisites--understanding)
2. [Quick Start](#quick-start)
3. [Complete Setup Workflow](#complete-setup-workflow)
4. [GitHub Copilot Master Prompts](#github-copilot-master-prompts)
5. [Detailed Implementation Guide](#detailed-implementation-guide)
6. [Zustand State Management](#zustand-state-management)
7. [Refactoring & Optimization](#refactoring--optimization)
8. [Scripts CLI System](#scripts-cli-system)
9. [Validation & Testing](#validation--testing)
10. [Deployment](#deployment)
11. [Maintenance & Monitoring](#maintenance--monitoring)

---

## 📋 Prerequisites & Understanding

### 🎓 Required Reading & Context

**CRITICAL: Before starting, read and understand the following to get complete project context:**

Read and understand:
- `@/**/*.ts` - All TypeScript files
- `@/**/*.tsx` - All React/Next.js components
- `@/**/*.mjs` - Module JavaScript files
- `@/**/*.json` - Configuration and data files
- `@/**/*.md` - Documentation files
- `@/**/*.txt` - Text files and prompts
- `@/**/*.yml` - CI/CD and workflow files
- `@/**/*.ps1` - PowerShell scripts
- `@/**/*.sh` - Bash scripts
- `@/**/Dockerfile` - Docker configurations
- `@/src` - Source code directory
- `@/scripts` - Project scripts
- `@/docs` - Documentation directory

### ✅ Permission & Confirmation

**IMPORTANT: Request and confirm permissions before proceeding:**

1. **Request all necessary permissions** to complete all tasks:
   - ✅ Create, modify, and delete files
   - ✅ Install and uninstall packages
   - ✅ Run database migrations and seeds
   - ✅ Execute scripts and commands
   - ✅ Push to Git repositories
   - ✅ Deploy to cloud platforms
   - ✅ Modify CI/CD workflows

2. **Confirm permissions** before proceeding with implementation
3. **Never create summary** until ALL tasks are completed
4. **Complete tasks in the best recommended way**

### 🔧 System Requirements

**Operating System:**
- Windows (PowerShell)
- Linux (Bash)
- macOS (Zsh/Bash)

**Required Software:**
- Node.js: 18.x or higher
- Package Manager: pnpm (latest)
- PostgreSQL: 15.x or higher
- Redis: Latest (Upstash)
- Git: Latest version
- Docker: Latest (optional)

### 🎯 Core Principles

For ALL tasks, ensure:

1. **Next.js Best Practices** - Follow Next.js 16 latest conventions
2. **DRY Principles** - Do Not Repeat Yourself
3. **Performance Optimization** - Optimize for speed and efficiency
4. **Comprehensive Logging** - Clear, concise logs for each operation
5. **PowerShell/Bash Syntax** - Use appropriate shell syntax
6. **Backup Before Changes** - Copy existing files to `.backup` before modifications
7. **Data Integrity** - Ensure database consistency
8. **Error Handling** - Proper validation and error handling
9. **Security Best Practices** - Protect sensitive data
10. **Type Safety** - Use specific types, avoid `any`

### 📁 File Handling Rules

**If file exists:**
```powershell
# Copy to backup
Copy-Item "path/to/file.ts" "path/to/file.backup.ts"
# Create optimized version
```

**If file doesn't exist:**
```
Create new file with:
- Optimized code
- Best practices
- Proper documentation
- Type safety
- Error handling
```

**Update all usages** across the project after creating/modifying any file.

---

## 🎯 Quick Start

### Single Command Setup (Recommended)

```bash
# Run the master setup script
pnpm setup:complete
```

This will:
- ✅ Create all generic reusable components
- ✅ Set up authentication system (6 pages)
- ✅ Create user profile pages
- ✅ Generate admin panel (CRUD for all entities)
- ✅ Build comics & chapters system
- ✅ Implement bookmarks functionality
- ✅ Create homepage and navigation
- ✅ Set up Zustand stores
- ✅ Configure testing suite
- ✅ Prepare deployment configs

---

## 🔥 GitHub Copilot Master Prompts

### Prompt 1: Complete Project Setup (All-in-One)

```
@workspace Create a complete production-ready ComicWise web comic platform using Next.js 16, TypeScript, PostgreSQL (Drizzle ORM), Redis (Upstash), NextAuth.js v5, Tailwind CSS 4.1, and shadcn/ui.

CORE PRINCIPLES:
- DRY: Create generic, reusable components
- Type Safety: Strong TypeScript, no 'any' types
- Performance: Caching, lazy loading, optimization
- Security: Input validation, route protection
- Accessibility: WCAG 2.1 AA compliant
- Testing: 80%+ code coverage

IMPLEMENTATION REQUIREMENTS:

1. GENERIC REUSABLE COMPONENTS (src/components/shared/)
   - GenericForm.tsx: Type-safe form with Zod + React Hook Form
   - FormFields.tsx: Text, Textarea, Select, Checkbox, FileUpload
   - GenericDataTable.tsx: Sorting, filtering, pagination with @tanstack/react-table
   - Pagination.tsx: URL-based navigation
   - LoadingSpinner.tsx, ErrorBoundary.tsx, ConfirmDialog.tsx

2. AUTHENTICATION SYSTEM (src/app/(auth)/)
   - Schemas: src/schemas/authSchemas.ts (signUp, signIn, forgotPassword, resetPassword, verifyEmail, changePassword)
   - Actions: src/lib/actions/auth.ts (all auth operations)
   - Pages: sign-up, sign-in, forgot-password, reset-password, verify-email
   - Features: Password validation (8+ chars, uppercase, lowercase, number, special), email verification, social auth (Google, GitHub)
   - Layout: Centered card design with gradient background

3. USER PROFILE SYSTEM (src/app/(root)/profile/)
   - Schemas: src/schemas/profileSchemas.ts (updateProfile, changePassword, userSettings)
   - Actions: src/lib/actions/profile.ts (getUserProfile, updateProfile, changePassword, updateSettings)
   - Pages: /profile (view with stats), /profile/edit, /profile/change-password, /profile/settings
   - Layout: Sidebar navigation with active state highlighting

4. ADMIN PANEL (src/app/admin/)
   - Schemas: src/schemas/adminSchemas.ts (comic, chapter, genre, author, artist, type, user, bookmark)
   - Actions: src/lib/actions/admin/{entity}.ts for each entity
   - CRUD pages for ALL entities:
     * Comics: List, Create, Edit, View, Delete (multi-select genres, image upload)
     * Chapters: List, Create, Edit, View, Delete (multiple image uploads with ordering)
     * Genres, Authors, Artists, Types: Simple CRUD
     * Users: List, View, Edit (role management, activation)
     * Bookmarks: View only with filters
   - Dashboard: Statistics cards, charts, recent activity
   - Layout: Sidebar navigation, breadcrumbs, responsive

5. COMICS & CHAPTERS SYSTEM (src/app/(root)/comics/)
   - Comics Listing (/comics):
     * Filters: Genre (multi-select), Status, Type, Sort (Latest, Popular, Rating, A-Z)
     * Search: Title, author, description
     * Pagination: 20 per page
     * Components: ComicCard, ComicFilters
   
   - Comic Details (/comics/[slug]):
     * Display: Cover image, title, description, metadata, genres, chapters list
     * Features: BookmarkActions (add, remove, update status)
     * Related comics carousel
     * Comments section (optional)
   
   - Chapter Reader (/comics/[slug]/[chapterNumber]):
     * Modes: Vertical (default), Horizontal
     * Features: Zoom (50%-200%), Swipe gestures, Keyboard navigation
     * Navigation: ChapterNavigation (prev/next, dropdown, settings)
     * Progress tracking: Auto-save, reading status
     * Image gallery: Use react-swipeable + yet-another-react-lightbox

6. BOOKMARKS SYSTEM (src/app/(root)/bookmarks/)
   - Schemas: src/schemas/bookmarkSchemas.ts
   - Actions: src/lib/actions/bookmarks.ts (add, remove, updateStatus, getUserBookmarks, checkBookmarkStatus)
   - Pages: /bookmarks (listing with filters by status)
   - Components: BookmarkFilters (All, Reading, Plan to Read, Completed, Dropped, On Hold)
   - Features: Optimistic UI updates, toast notifications

7. ROOT PAGES (src/app/(root)/)
   - Homepage (/):
     * Sections: Hero, Latest comics, Popular comics, Recent chapters, Trending
     * SEO: Open Graph, Twitter Cards, JSON-LD
   
   - Layout: Header (logo, navigation, search, user menu), Footer, Toast container
   - Components: HeroSection, ComicSection, Header, Footer
   - Search (/search): Full-text search across comics and chapters

8. ZUSTAND STORES (src/stores/)
   - authStore.ts: User state, authentication
   - readerStore.ts: Reading settings (viewMode, zoom, backgroundColor, persist)
   - bookmarkStore.ts: Bookmarks cache, sync
   - searchStore.ts: Search history, recent searches
   - themeStore.ts: Dark/light mode, custom colors
   - notificationStore.ts: Notifications array, unread count
   - uiStore.ts: Sidebar, mobile menu, modals

9. DATABASE SEEDING (src/database/seed/)
   - Helpers: validationSchemas.ts, passwordHelper.ts, imageDownloader.ts, seedLogger.ts, batchProcessor.ts
   - Seeders: userSeeder.ts, comicSeeder.ts, chapterSeeder.ts, genreSeeder.ts, etc.
   - Features: Batch processing, Zod validation, image downloads, onConflictDoUpdate, dry-run
   - CLI: run.ts with --dry-run, --entity flags

10. SCRIPTS & CLI (scripts/cli/)
    - Master CLI: scripts/cli/index.ts using Commander.js
    - Commands: dev, build, db (seed, migrate, reset, studio), test, lint, validate, deploy, analyze, refactor, cleanup, generate, docs
    - Utilities: logger.ts, prompts.ts (interactive)

11. REFACTORING (scripts/codemods/)
    - Use ts-morph for AST-based refactoring
    - Scripts: refactorImports.ts, removeDuplicates.ts, fixAnyTypes.ts, optimizeImports.ts, addJsDoc.ts
    - Features: Replace relative imports with aliases, detect duplicates, fix 'any' types

12. TESTING (tests/)
    - Vitest: Unit tests for components, actions, utilities
    - Playwright: E2E tests for all user flows
    - Coverage: 80%+ target
    - Setup: Mock Next.js router, authentication, environment

13. CI/CD (.github/workflows/)
    - ci.yml: Lint, type-check, test, build on push/PR
    - cd.yml: Deploy to Vercel on main/development
    - migrations.yml: Database migrations with rollback
    - security.yml: Dependency audit, CodeQL, secrets scanning
    - performance.yml: Lighthouse, bundle size analysis

14. DEPLOYMENT
    - Dockerfile: Multi-stage build, node:20-alpine
    - docker-compose.yml: app, postgres, redis services
    - vercel.json: Build settings, redirects, headers
    - Scripts: deploy-vercel.ts, docker-deploy.sh

IMPLEMENTATION ORDER:
1. Generic components (foundation)
2. Auth system (user access)
3. Profile system (user management)
4. Comics & chapters (core features)
5. Bookmarks (engagement)
6. Admin panel (content management)
7. Homepage (entry point)
8. Testing & validation
9. Deployment

USE:
- Path aliases (@/, @/components, @/lib, etc.)
- Server components by default, client only when needed
- Server actions for mutations
- Optimistic UI updates where applicable
- Toast notifications (sonner)
- Error boundaries for graceful failures
- Skeleton loaders for better UX

ENSURE:
- All components are fully typed
- All schemas use Zod
- All forms use React Hook Form
- All tables use @tanstack/react-table
- All actions return { success: boolean; error?: string; data?: any }
- All pages have proper SEO metadata
- All routes are protected appropriately
- All images use Next/Image with optimization
```

### Prompt 2: Auth System Only

```
@workspace Create a complete authentication system for ComicWise with:

SCHEMAS (src/schemas/authSchemas.ts):
- signUpSchema: name, email, password (8+ chars, uppercase, lowercase, number, special), confirmPassword, agreeToTerms
- signInSchema: email, password, rememberMe (optional)
- forgotPasswordSchema: email
- resetPasswordSchema: password, confirmPassword with token validation
- verifyEmailSchema: code (6 digits)
- changePasswordSchema: currentPassword, newPassword, confirmPassword

SERVER ACTIONS (src/lib/actions/auth.ts):
- signUpAction: Validate, check existing user, hash password (bcryptjs), create user, send verification email
- signInAction: Validate, verify credentials (NextAuth), check email verification, create session
- signOutAction: Clear session, redirect
- forgotPasswordAction: Generate reset token, send email
- resetPasswordAction: Validate token, hash password, update user
- verifyEmailAction: Verify code, update emailVerified
- resendVerificationAction: Generate new code, send email

PAGES (src/app/(auth)/):
All pages use GenericForm component with proper validation and error handling:
- sign-up/page.tsx: Registration form with terms checkbox
- sign-in/page.tsx: Login form with remember me, links to forgot-password and sign-up
- forgot-password/page.tsx: Email input, send reset link
- reset-password/page.tsx: New password form with token from URL
- verify-email/page.tsx: 6-digit code input with resend button

LAYOUT (src/app/(auth)/layout.tsx):
- Centered card design
- Gradient background (from-background to-muted)
- Responsive padding
- Logo/branding

FEATURES:
- Password strength indicator
- Email verification flow
- Social auth buttons (Google, GitHub) - optional
- Loading states with useTransition
- Toast notifications on success/error
- Redirect after successful actions
- Form reset on success

USE:
- NextAuth.js v5 for session management
- bcryptjs for password hashing
- Zod for validation
- React Hook Form for form state
- shadcn/ui components (Card, Input, Button, etc.)
```

### Prompt 3: Admin Panel Complete

```
@workspace Create a complete admin panel for ComicWise with CRUD operations for all entities:

ENTITIES: Comics, Chapters, Genres, Authors, Artists, Types, Users, Bookmarks

FOR EACH ENTITY, CREATE:

1. SCHEMA (src/schemas/adminSchemas.ts):
   - Zod schema with all fields and validation rules
   - TypeScript type export

2. SERVER ACTIONS (src/lib/actions/admin/{entity}.ts):
   - get{Entities}(filters?): List with pagination, search, filters
   - get{Entity}(id): Single entity with relations
   - create{Entity}Action(data): Create with validation
   - update{Entity}Action(id, data): Update with validation
   - delete{Entity}Action(id): Delete with confirmation
   - All actions check admin role, validate data, handle errors

3. PAGES (src/app/admin/{entity}/):
   - page.tsx (List): GenericDataTable with search, filters, pagination, create button, edit/delete actions
   - create/page.tsx: GenericForm with all fields, submit to create action, redirect on success
   - [id]/edit/page.tsx: GenericForm prefilled with data, submit to update action
   - [id]/page.tsx (View): Display entity details, related data, edit/delete buttons
   - columns.tsx: ColumnDef for GenericDataTable

SPECIFIC IMPLEMENTATIONS:

COMICS ADMIN:
- Fields: title, slug, description, coverImage (upload), alternativeTitles (array), status (enum), authorId (select), artistId (select), typeId (select), genreIds (multi-select), rating, views, releaseYear
- Slug auto-generation from title
- Image upload for cover (drag & drop)
- Genre multi-select with checkboxes
- Status enum: Ongoing, Completed, Hiatus, Cancelled

CHAPTERS ADMIN:
- Fields: title, slug, chapterNumber (auto-increment), comicId (select), images (multiple upload with reordering), publishedAt, views
- Multiple image uploads with drag & drop
- Image reordering with drag handles
- Chapter number auto-increment based on comic

GENRES, AUTHORS, ARTISTS, TYPES ADMIN:
- Fields: name, slug, description
- Slug auto-generation from name
- Image upload for authors/artists (photo)

USERS ADMIN:
- List, view, edit only (no create/delete)
- Fields: name, email, role (enum: user, admin), isActive (toggle)
- Role management with confirmation
- Account activation toggle

BOOKMARKS ADMIN:
- View only (list with filters)
- Display: user info, comic info, status, createdAt, updatedAt
- Filters by user, comic, status

ADMIN DASHBOARD (src/app/admin/page.tsx):
- Statistics cards: Total comics, chapters, users, recent bookmarks
- Charts: Comics by status, user registrations over time, most popular comics
- Recent activity feed
- Quick actions

ADMIN LAYOUT (src/app/admin/layout.tsx):
- Sidebar navigation with icons (Lucide React)
- Navigation items: Dashboard, Comics, Chapters, Genres, Authors, Artists, Types, Users, Bookmarks
- Active state highlighting
- Breadcrumbs
- User menu with logout
- Responsive (collapsible sidebar on mobile)

FEATURES:
- Role-based access control (check admin role)
- Image upload with preview
- Slug auto-generation
- Form validation with Zod
- Success/error toast notifications
- Loading states
- Confirmation dialogs for destructive actions
- Pagination with URL params
- Search with debouncing
- Filters with URL sync

COMPONENTS:
- AdminSidebar.tsx: Reusable sidebar
- StatsCard.tsx: Reusable stats display
- ImageUpload.tsx: Drag & drop image upload
- SlugInput.tsx: Auto-generate slug from title
```

### Prompt 4: Comics & Chapter Reader System

```
@workspace Create a complete comics reading system for ComicWise:

COMICS LISTING (src/app/(root)/comics/page.tsx):
- Server component
- Get searchParams: page, genre, status, type, sort, search
- Fetch comics with filters and pagination
- Display ComicCard grid (responsive: 2-4 columns)
- ComicFilters component
- Pagination component
- SEO metadata

COMIC CARD (src/components/comics/ComicCard.tsx):
- Cover image with Next/Image (aspect-ratio 2:3)
- Title (line-clamp-2)
- Genres badges (first 3)
- Status badge with color coding
- Rating display (stars or number)
- View count
- Link to /comics/[slug]
- Hover effects (scale, shadow)
- Skeleton loading state

COMIC FILTERS (src/components/comics/ComicFilters.tsx):
- Client component
- Genre filter: Multi-select dropdown with checkboxes
- Status filter: Select (All, Ongoing, Completed, Hiatus, Cancelled)
- Type filter: Select (All, Manga, Manhwa, Manhua, etc.)
- Sort: Select (Latest, Popular, Rating, Title A-Z, Title Z-A)
- Search input with debounce
- Clear filters button
- Update URL params on change
- Responsive (drawer on mobile)

COMIC DETAILS (src/app/(root)/comics/[slug]/page.tsx):
- Server component
- Fetch comic with getComicBySlug(slug)
- Get user session
- Check bookmark status
- Display:
  * Large cover image (2:3 aspect ratio)
  * Title and alternative titles
  * Description (with expand/collapse for long text)
  * Metadata grid: Author, Artist, Status, Type, Rating, Views, Release Year
  * Genre badges (all)
  * BookmarkActions component (if authenticated)
  * ChapterList component
  * Related comics carousel (same genre/author)
  * Comments section (optional)
- SEO: Open Graph, Twitter Cards, JSON-LD structured data

BOOKMARK ACTIONS (src/components/comics/BookmarkActions.tsx):
- Client component
- Props: comicId, comicSlug, isBookmarked, initialStatus
- State: bookmarked, status, isPending (useTransition)
- If NOT bookmarked:
  * Dropdown button: "Add to Bookmarks"
  * Options: Reading, Plan to Read, Completed, Dropped, On Hold
  * Call addToBookmarksAction on selection
- If bookmarked:
  * Status dropdown (change status)
  * Remove button
  * Confirm before removing (ConfirmDialog)
- Optimistic UI updates
- Toast notifications
- Icons: BookmarkIcon, BookmarkFilledIcon, ChevronDownIcon

CHAPTER LIST (src/components/chapters/ChapterList.tsx):
- List of chapters for a comic
- Display: Chapter number, title, release date, views
- Read status indicator (green checkmark if read)
- Last read marker (highlighted row)
- Link to chapter reader
- Sort order toggle (asc/desc)
- Pagination if many chapters
- Skeleton loading state

CHAPTER READER (src/app/(root)/comics/[slug]/[chapterNumber]/page.tsx):
- Server component
- Fetch chapter with getChapterBySlug(slug, chapterNumber)
- Get prev/next chapter info
- Track reading progress
- Display: ChapterNavigation, ChapterReader
- Minimal UI for immersive experience
- SEO metadata

CHAPTER NAVIGATION (src/components/chapters/ChapterNavigation.tsx):
- Client component
- Fixed top bar (auto-hide on scroll down, show on scroll up)
- Elements:
  * Back button (to comic details)
  * Chapter dropdown selector (all chapters)
  * Previous chapter button (disabled if first)
  * Next chapter button (disabled if last)
  * Reading settings button (opens settings panel)
- Keyboard shortcuts: Arrow keys (prev/next), ESC (back), Space (next page in horizontal mode)

CHAPTER READER (src/components/chapters/ChapterReader.tsx):
- Client component
- Props: images[], title, comicSlug, chapterNumber
- State: currentPage, zoom, viewMode, settings (from readerStore)
- View modes:
  * Vertical (default): All images stacked, lazy loading, infinite scroll feel
  * Horizontal: One image at a time with navigation arrows
- Features:
  * Zoom controls: Slider (50%-200%), + and - buttons
  * Swipe gestures: react-swipeable (swipe left/right for prev/next page in horizontal)
  * Keyboard navigation: Arrows, Page Up/Down, Space
  * Page counter: "Page X of Y"
  * Progress bar at top
  * Lazy loading images with blur placeholder
  * Reading settings panel:
    - View mode toggle
    - Background color picker
    - Image quality selector (Low, Medium, High)
    - Auto-advance toggle (horizontal mode)
  * Progress tracking: Auto-save on scroll/page change
- Use Zustand readerStore for settings persistence
- Image gallery: Use yet-another-react-lightbox for fullscreen view

ACTIONS (src/lib/actions/comics.ts):
- getComics(filters): Dynamic query with Drizzle, joins for author/artist/genres/type, pagination
- getComicBySlug(slug): Fetch with all relations, increment view count
- getChapterBySlug(comicSlug, chapterNumber): Fetch with images, comic data, prev/next info, increment views

ACTIONS (src/lib/actions/chapters.ts):
- trackReadingProgressAction(data: { chapterId, page, completed }): Save progress, update bookmark

ACTIONS (src/lib/actions/bookmarks.ts):
- addToBookmarksAction(data: { comicId, status }): Create bookmark
- removeFromBookmarksAction(data: { comicId }): Delete bookmark
- updateBookmarkStatusAction(data: { comicId, status }): Update status
- checkBookmarkStatus(userId, comicId): Return bookmark or null
- getUserBookmarks(userId, status?): Fetch with comic data, filter by status

INSTALL PACKAGES:
pnpm add react-swipeable yet-another-react-lightbox

FEATURES:
- Responsive design
- Offline support (cache images)
- Reading history tracking
- Bookmark sync across devices
- Image preloading for smooth experience
- Error boundaries for failed image loads
```

### Prompt 5: Zustand Stores Complete

```
@workspace Create complete Zustand stores for ComicWise state management:

INSTALL:
pnpm add zustand

AUTH STORE (src/stores/authStore.ts):
interface User { id: string; name: string; email: string; role: string; avatar?: string; }
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}
- Use persist middleware
- Storage name: 'auth-storage'

READER STORE (src/stores/readerStore.ts):
interface ReaderSettings {
  viewMode: 'vertical' | 'horizontal';
  zoom: number; // 50-200
  backgroundColor: string; // hex color
  imageQuality: 'low' | 'medium' | 'high';
  autoAdvance: boolean;
  pageTransition: 'none' | 'fade' | 'slide';
}
interface ReaderState extends ReaderSettings {
  setViewMode: (mode) => void;
  setZoom: (zoom) => void;
  setBackgroundColor: (color) => void;
  setImageQuality: (quality) => void;
  setAutoAdvance: (auto) => void;
  setPageTransition: (transition) => void;
  reset: () => void;
}
- Use persist middleware
- Default values: viewMode: 'vertical', zoom: 100, backgroundColor: '#000000', imageQuality: 'high', autoAdvance: false, pageTransition: 'none'

BOOKMARK STORE (src/stores/bookmarkStore.ts):
interface Bookmark { id: string; comicId: number; userId: string; status: string; createdAt: Date; }
interface BookmarkState {
  bookmarks: Bookmark[];
  recentlyViewed: number[]; // comicIds
  addBookmark: (bookmark) => void;
  removeBookmark: (comicId) => void;
  updateBookmark: (comicId, status) => void;
  getBookmarkByComicId: (comicId) => Bookmark | null;
  addRecentlyViewed: (comicId) => void;
  clearRecentlyViewed: () => void;
}
- Use persist middleware
- Sync with server on changes

SEARCH STORE (src/stores/searchStore.ts):
interface SearchState {
  searchHistory: string[];
  recentSearches: string[];
  popularSearches: string[];
  addSearch: (query) => void;
  clearHistory: () => void;
  getRecentSearches: () => string[];
}
- Use persist middleware
- Limit history to 20 items
- Limit recent to 5 items

THEME STORE (src/stores/themeStore.ts):
interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  customColors: Record<string, string>;
  setTheme: (mode) => void;
  toggleTheme: () => void;
  setCustomColor: (key, value) => void;
  resetColors: () => void;
}
- Use persist middleware
- Apply theme changes to document

NOTIFICATION STORE (src/stores/notificationStore.ts):
interface Notification { id: string; title: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; read: boolean; createdAt: Date; }
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification) => void;
  markAsRead: (id) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id) => void;
}
- Sync with server periodically

UI STORE (src/stores/uiStore.ts):
interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  modalOpen: boolean;
  modalContent: React.ReactNode | null;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  openModal: (content) => void;
  closeModal: () => void;
}
- No persistence needed

ALL STORES:
- Use TypeScript for type safety
- Include devtools in development
- Export typed hooks
- Document usage in comments
- Create example components using stores
```

---

## 📋 Complete Setup Workflow

### Step 1: Environment Setup

```bash
# Clone and install
git clone <your-repo>
cd comicwise
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
pnpm db:push
pnpm db:seed
```

### Step 2: Run Development

```bash
# Start dev server
pnpm dev

# In another terminal, run database studio
pnpm db:studio

# Run tests in watch mode
pnpm test:unit
```

### Step 3: Validation

```bash
# Type check
pnpm type-check

# Lint
pnpm lint

# Test
pnpm test

# Build
pnpm build
```

---

## ✅ Validation & Testing

### TypeScript Validation

```bash
pnpm type-check
```

Expected: 0 errors

### ESLint Validation

```bash
pnpm lint
pnpm lint:fix
```

Expected: 0 errors, 0 warnings (or minimal warnings)

### Testing

```bash
# Unit tests
pnpm test:unit

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

Expected: 80%+ coverage, all tests passing

### Database Validation

```bash
# Dry run seeding
pnpm db:seed:dry-run

# Full seeding
pnpm db:seed

# Check data integrity
pnpm db:check
```

---

## 🚀 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
pnpm deploy:vercel
```

### Docker Deployment

```bash
# Build image
docker build -t comicwise .

# Run with docker-compose
docker-compose up -d
```

---

## 📊 Success Criteria

- ✅ All pages scaffolded and functional
- ✅ 100% TypeScript type safety (0 'any' types)
- ✅ All ESLint errors resolved
- ✅ All tests passing (80%+ coverage)
- ✅ Database seeding working
- ✅ Generic components reused throughout
- ✅ Zustand stores managing state
- ✅ Production build successful
- ✅ 0 critical security vulnerabilities
- ✅ Lighthouse score > 90
- ✅ Deployed successfully

---

**Version:** 6.0.0  
**Updated:** January 20, 2026  
**License:** MIT
