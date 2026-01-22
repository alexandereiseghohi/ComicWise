#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Fix all type errors and missing files systematically

.DESCRIPTION
  Comprehensive script to fix all identified type errors, missing exports,
  and file casing issues in the ComicWise project.
#>

$ErrorActionPreference = "Stop"

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ComicWise - Comprehensive Type Error Fixes" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Fix 1: Update DTO index.ts with correct kebab-case imports
Write-Host "[1/10] Fixing DTO exports..." -ForegroundColor Yellow
$dtoIndexContent = @"
/**
 * DTO Exports
 * Generated: 2026-01-22
 */

// Action Response DTOs
export * from "./action-response-dto";
export { type ActionResult, type SimpleActionResult } from "./action-response-dto";

// Entity DTOs
export * from "./artists-dto";
export {
  type AuthResponseDto,
  type RequestPasswordResetDto,
  type ResetPasswordDto,
  type SessionDto,
  type SignInDto,
  type SignUpDto,
  type VerifyEmailDto,
} from "./auth-dto";
export * from "./authors-dto";
export * from "./bookmark-dto";
export * from "./chapters-dto";
export * from "./comics-dto";
export * from "./comment-dto";
export * from "./genres-dto";
export * from "./genres-types-dto";
export * from "./seed-dto";
export {
  CreateChapterSchema,
  CreateComicSchema,
  CreateCommentSchema,
  DeleteComicSchema,
  GetChaptersSchema,
  GetComicsSchema,
  GetReadingHistorySchema,
  SaveReadingProgressSchema,
  SignInSchema,
  SignUpSchema,
  ToggleBookmarkSchema,
  UpdateProfileSchema,
  type ActionResponse,
  type CreateChapterInput,
  type CreateComicInput,
  type CreateCommentInput,
  type CreateCommentOutput,
  type DeleteComicInput,
  type DeleteComicOutput,
  type GetChaptersInput,
  type GetComicsInput,
  type GetReadingHistoryInput,
  type GetReadingHistoryOutput,
  type SaveReadingProgressInput,
  type SaveReadingProgressOutput,
  type SignInInput,
  type SignInOutput,
  type SignUpInput,
  type SignUpOutput,
  type ToggleBookmarkInput,
  type ToggleBookmarkOutput,
  type UpdateProfileInput,
  type UpdateProfileOutput,
} from "./server-actions.dto";
export * from "./types-dto";
export { type SafeUserDto, type UserListDto, type UserWithBookmarksDto } from "./users-dto";
"@

$dtoIndexContent | Set-Content -Path "src/dto/index.ts" -Force
Write-Host "✓ DTO exports fixed" -ForegroundColor Green

# Fix 2: Update auth components index
Write-Host "[2/10] Fixing auth component exports..." -ForegroundColor Yellow
$authIndexContent = @"
/**
 * Auth Components - Re-exports
 * @fileoverview Authentication form components and utilities
 */

export { AuthForm } from "./auth-form";
export { AuthSync } from "./auth-sync";
export { EmailField } from "./email-field";
export { FormErrorAlert } from "./form-error-alert";
export { NameField } from "./name-field";
export { OAuthProviders } from "./oauth-providers";
"@

$authIndexContent | Set-Content -Path "src/components/auth/index.ts" -Force
Write-Host "✓ Auth component exports fixed" -ForegroundColor Green

# Fix 3: Update admin components index
Write-Host "[3/10] Fixing admin component exports..." -ForegroundColor Yellow
$adminIndexContent = @"
/**
 * Admin Components - Re-exports
 * @fileoverview Admin panel components
 */

export { AdminUsersOptimized } from "./admin-users-optimized";
export { BaseForm } from "./base-form";
export { ComicForm } from "./comic-form";
export { DataTable } from "./data-table";
export { EnhancedDataTable } from "./enhanced-data-table";
export { ComicsTable } from "./comics-table";
export { CrudModal } from "./crud-modal";
export { DeleteComicButton } from "./delete-comic-button";
export { ImageUpload } from "./image-upload";
"@

$adminIndexContent | Set-Content -Path "src/components/admin/index.ts" -Force
Write-Host "✓ Admin component exports fixed" -ForegroundColor Green

# Fix 4: Create missing email components barrel export
Write-Host "[4/10] Creating email components index..." -ForegroundColor Yellow
if (!(Test-Path "src/components/emails/index.ts")) {
    $emailIndexContent = @"
/**
 * Email Components - Re-exports
 * @fileoverview Email template components
 */

// Re-export all email templates
export { VerificationEmail } from "./verification-email";
export { WelcomeEmail } from "./welcome-email";
// Add other email component exports as they are created
"@
    $emailIndexContent | Set-Content -Path "src/components/emails/index.ts" -Force
}
Write-Host "✓ Email components index created" -ForegroundColor Green

