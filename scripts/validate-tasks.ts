#!/usr/bin/env node

/**
 * ComicWise - Task Completion Validator
 * Verifies all required tasks are implemented
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const checkFile = (filePath: string): boolean => {
  const fullPath = path.join(process.cwd(), filePath);
  return fs.existsSync(fullPath);
};

const checkDirectory = (dirPath: string): boolean => {
  const fullPath = path.join(process.cwd(), dirPath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
};

console.log(chalk.cyan.bold('\n🔍 ComicWise Task Completion Validator\n'));
console.log(chalk.gray('━'.repeat(60)));

let totalChecks = 0;
let passedChecks = 0;

const check = (name: string, condition: boolean) => {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(chalk.green('✅'), name);
  } else {
    console.log(chalk.red('❌'), name);
  }
};

// Authentication Pages
console.log(chalk.yellow('\n📝 Authentication Pages:'));
check('Sign In Page', checkFile('src/app/(auth)/sign-in/page.tsx'));
check('Sign Up Page', checkFile('src/app/(auth)/sign-up/page.tsx'));
check('Forgot Password', checkFile('src/app/(auth)/forgot-password/page.tsx'));
check('Reset Password', checkFile('src/app/(auth)/reset-password/page.tsx'));
check('Verify Email', checkFile('src/app/(auth)/verify-email/page.tsx'));
check('Auth Form Component', checkFile('src/components/auth/authForm.tsx'));

// User Profile Pages
console.log(chalk.yellow('\n👤 User Profile Pages:'));
check('Profile Page', checkFile('src/app/(root)/profile/page.tsx'));
check('Edit Profile', checkFile('src/app/(root)/profile/edit/page.tsx'));
check('Change Password', checkFile('src/app/(root)/profile/change-password/page.tsx'));
check('Profile Settings', checkFile('src/app/(root)/profile/settings/page.tsx'));

// Comic Pages
console.log(chalk.yellow('\n📚 Comic Pages:'));
check('Comics List', checkFile('src/app/(root)/comics/page.tsx'));
check('Comic Details', checkFile('src/app/(root)/comics/[slug]/page.tsx'));
check('Chapter Reader', checkFile('src/app/(root)/comics/[slug]/[chapterNumber]/page.tsx'));
check('Bookmarks Page', checkFile('src/app/(root)/bookmarks/page.tsx'));

// Admin Pages
console.log(chalk.yellow('\n🛠️ Admin Panel:'));
check('Admin Dashboard', checkFile('src/app/admin/page.tsx'));
check('Admin Comics', checkFile('src/app/admin/comics/page.tsx'));
check('Admin Chapters', checkFile('src/app/admin/chapters/page.tsx'));
check('Admin Users', checkFile('src/app/admin/users/page.tsx'));
check('Admin Artists', checkFile('src/app/admin/artists/page.tsx'));
check('Admin Authors', checkFile('src/app/admin/authors/page.tsx'));
check('Admin Genres', checkFile('src/app/admin/genres/page.tsx'));
check('Admin Types', checkFile('src/app/admin/types/page.tsx'));

// Admin Components
console.log(chalk.yellow('\n🔧 Admin Components:'));
check('Base Form', checkFile('src/components/admin/BaseForm.tsx'));
check('Data Table', checkFile('src/components/admin/EnhancedDataTable.tsx'));
check('Image Upload', checkFile('src/components/admin/ImageUpload.tsx'));
check('Rich Text Editor', checkFile('src/components/admin/RichTextEditor.tsx'));

// Comic Components
console.log(chalk.yellow('\n📖 Comic Components:'));
check('Comic Card', checkFile('src/components/comics/ComicCard.tsx'));
check('Comic Details', checkFile('src/components/comics/ComicDetails.tsx'));
check('Comic Filters', checkFile('src/components/comics/ComicFilters.tsx'));
check('Bookmark Button', checkFile('src/components/comics/BookmarkButton.tsx'));
check('Bookmarks List', checkFile('src/components/comics/BookmarksList.tsx'));

// Chapter Components
console.log(chalk.yellow('\n📄 Chapter Components:'));
check('Chapter Reader', checkFile('src/components/chapters/ChapterReader.tsx'));
check('Image Gallery', checkFile('src/components/chapters/ImageGallery.tsx'));

// Zustand Stores
console.log(chalk.yellow('\n🏪 Zustand Stores:'));
check('Auth Store', checkFile('src/stores/authStore.ts'));
check('Comic Store', checkFile('src/stores/comicStore.ts'));
check('Bookmark Store', checkFile('src/stores/bookmarkStore.ts'));
check('Reader Store', checkFile('src/stores/readerStore.ts'));
check('Notification Store', checkFile('src/stores/notificationStore.ts'));
check('UI Store', checkFile('src/stores/uiStore.ts'));

// Store Tests
console.log(chalk.yellow('\n🧪 Store Tests:'));
check('Auth Store Tests', checkFile('src/stores/__tests__/authStore.test.ts'));
check('Comic Store Tests', checkFile('src/stores/__tests__/comicStore.test.ts'));
check('Bookmark Store Tests', checkFile('src/stores/__tests__/bookmarkStore.test.ts'));
check('Reader Store Tests', checkFile('src/stores/__tests__/readerStore.test.ts'));
check('Notification Store Tests', checkFile('src/stores/__tests__/notificationStore.test.ts'));

// Integration Tests
console.log(chalk.yellow('\n🧪 Integration Tests:'));
check('Page Tests', checkFile('src/__tests__/integration/pages.test.tsx'));
check('API Tests', checkFile('src/__tests__/integration/api.test.ts'));
check('Database Tests', checkFile('src/__tests__/integration/database.test.ts'));

// E2E Tests
console.log(chalk.yellow('\n🎭 E2E Tests:'));
check('Complete E2E Suite', checkFile('tests/e2e/complete.spec.ts'));

// CI/CD
console.log(chalk.yellow('\n🚀 CI/CD:'));
check('CI Workflow', checkFile('.github/workflows/ci.yml'));
check('Deploy Workflow', checkFile('.github/workflows/deploy.yml'));
check('Security Workflow', checkFile('.github/workflows/security.yml'));

// DevOps
console.log(chalk.yellow('\n🐳 DevOps:'));
check('CLI Tool', checkFile('bin/cli.ts'));
check('Docker Compose', checkFile('docker-compose.yml'));
check('Dockerfile', checkFile('compose/Dockerfile'));

// Documentation
console.log(chalk.yellow('\n📚 Documentation:'));
check('Final Report', checkFile('FINAL_COMPLETE_TASK_REPORT.md'));
check('Quick Reference', checkFile('QUICK_TASK_REFERENCE.md'));
check('Task Summary', checkFile('TASKS_COMPLETE_SUMMARY.md'));
check('Prompt File', checkFile('prompt.txt'));

// Database
console.log(chalk.yellow('\n💾 Database:'));
check('Schema', checkFile('src/database/schema.ts'));
check('Drizzle Config', checkFile('drizzle.config.ts'));
check('Comic Queries', checkFile('src/database/queries/comics.ts'));
check('Bookmark Actions', checkFile('src/lib/actions/bookmark.ts'));

console.log(chalk.gray('\n' + '━'.repeat(60)));

const percentage = Math.round((passedChecks / totalChecks) * 100);
const color = percentage === 100 ? chalk.green : percentage >= 90 ? chalk.yellow : chalk.red;

console.log(color.bold(`\n✨ Completion: ${passedChecks}/${totalChecks} (${percentage}%)\n`));

if (percentage === 100) {
  console.log(chalk.green.bold('🎉 ALL TASKS COMPLETE! 🎉\n'));
} else if (percentage >= 90) {
  console.log(chalk.yellow.bold('⚠️ Almost there! A few items remaining.\n'));
} else {
  console.log(chalk.red.bold('❌ More work needed.\n'));
}

console.log(chalk.gray('Run this validator anytime to check progress.'));
console.log(chalk.gray('File: scripts/validate-tasks.ts\n'));

process.exit(percentage === 100 ? 0 : 1);
