# Enhanced Seeding System V4 - Complete Documentation

## 📚 Overview

The Enhanced Seeding System V4 is a comprehensive database seeding solution for ComicWise that provides:

- **Dynamic JSON Loading**: Supports multiple JSON files for users, comics, and chapters
- **Image Download & Caching**: Prevents duplicate downloads with filesystem and database checks
- **Zod Validation**: Type-safe data validation for all entities
- **Conflict Handling**: Smart upsert operations with `onConflictDoUpdate` behavior
- **Password Management**: Uses `CUSTOM_PASSWORD` environment variable with bcryptjs encryption
- **Comprehensive Logging**: Clear, concise logs for each operation
- **Fallback Images**: Automatic fallback to placeholder images
- **Original Filenames**: Preserves original image names and extensions
- **Performance Tracking**: Detailed metrics and progress reporting

## 🗂️ File Structure

```
src/database/seed/
├── helpers/
│   ├── imageDownloader.ts         # Image download with deduplication
│   ├── passwordHasher.ts          # bcryptjs password hashing
│   └── validationSchemas.ts       # Zod schemas for all entities
├── seeders/
│   ├── userSeederV4.ts            # User seeding with CUSTOM_PASSWORD
│   ├── comicSeederV4.ts           # Comic seeding with image downloads
│   └── chapterSeederV4.ts         # Chapter seeding with image downloads
├── seedRunnerV4Enhanced.ts        # Main orchestrator
└── logger.ts                       # Logging utilities
```

## 🚀 Quick Start

### 1. Set Environment Variable

Add to your `.env.local`:

```env
CUSTOM_PASSWORD=YourSecurePassword123!
```

### 2. Run Seeding Commands

```bash
# Seed everything (users, comics, chapters)
pnpm db:seed

# Seed specific entities
pnpm db:seed:users
pnpm db:seed:comics
pnpm db:seed:chapters

# Dry run (preview without changes)
pnpm db:seed:dry-run

# Verbose mode (detailed logging)
pnpm db:seed:verbose
```

### 3. Via API Route

```bash
# Seed all entities
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -d '{"entities": "all"}'

# Seed users only
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -d '{"entities": "users"}'

# Dry run
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -d '{"entities": "all", "options": {"dryRun": true}}'
```

## 📋 Data Sources

The system automatically loads data from these JSON files:

### Users
- `users.json` - User accounts with roles (user, moderator, admin)

### Comics
- `comics.json` - Primary comic data
- `comicsdata1.json` - Additional comics (batch 1)
- `comicsdata2.json` - Additional comics (batch 2)

### Chapters
- `chapters.json` - Primary chapter data
- `chaptersdata1.json` - Additional chapters (batch 1)
- `chaptersdata2.json` - Additional chapters (batch 2)

## 🔧 Features Deep Dive

### 1. User Seeding

**Features:**
- CUSTOM_PASSWORD used for all users
- bcryptjs encryption (10 salt rounds)
- Fallback to `/shadcn.jpg` for user images
- Email-based conflict detection
- Role support (user, moderator, admin)

**JSON Format:**
```json
{
  "id": "5379c193-173a-4130-9fd0-525b80059394",
  "email": "user@example.com",
  "name": "John Doe",
  "image": "/avatars/john.jpg",
  "role": "user",
  "emailVerified": "2025-01-22T00:00:00.000Z"
}
```

**Upsert Behavior:**
- **Existing User**: Updates name, role, image, emailVerified
- **New User**: Creates with hashed password and all fields

### 2. Comic Seeding

**Features:**
- Image download to `/public/comics/covers/${comic.slug}/`
- Fallback to `/public/placeholder-comic.jpg`
- Original filename preservation
- Concurrent downloads (5 images at a time)
- Auto-creates genres, authors, artists, types
- Slug-based conflict detection

**JSON Format:**
```json
{
  "title": "Nano Machine",
  "slug": "nano-machine-dede73e1",
  "description": "Nanotechnology meets martial arts...",
  "rating": "9.9",
  "status": "Ongoing",
  "type": { "name": "Manhwa" },
  "author": { "name": "Hanjoong Wolya" },
  "artist": { "name": "Redice Studio" },
  "genres": [
    { "name": "Action" },
    { "name": "Fantasy" }
  ],
  "images": [
    { "url": "https://example.com/cover.webp" }
  ]
}
```