# Fix 5: Create missing layout components barrel export
Write-Host "[5/10] Fixing layout component exports..." -ForegroundColor Yellow
$layoutIndexContent = @"
/**
 * Layout Components - Re-exports
 * @fileoverview Layout and shared UI components
 */

export { DataTable } from "./data-table";
export { Filters } from "./filters";
export { Pagination } from "./pagination";
// Add other layout component exports as needed
"@

$layoutIndexContent | Set-Content -Path "src/components/layout/index.ts" -Force
Write-Host "✓ Layout component exports fixed" -ForegroundColor Green

# Fix 6: Create missing seeder V4 files
Write-Host "[6/10] Checking seeder V4 files..." -ForegroundColor Yellow
if (!(Test-Path "src/database/seed/seeders/user-seeder-v4.ts")) {
    Write-Host "  Creating user-seeder-v4.ts..." -ForegroundColor Gray
    $userSeederContent = @"
/**
 * User Seeder V4
 * @placeholder - Implement actual seeding logic
 */

export async function seedUsers() {
  console.log("User seeding placeholder");
  return { created: 0, updated: 0, skipped: 0, errors: [] };
}
"@
    $userSeederContent | Set-Content -Path "src/database/seed/seeders/user-seeder-v4.ts" -Force
}

if (!(Test-Path "src/database/seed/seeders/comic-seeder-v4.ts")) {
    Write-Host "  Creating comic-seeder-v4.ts..." -ForegroundColor Gray
    $comicSeederContent = @"
/**
 * Comic Seeder V4
 * @placeholder - Implement actual seeding logic
 */

export async function seedComics() {
  console.log("Comic seeding placeholder");
  return { created: 0, updated: 0, skipped: 0, errors: [] };
}
"@
    $comicSeederContent | Set-Content -Path "src/database/seed/seeders/comic-seeder-v4.ts" -Force
}

if (!(Test-Path "src/database/seed/seeders/chapter-seeder-v4.ts")) {
    Write-Host "  Creating chapter-seeder-v4.ts..." -ForegroundColor Gray
    $chapterSeederContent = @"
/**
 * Chapter Seeder V4
 * @placeholder - Implement actual seeding logic
 */

export async function seedChapters() {
  console.log("Chapter seeding placeholder");
  return { created: 0, updated: 0, skipped: 0, errors: [] };
}
"@
    $chapterSeederContent | Set-Content -Path "src/database/seed/seeders/chapter-seeder-v4.ts" -Force
}
Write-Host "✓ Seeder V4 files checked/created" -ForegroundColor Green

# Fix 7: Create missing profile component
Write-Host "[7/10] Creating missing profile component..." -ForegroundColor Yellow
if (!(Test-Path "src/components/profile")) {
    New-Item -ItemType Directory -Path "src/components/profile" -Force | Out-Null
}

if (!(Test-Path "src/components/profile/change-password-form.tsx")) {
    $changePasswordContent = @"
/**
 * Change Password Form Component
 * @placeholder - Implement actual form
 */

export function ChangePasswordForm() {
  return <div>Change Password Form - To be implemented</div>;
}
"@
    $changePasswordContent | Set-Content -Path "src/components/profile/change-password-form.tsx" -Force
}
Write-Host "✓ Profile components created" -ForegroundColor Green

# Fix 8: Create missing hooks
Write-Host "[8/10] Creating missing hooks..." -ForegroundColor Yellow
if (!(Test-Path "src/hooks/use-confirm-dialog.ts")) {
    $confirmDialogContent = @"
/**
 * Confirm Dialog Hook
 * @placeholder - Implement actual hook
 */

export function useConfirmDialog() {
  return {
    confirm: async () => true,
    isOpen: false,
    close: () => {},
  };
}
"@
    $confirmDialogContent | Set-Content -Path "src/hooks/use-confirm-dialog.ts" -Force
}
Write-Host "✓ Hooks created" -ForegroundColor Green

# Fix 9: Create missing UI components
Write-Host "[9/10] Creating missing UI components..." -ForegroundColor Yellow
if (!(Test-Path "src/components/ui/dialog.tsx")) {
    $dialogContent = @"
/**
 * Dialog Component
 * @note Use shadcn/ui dialog or implement custom
 */

export function Dialog({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
"@
    $dialogContent | Set-Content -Path "src/components/ui/dialog.tsx" -Force
}
Write-Host "✓ UI components created" -ForegroundColor Green

# Fix 10: Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Fix Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✓ DTO exports fixed (kebab-case imports)" -ForegroundColor Green
Write-Host "✓ Component exports fixed" -ForegroundColor Green
Write-Host "✓ Missing files created (placeholders)" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: pnpm type-check" -ForegroundColor Gray
Write-Host "  2. Run: pnpm lint" -ForegroundColor Gray
Write-Host "  3. Implement placeholders as needed" -ForegroundColor Gray
Write-Host ""
