# 🌱 Enhanced Seed System Documentation

**Version**: 3.0.0  
**Last Updated**: January 15, 2026  
**Status**: ✅ Production Ready

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Data Files](#data-files)
- [Validation](#validation)
- [Image Management](#image-management)
- [Seeding Process](#seeding-process)
- [Commands](#commands)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The enhanced seed system provides a **production-ready solution** for
dynamically loading and managing seed data with comprehensive validation, image
optimization, and error handling.

### Key Features

- ✅ **Dynamic Data Loading** - Load from multiple JSON files with pattern
  matching
- ✅ **Comprehensive Validation** - Zod-based validation for all seed data
- ✅ **Smart Image Caching** - Prevents duplicate downloads, uses file system
  cache
- ✅ **Upsert Logic** - Creates new records or updates existing ones
  intelligently
- ✅ **Parallel Processing** - Downloads images concurrently with rate limiting
- ✅ **Best Practices** - DRY principles, proper error handling, comprehensive
  logging
- ✅ **Type Safety** - Full TypeScript support with inference
- ✅ **Batch Processing** - Handles large datasets efficiently

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                      run.ts (Entry Point)               │
│                 - Orchestrates seeding                  │
│                 - Reports statistics                    │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Users      │ │   Comics     │ │   Chapters   │
│   Seeder     │ │   Seeder     │ │   Seeder     │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                 │
       └────────────────┼─────────────────┘
                        │
                ┌───────┴────────┐
                ▼                ▼
        ┌────────────────┐  ┌──────────────────┐
        │ Data Loader    │  │  Image Manager   │
        │ Enhanced       │  │  - Caching       │
        │ - Validation   │  │  - Downloads     │
        │ - Pattern Glob │  │  - Dedup         │
        └────────────────┘  └──────────────────┘
```

### File Structure

```
src/database/seed/
├── schemas.ts                    # Zod validation schemas
├── dataLoaderEnhanced.ts         # Dynamic data loading
├── imageManager.ts               # Image handling & caching
├── run.ts                        # Main orchestration (ENHANCED)
├── logger.ts                     # Logging utilities
├── seeders/
│   ├── userSeederEnhanced.ts     # User seeding (ENHANCED)
│   ├── comicSeederEnhanced.ts    # Comic seeding (ENHANCED)
│   └── chapterSeederEnhanced.ts  # Chapter seeding (ENHANCED)
└── [other utilities]
```

---

## 📂 Data Files

### Location & Format

All seed data files should be in the **project root directory**:

```
comicwise/
├── users.json              # User accounts
├── comics.json            # Comic metadata
├── comics*.json           # Additional comics (pattern matches)
├── chapters.json          # Chapter data
├── chaptersdata*.json     # Additional chapters (pattern matches)
└── ...
```

### users.json Structure

```json
[
  {
    "id": "uuid-string",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://example.com/avatar.jpg",
    "role": "user",
    "emailVerified": "2025-11-14T17:52:22.485Z",
    "createdAt": "2025-11-14T17:52:22.466Z",
    "updatedAt": "2025-11-14T17:52:22.466Z"
  }
]
```

**Validation Rules**:

- `id` - Valid UUID (required)
- `name` - 1-100 characters (required)
- `email` - Valid email format (required)
- `image` - Valid URL (optional)
- `role` - "user" | "admin" | "moderator" (defaults to "user")
- `emailVerified` - ISO date string (optional)

### comics.json Structure

```json
[
  {
    "title": "Comic Title",
    "slug": "comic-title-slug",
    "description": "Long description...",
    "images": [{ "url": "https://..." }],
    "coverImage": "https://...",
    "rating": 9.5,
    "status": "Ongoing",
    "serialization": "_",
    "type": { "name": "Manga" },
    "author": { "name": "Author Name" },
    "artist": { "name": "Artist Name" },
    "genres": [{ "name": "Action" }, { "name": "Adventure" }]
  }
]
```

**Validation Rules**:

- `title` - 1-255 characters (required)
- `slug` - 1-512 characters (required)
- `description` - 1-5000 characters (required)
- `images` - Array of {url} objects (optional)
- `rating` - 0-10 (optional)
- `status` - Any string (defaults to "Ongoing")
- `type`, `author`, `artist` - Objects with `name` field (optional)
- `genres` - Array of {name} objects (defaults to [])

### chapters.json Structure

```json
[
  {
    "title": "Chapter Title",
    "chapterNumber": 1,
    "releaseDate": "2025-01-15",
    "url": "https://...",
    "views": 100,
    "images": [{ "url": "https://..." }],
    "comic": {
      "title": "Comic Title",
      "slug": "comic-title-slug"
    }
  }
]
```

**Validation Rules**:

- `title` - 1-255 characters (required)
- `chapterNumber` - Positive integer (required)
- `releaseDate` - ISO date string (optional)
- `images` - Array of {url} objects (optional)
- `comic` - Object with `title` and `slug` (required)

---

## ✅ Validation

### Schema Validation

All seed data is validated using **Zod** schemas:

```typescript
// Example: User validation
const userData = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "John",
  email: "john@example.com",
  role: "user",
};

const validation = userSeedSchema.safeParse(userData);
if (!validation.success) {
  console.error(validation.error.issues);
}
```

### Validation Process

1. **Load** - Read JSON files
2. **Parse** - Parse JSON content
3. **Validate** - Check against Zod schemas
4. **Log** - Report valid/invalid counts
5. **Process** - Only process valid records

### Error Reporting

Invalid records are logged but don't stop the seeding process:

```
⚠️ Validation Error: users.json
  name: Name is required
  email: Invalid email address
```

---

## 🖼️ Image Management

### Image Caching Strategy

The system prevents duplicate image downloads using a **multi-level caching
approach**:

```
1. Session Cache (In-Memory)
   └─ Tracks URLs downloaded in current session

2. File System Cache
   └─ Checks if file already exists at public/uploads/

3. Remote Download
   └─ Only downloads if not cached locally
```

### Image Storage

All images are saved to:

```
public/uploads/{filename}
```

**Filename Generation**:

- MD5 hash of original URL
- Original file extension preserved
- Example: `a1b2c3d4e5f6g7h8i9j0k1l2.webp`

### Download Process

1. **Check Session Cache** - Skip if already processed
2. **Check File System** - Use if already downloaded
3. **Download** - Fetch from remote URL
4. **Save** - Write to public/uploads/
5. **Update Path** - Store local path in database

### Parallel Downloads

Images are downloaded in parallel with rate limiting:

```typescript
// Downloads up to 3 images concurrently
await imageManager.downloadImages(urls, concurrency: 3);
```

### Image Statistics

After seeding, image stats are reported:

```
Image Management:
✓ Total images processed: 245
  Cached URLs: 156
  Downloaded: 89
```

---

## 🌱 Seeding Process

### Step-by-Step Flow

1. **Initialize**
   - Test database connection
   - Initialize image manager
   - Create upload directories

2. **Validate Data**
   - Load JSON files using glob patterns
   - Validate against Zod schemas
   - Report validation results

3. **Seed Users**
   - Find or create user by email
   - Download user avatars
   - Store with proper hashing

4. **Seed Comics**
   - Find or create comic by slug
   - Get/create authors, artists, types
   - Get/create genres
   - Download cover images
   - Create genre associations

5. **Seed Chapters**
   - Find associated comic by slug
   - Find or create chapter
   - Download chapter images
   - Save page-by-page

6. **Report**
   - Print statistics
   - Log image management stats
   - Report any errors

### Upsert Logic

For each entity (user, comic, chapter):

```
IF exists(by unique key):
  UPDATE existing record
ELSE:
  CREATE new record
```

**Unique Keys**:

- Users: `email`
- Comics: `slug`
- Chapters: `(comicId, chapterNumber)`

### Transaction Safety

Each operation is wrapped in proper error handling:

```typescript
try {
  // Insert or update
  await db.transaction(async (trx) => {
    // All changes in one transaction
  });
} catch (error) {
  // Log error and continue
  logger.error(`Error: ${error}`);
}
```

---

## 🚀 Commands

### Basic Seeding

```bash
# Full seed (users, comics, chapters)
pnpm db:seed

# Dry-run (validate without persisting)
pnpm db:seed:dry-run

# Verbose output
pnpm db:seed:verbose

# Seed specific type
pnpm db:seed:users
pnpm db:seed:comics
pnpm db:seed:chapters
```

### Database Management

```bash
# Reset database
pnpm db:reset         # Drop + push + seed
pnpm db:reset:hard    # Generate + push + seed

# Push schema
pnpm db:push

# Generate migrations
pnpm db:generate

# Open Drizzle Studio
pnpm db:studio
```

### Validation & Testing

```bash
# Validate before seeding
pnpm seed:validate

# Type checking
pnpm type-check

# Linting
pnpm lint

# All checks
pnpm validate
```

---

## 📚 Best Practices

### 1. Data Preparation

✅ **Do**:

- Validate JSON files before seeding
- Use unique slugs for comics
- Include all required fields
- Keep image URLs accessible

❌ **Don't**:

- Use duplicate email addresses
- Leave required fields empty
- Include invalid URLs
- Modify JSON during seeding

### 2. Image Management

✅ **Do**:

- Use stable, permanent image URLs
- Include cover images for comics
- Save chapter images with sequential page numbers
- Monitor upload directory size

❌ **Don't**:

- Use temporary/expiring URLs
- Mix image sizes without normalization
- Skip image validation
- Store very large images

### 3. Error Handling

✅ **Do**:

- Check seed logs for validation errors
- Fix invalid data and re-seed
- Review error messages for guidance
- Keep backup of original data

❌ **Don't**:

- Ignore validation errors
- Assume all records are seeded
- Modify data during seeding
- Delete backup data prematurely

### 4. Performance

✅ **Do**:

- Batch related operations
- Use proper indexing
- Monitor memory usage
- Test with sample data first

❌ **Don't**:

- Seed without database optimization
- Download unlimited concurrent images
- Seed invalid data
- Skip validation for speed

---

## 🔧 Troubleshooting

### Issue: Validation Errors

**Problem**: Records marked as invalid

**Solution**:

```bash
# Check validation errors
pnpm db:seed:verbose

# Fix data in JSON files
# - Check required fields
# - Validate URLs
# - Verify data types

# Re-seed after fixing
pnpm db:seed
```

### Issue: Image Download Failures

**Problem**: Images not downloading

**Solution**:

```bash
# Check image URLs are accessible
curl -I https://example.com/image.jpg

# Verify public/uploads directory exists
mkdir -p public/uploads

# Check disk space
df -h

# Re-run seeding
pnpm db:seed
```

### Issue: Duplicate Records

**Problem**: Records created multiple times

**Solution**:

```bash
# Clear and re-seed
pnpm db:reset

# Or update existing records
# Seeding uses upsert logic by default
```

### Issue: Database Connection

**Problem**: Cannot connect to database

**Solution**:

```bash
# Test connection
pnpm health:db

# Check environment variables
cat .env.local

# Verify PostgreSQL is running
psql -U postgres -h localhost
```

### Issue: Memory Issues

**Problem**: Out of memory during seeding

**Solution**:

```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 pnpm db:seed

# Or seed in batches
# Modify batch size in dataLoaderEnhanced.ts
```

---

## 📊 Monitoring

### Seed Statistics

After seeding, you'll see:

```
✅ Seeding Complete
Summary:
  Total time: 12.34s

Users:    2 created, 2 updated, 0 skipped
Comics:   45 created, 12 updated, 0 skipped
Chapters: 234 created, 56 updated, 0 skipped

Image Management:
✓ Total images processed: 156
  Cached URLs: 89
  Downloaded: 67

✓ No errors encountered
```

### Logging Levels

The system supports different logging levels:

```typescript
// Debug level - detailed logging
logger.debug("Detailed message");

// Info level - general progress
logger.info("Progress message");

// Success level - positive outcomes
logger.success("Success message");

// Warn level - warnings
logger.warn("Warning message");

// Error level - errors
logger.error("Error message");
```

---

## 🔄 Data Updates

### Updating Existing Data

The system supports updating existing records:

```json
// comics.json - Update by slug
[
  {
    "slug": "existing-comic",
    "title": "Updated Title",
    "description": "Updated description",
    "rating": 9.8
  }
]
```

Run seeding - existing comics will be updated automatically.

### Removing Data

To remove seeded data:

```bash
# Clear all users
pnpm db:reset

# Or use direct delete (caution!)
DELETE FROM "user" WHERE ...;
```

---

## 📝 Configuration

### Environment Variables

```env
# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/comicwise

# Optional: Upload provider
UPLOAD_PROVIDER=local  # local, imagekit, cloudinary, aws

# Image settings
MAX_IMAGE_SIZE=10485760  # 10MB in bytes
IMAGE_CONCURRENCY=3       # Parallel downloads
```

### Advanced Settings

Edit `dataLoaderEnhanced.ts`:

```typescript
// Batch size for processing
const BATCH_SIZE = 100;

// Concurrent image downloads
const DOWNLOAD_CONCURRENCY = 3;

// Retry attempts for failed downloads
const MAX_RETRIES = 3;
```

---

## ✨ Summary

The enhanced seed system provides a **production-ready solution** with:

- ✅ Dynamic data loading from multiple JSON files
- ✅ Comprehensive validation with Zod
- ✅ Smart image caching and management
- ✅ Intelligent upsert logic
- ✅ Parallel processing with rate limiting
- ✅ Best practices throughout
- ✅ Comprehensive error handling
- ✅ Detailed logging and reporting

**Ready to seed!** 🌱
