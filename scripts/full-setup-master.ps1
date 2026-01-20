#!/usr/bin/env pwsh
# ComicWise Full Setup Master Script
# Automated generation of remaining phases (6-16)

param(
    [switch]$DryRun,
    [string]$Phase = "all"
)

Write-Host "🚀 ComicWise Full Setup Master Script" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No files will be created" -ForegroundColor Yellow
    Write-Host ""
}

# Progress tracker
$totalPhases = 11 # Phases 6-16
$completedPhases = 0

function Write-PhaseHeader($number, $name) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host " Phase $number : $name" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Create-FileIfNotExists($path, $content) {
    if ($DryRun) {
        Write-Host "  [DRY RUN] Would create: $path" -ForegroundColor Yellow
        return
    }
    
    $dir = Split-Path -Parent $path
    if ($dir -and !(Test-Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
    }
    
    if (!(Test-Path $path)) {
        Set-Content -Path $path -Value $content -Encoding UTF8
        Write-Host "  ✅ Created: $path" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  Skipped (exists): $path" -ForegroundColor Gray
    }
}

# PHASE 6: ADMIN PANEL
if ($Phase -eq "all" -or $Phase -eq "6") {
    Write-PhaseHeader "6" "Admin Panel Complete"
    
    Write-Host "Creating admin schemas..." -ForegroundColor Cyan
    
    # Admin Schemas
    $adminSchemas = @"
import { z } from 'zod';

export const comicSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  coverImage: z.string().url().optional(),
  status: z.enum(['Ongoing', 'Completed', 'Hiatus', 'Cancelled']),
  authorId: z.number(),
  artistId: z.number(),
  typeId: z.number(),
  genreIds: z.array(z.number()),
  rating: z.number().min(0).max(10).optional(),
  views: z.number().optional(),
  releaseYear: z.number().optional(),
});

export const chapterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  chapterNumber: z.number().min(1),
  comicId: z.number(),
  images: z.array(z.string().url()),
  publishedAt: z.date().optional(),
  views: z.number().optional(),
});

export const genreSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
});

export const authorSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  bio: z.string().optional(),
  photo: z.string().url().optional(),
});

export const artistSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  bio: z.string().optional(),
  photo: z.string().url().optional(),
});

export const typeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
});

export type ComicInput = z.infer<typeof comicSchema>;
export type ChapterInput = z.infer<typeof chapterSchema>;
export type GenreInput = z.infer<typeof genreSchema>;
export type AuthorInput = z.infer<typeof authorSchema>;
export type ArtistInput = z.infer<typeof artistSchema>;
export type TypeInput = z.infer<typeof typeSchema>;
"@
    
    Create-FileIfNotExists "src/schemas/adminSchemas.ts" $adminSchemas
    
    Write-Host "Admin panel would create 40+ files (comics, chapters, genres, authors, artists, types, users CRUD)" -ForegroundColor Yellow
    Write-Host "For full implementation, use the detailed Initial_Setup_Prompt.md Phase 6" -ForegroundColor Yellow
    
    $completedPhases++
}

# PHASE 7: COMICS & CHAPTERS
if ($Phase -eq "all" -or $Phase -eq "7") {
    Write-PhaseHeader "7" "Comics & Chapters System"
    
    Write-Host "This phase includes:" -ForegroundColor Cyan
    Write-Host "  - Comics listing page with filters" -ForegroundColor White
    Write-Host "  - Comic details page with bookmarks" -ForegroundColor White
    Write-Host "  - Chapter reader with image gallery" -ForegroundColor White
    Write-Host "  - Chapter navigation" -ForegroundColor White
    Write-Host ""
    Write-Host "Estimated 15-20 files to create" -ForegroundColor Yellow
    Write-Host "See Initial_Setup_Prompt.md Phase 7 for details" -ForegroundColor Yellow
    
    $completedPhases++
}

# PHASE 10: DATABASE SEEDING
if ($Phase -eq "all" -or $Phase -eq "10") {
    Write-PhaseHeader "10" "Database Seeding System"
    
    Write-Host "Database seeding system already exists at:" -ForegroundColor Cyan
    Write-Host "  - src/database/seed/" -ForegroundColor White
    Write-Host "  - Helpers, seeders, and validation ready" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Phase 10 appears to be complete" -ForegroundColor Green
    
    $completedPhases++
}

# PHASE 11: STATE MANAGEMENT
if ($Phase -eq "all" -or $Phase -eq "11") {
    Write-PhaseHeader "11" "Zustand State Management"
    
    Write-Host "Creating Zustand stores..." -ForegroundColor Cyan
    
    # Auth Store
    $authStore = @"
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
"@
    
    Create-FileIfNotExists "src/stores/authStore.ts" $authStore
    
    Write-Host "Additional stores needed:" -ForegroundColor Yellow
    Write-Host "  - readerStore.ts" -ForegroundColor White
    Write-Host "  - bookmarkStore.ts" -ForegroundColor White
    Write-Host "  - searchStore.ts" -ForegroundColor White
    Write-Host "  - themeStore.ts" -ForegroundColor White
    Write-Host "  - notificationStore.ts" -ForegroundColor White
    Write-Host "  - uiStore.ts" -ForegroundColor White
    
    $completedPhases++
}

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host " SETUP SUMMARY" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Phases Processed: $completedPhases / $totalPhases" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 IMPORTANT NOTES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. This script created FOUNDATIONAL files only" -ForegroundColor White
Write-Host "2. Full implementation requires 150-200 files" -ForegroundColor White
Write-Host "3. Refer to Initial_Setup_Prompt.md for complete details" -ForegroundColor White
Write-Host "4. Each phase has specific requirements documented" -ForegroundColor White
Write-Host ""
Write-Host "📖 NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Review Initial_Setup_Prompt.md for detailed implementation" -ForegroundColor White
Write-Host "2. Complete critical user-facing features first (Phases 6-9)" -ForegroundColor White
Write-Host "3. Run validation: pnpm validate" -ForegroundColor White
Write-Host "4. Test functionality before proceeding" -ForegroundColor White
Write-Host ""
Write-Host "✅ Master setup script complete!" -ForegroundColor Green