**Image Handling:**
- Checks filesystem first (fastest)
- Checks database for existing URLs
- Downloads only if not cached
- Preserves original filenames and extensions
- Saves to: `public/comics/covers/${slug}/image-name.webp`

### 3. Chapter Seeding

**Features:**
- Image download to `/public/comics/chapters/${comic.slug}/${chapter.slug}/`
- Concurrent downloads (5 images at a time)
- Original filename preservation
- Auto-generates chapter slugs
- Order preservation for chapter images
- Requires parent comic to exist

**JSON Format:**
```json
{
  "name": "Chapter 272",
  "title": "90. Lightning Qi (4)",
  "comic": {
    "title": "Nano Machine",
    "slug": "nano-machine-dede73e1"
  },
  "images": [
    { "url": "https://example.com/page-01.webp" },
    { "url": "https://example.com/page-02.webp" }
  ]
}
```

**Image Handling:**
- Downloads all chapter pages
- Saves with original filenames
- Preserves page order in database
- Saves to: `public/comics/chapters/${comic-slug}/${chapter-slug}/page-01.webp`

## 📊 Output Examples

### User Seeding Output
```
═══════════════════════════════════════════════════════════
🌱 Starting Enhanced User Seeding V4
═══════════════════════════════════════════════════════════
🔐 Using environment password for all users
📖 Loading users from: users.json
✅ Validated 4/4 users from users.json
⚙️  Processing 4 users from users.json...
✨ Created user: kurt@example.com (user)
✨ Created user: john@example.com (user)
✨ Created user: alexander@example.com (moderator)
✨ Created user: admin@example.com (admin)
═══════════════════════════════════════════════════════════
📊 User Seeding Complete:
   Total:   4
   Created: 4
   Updated: 0
   Errors:  0
═══════════════════════════════════════════════════════════
```

### Comic Seeding Output
```
═══════════════════════════════════════════════════════════
🌱 Starting Enhanced Comic Seeding V4
═══════════════════════════════════════════════════════════
📖 Loading comics from: comics.json
✅ Validated 125/125 comics from comics.json
⚙️  Processing 125 comics from comics.json...
✨ Created genre: Action
✨ Created author: Hanjoong Wolya
✨ Created artist: Redice Studio
✨ Created type: Manhwa
📸 Comic images: 1 downloaded, 0 cached (Nano Machine)
✨ Created comic: Nano Machine
  Progress: 10/125 comics processed
...
═══════════════════════════════════════════════════════════
📊 Comic Seeding Complete:
   Total:             125
   Created:           125
   Updated:           0
   Errors:            0
   Images Downloaded: 125
   Images Cached:     0
═══════════════════════════════════════════════════════════
```

### Chapter Seeding Output
```
═══════════════════════════════════════════════════════════
🌱 Starting Enhanced Chapter Seeding V4
═══════════════════════════════════════════════════════════
📖 Loading chapters from: chapters.json
✅ Validated 1000/1000 chapters from chapters.json
⚙️  Processing 1000 chapters from chapters.json...
📸 Chapter images: 15 downloaded, 0 cached (Chapter 272)
✨ Created chapter: Chapter 272 (nano-machine-dede73e1)
  Progress: 50/1000 chapters processed
...
═══════════════════════════════════════════════════════════
📊 Chapter Seeding Complete:
   Total:             1000
   Created:           1000
   Updated:           0
   Skipped:           0
   Errors:            0
   Images Downloaded: 15000
   Images Cached:     0
═══════════════════════════════════════════════════════════
```

## 🔍 Image Download Deduplication

The system prevents duplicate downloads using a multi-layer check:

1. **Filesystem Check**: Fastest - checks if file already exists
2. **Database Check**: Checks if URL is already in `comicImage` or `chapterImage` tables
3. **Original Filename**: Preserves the original filename from URL
4. **Fallback**: Uses placeholder images if download fails

### Example Image Paths

**Comic Covers:**
```
public/comics/covers/nano-machine-dede73e1/01JKTBDEEZRNKTH6TRHPF5PCXM-optimized.webp
public/comics/covers/solo-leveling/cover-image.jpg
```

**Chapter Images:**
```
public/comics/chapters/nano-machine-dede73e1/nano-machine-chapter-272/00-optimized.webp
public/comics/chapters/nano-machine-dede73e1/nano-machine-chapter-272/01-optimized.webp
```

## 🛡️ Validation & Error Handling

### Zod Schemas

All data is validated using Zod schemas:

- **UserSeedSchema**: Email format, role enum, dates
- **ComicSeedSchema**: Title, slug, rating range, status enum, nested relations
- **ChapterSeedSchema**: Name, comic reference, image arrays

### Error Handling

- **Validation Errors**: Logged with row number, entity continues
- **Download Errors**: Falls back to placeholder, logs warning
- **Database Errors**: Logged with full context, increments error count
- **Missing Relations**: Skips entity (e.g., chapter without parent comic)

## 📈 Performance Metrics

### Concurrency Settings

```typescript
const IMAGE_CONCURRENCY = 5; // Download 5 images simultaneously
```

### Batch Processing

- Users: Processed sequentially (fast due to no images)
- Comics: Progress logged every 10 comics
- Chapters: Progress logged every 50 chapters

### Typical Performance

- **Users**: ~0.5s per user (password hashing is expensive)
- **Comics**: ~2-3s per comic (includes image download)
- **Chapters**: ~1-2s per chapter (multiple images)

**Example Full Seed:**
- 4 users + 125 comics + 1000 chapters = ~45 minutes (with all images)

## 🔧 Customization

### Change Image Concurrency

Edit `comicSeederV4.ts` or `chapterSeederV4.ts`:

```typescript
const IMAGE_CONCURRENCY = 10; // Increase for faster downloads
```

### Change Fallback Images

Edit seeder files:

```typescript
const FALLBACK_COMIC_IMAGE = "./public/my-custom-placeholder.jpg";
const FALLBACK_USER_IMAGE = "/my-custom-avatar.jpg";
```

### Change Image Directories

```typescript
const COMIC_COVERS_DIR = "./public/comics/covers";
const CHAPTER_IMAGES_DIR = "./public/comics/chapters";
```

## 🧪 Testing

### Dry Run Mode

```bash
pnpm db:seed:dry-run
```

Validates JSON, checks schemas, but makes no database changes.

### Verbose Mode

```bash
pnpm db:seed:verbose
```

Shows debug-level logs including:
- Individual database queries
- Image cache hits
- Genre/author/artist creation

## 🐛 Troubleshooting

### Issue: Images not downloading

**Solution**: Check image URLs are accessible and not rate-limited

```bash
curl -I https://gg.asuracomic.net/storage/media/...
```

### Issue: Password hash fails

**Solution**: Ensure `CUSTOM_PASSWORD` is set in `.env.local`

```bash
grep CUSTOM_PASSWORD .env.local
```

### Issue: Comic not found for chapter

**Solution**: Ensure comics are seeded before chapters

```bash
pnpm db:seed:comics
pnpm db:seed:chapters
```

### Issue: Validation errors

**Solution**: Check JSON format matches schema

```bash
# Validate JSON syntax
cat users.json | jq .
```

## 📝 API Reference

### Seed Endpoint

**POST** `/api/seed`

**Request Body:**
```json
{
  "entities": "all|users|comics|chapters",
  "options": {
    "dryRun": false,
    "verbose": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": { "total": 4, "created": 4, "updated": 0, "errors": 0 },
    "comics": { "total": 125, "created": 125, "updated": 0, "errors": 0, "imagesDownloaded": 125, "imagesCached": 0 },
    "chapters": { "total": 1000, "created": 1000, "updated": 0, "errors": 0, "imagesDownloaded": 15000, "imagesCached": 0 }
  }
}
```

## 🎯 Best Practices

1. **Always set CUSTOM_PASSWORD** before seeding users
2. **Seed in order**: Users → Comics → Chapters
3. **Use dry-run** to preview changes before committing
4. **Monitor disk space** - images can take significant space
5. **Check logs** for validation errors and fix source JSON
6. **Use verbose mode** when debugging specific issues
7. **Backup database** before running full seed

## 📚 Related Documentation

- [Database Schema](../schema.ts) - Full database structure
- [Seed System Guide](./SEED_SYSTEM_GUIDE.md) - Architecture overview
- [README](./README.md) - General seeding documentation
- [Environment Variables](../../../env.ts) - T3 Env configuration

## 🆘 Support

For issues or questions:
1. Check logs in console output
2. Verify JSON format matches schemas
3. Ensure all environment variables are set
4. Check database connectivity
5. Review [Troubleshooting](#-troubleshooting) section above
