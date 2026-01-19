# 🌱 Enhanced Seed System - Complete Index

**Version**: 3.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: January 15, 2026

---

## 📚 Navigation Guide

### Core System Files

#### 1. **Entry Point** → `run.ts` ⭐

Main orchestration file for seeding operations

- Database connection testing
- Image manager initialization
- Sequential seeding (users → comics → chapters)
- Statistics and reporting
- Error handling

**Usage**:

```bash
pnpm db:seed              # Execute seeding
pnpm db:seed:dry-run      # Validate without persisting
pnpm db:seed:verbose      # Verbose output
```

---

### Data Validation & Loading

#### 2. **Zod Schemas** → `schemas.ts` 📋

Comprehensive validation schemas for all seed data types

**Exports**:

- `userSeedSchema` - User data validation
- `comicSeedSchema` - Comic data validation
- `chapterSeedSchema` - Chapter data validation
- `imageSchema` - Image URL validation

**Key Features**:

- Type-safe with full TypeScript inference
- Custom error messages
- Field-level validation
- Enum support for roles and statuses

#### 3. **Dynamic Data Loader** → `dataLoaderEnhanced.ts` 📥

Universal loader for all data types with pattern matching

**Main Functions**:

```typescript
loadUsers(patterns?: string[])     // Load user data
loadComics(pattern?: string)       // Load comic data
loadChapters(patterns?: string[])  // Load chapter data
loadAllSeedData()                  // Load everything
```

**Features**:

- Glob pattern support
- Automatic JSON parsing
- Zod validation
- Error tracking
- Batch loading

**Supported Patterns**:

- `users.json` - Single file
- `comics*.json` - Multiple files
- `chapters*.json` - Multiple files
- `chaptersdata1.json` - Specific files

---

### Image Management

#### 4. **Image Manager** → `imageManager.ts` 🖼️

Standalone image caching and download system

**Class**: `SeedImageManager`

**Key Methods**:

```typescript
downloadImage(url: string)                 // Download single image
downloadImages(urls: string[], concurrency: number)  // Batch download
getStats()                                 // Get statistics
reset()                                    // Reset manager
```

**Features**:

- Triple-layer caching strategy:
  1. Session cache (in-memory)
  2. File system cache (public/uploads)
  3. Remote download (fallback)
- MD5 hash-based filenames
- Extension preservation
- Parallel downloads with rate limiting
- Error recovery

**Usage**:

```typescript
const imageManager = await getImageManager();
const result = await imageManager.downloadImage(url);
const stats = imageManager.getStats();
```

---

### Seeding Logic

#### 5. **User Seeder** → `seeders/userSeederEnhanced.ts` 👤

User creation and updates with avatar management

**Main Function**:

```typescript
seedUsersFromFiles(patterns?: string[]) → Promise<SeedStats>
```

**Features**:

- Upsert by email address
- Password hashing with bcryptjs
- Avatar download and caching
- Role assignment
- Email verification support

**Process**:

1. Load users from JSON
2. Validate against schema
3. Check for existing user
4. Download avatar if provided
5. Create or update record

#### 6. **Comic Seeder** → `seeders/comicSeederEnhanced.ts` 📖

Comic creation with metadata and genre management

**Main Function**:

```typescript
seedComicsFromFiles(pattern?: string) → Promise<SeedStats>
```

**Features**:

- Upsert by slug
- Metadata pre-caching
- Get-or-create pattern for types, authors, artists
- Genre association
- Cover image handling
- Rating and status management

**Process**:

1. Load comics from JSON
2. Initialize metadata caches
3. Get/create associated metadata
4. Download cover image
5. Create or update comic
6. Manage genre associations

#### 7. **Chapter Seeder** → `seeders/chapterSeederEnhanced.ts` 📄

Chapter creation with multi-image support

**Main Function**:

```typescript
seedChaptersFromFiles(patterns?: string[]) → Promise<SeedStats>
```

**Features**:

- Find comic by slug
- Upsert by (comicId, chapterNumber)
- Multi-image per chapter
- Sequential page numbering
- Parallel image downloads
- Date parsing

**Process**:

1. Load chapters from JSON
2. Find associated comic
3. Check for existing chapter
4. Create or update chapter
5. Download and save images

---

### Documentation

#### 8. **Comprehensive Guide** → `SEED_SYSTEM_GUIDE.md` 📖

Complete documentation covering all aspects

**Sections**:

- Overview and features
- Architecture and design
- Data file specifications
- Validation rules
- Image management strategy
- Seeding process flow
- Command reference
- Best practices
- Troubleshooting
- Performance tuning

#### 9. **Enhancement Report** → `../SEED_SYSTEM_ENHANCEMENT_REPORT.md` 📊

Detailed report of enhancements and improvements

**Covers**:

- Enhancements completed
- Architecture overview
- Implementation details
- Quality assurance
- Best practices
- Performance metrics
- Migration guide

---

## 🔄 Data Flow Overview

### Complete Seeding Workflow

```
┌─────────────────────────────────────┐
│    pnpm db:seed (run.ts)            │
└────────────┬────────────────────────┘
             │
      ┌──────┴───────┐
      ▼              ▼
   Test DB     Init Image Manager
      │              │
      └──────┬───────┘
             │
      ┌──────┴─────────────────┬──────────────┐
      ▼                        ▼              ▼
┌──────────────┐      ┌──────────────┐  ┌──────────────┐
│Seed Users    │      │Seed Comics   │  │Seed Chapters │
├──────────────┤      ├──────────────┤  ├──────────────┤
│1. Load data  │      │1. Load data  │  │1. Load data  │
│2. Validate   │      │2. Validate   │  │2. Validate   │
│3. Upsert     │      │3. Cache meta │  │3. Find comic │
│4. DL avatar  │      │4. Get/create │  │4. Upsert     │
│5. Hash pass  │      │5. Upsert     │  │5. DL images  │
└──────┬───────┘      │6. DL cover   │  │6. Save pages │
       │              │7. Add genres │  └──────┬───────┘
       │              └──────┬───────┘         │
       │                     │                 │
       └─────────────┬───────┴─────────────────┘
                     │
             ┌───────▼────────┐
             │ Report Stats   │
             │ Log Summary    │
             │ Exit Process   │
             └────────────────┘
```

### Image Processing Flow

```
URL Input
   │
   ├─ Session Cache? YES → Use cached path ✓
   │
   └─ File System? YES → Register cache, use path ✓
      │
      └─ Download
         ├─ MD5 hash URL
         ├─ Fetch from remote
         ├─ Save to public/uploads/
         ├─ Register cache
         └─ Use local path ✓
```

---

## 🛠️ API Reference

### SeedImageManager

```typescript
// Initialize
const imageManager = await getImageManager();

// Download single image
const result = await imageManager.downloadImage(url);
// Returns: { original, local?, cached, success, error? }

// Download multiple images (parallel)
const results = await imageManager.downloadImages(urls, concurrency);

// Get statistics
const stats = imageManager.getStats();
// Returns: { totalProcessed, cachedUrls, localMappings }

// Reset for new operation
resetImageManager();
```

### Data Loaders

```typescript
// Load users
const result = await loadUsers(["users.json"]);
// Returns: { data: UserSeedData[], valid, invalid, errors }

// Load comics
const result = await loadComics("comics*.json");

// Load chapters
const result = await loadChapters(["chapters.json", "chaptersdata*.json"]);

// Load all
const { users, comics, chapters } = await loadAllSeedData();
```

### Seeders

```typescript
// Seed users
const stats = await seedUsersFromFiles(["users.json"]);
// Returns: { total, created, updated, skipped, errors }

// Seed comics
const stats = await seedComicsFromFiles("comics*.json");

// Seed chapters
const stats = await seedChaptersFromFiles(["chapters*.json"]);
```

---

## 📊 Data Structure Examples

### users.json

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://example.com/avatar.jpg",
    "role": "user",
    "emailVerified": "2025-11-14T17:52:22.485Z"
  }
]
```

### comics.json

```json
[
  {
    "title": "Nano Machine",
    "slug": "nano-machine",
    "description": "Description...",
    "images": [{ "url": "https://..." }],
    "coverImage": "https://...",
    "rating": 9.5,
    "status": "Ongoing",
    "type": { "name": "Manga" },
    "author": { "name": "Author Name" },
    "artist": { "name": "Artist Name" },
    "genres": [{ "name": "Action" }]
  }
]
```

### chapters.json

```json
[
  {
    "title": "Chapter 1",
    "chapterNumber": 1,
    "releaseDate": "2025-01-15",
    "images": [{ "url": "https://..." }],
    "comic": {
      "title": "Comic Title",
      "slug": "comic-title"
    }
  }
]
```

---

## ✅ Validation Rules

### User Data

- `id`: Valid UUID (required)
- `name`: 1-100 characters (required)
- `email`: Valid email format (required)
- `image`: Valid URL (optional)
- `role`: "user" | "admin" | "moderator" (default: "user")

### Comic Data

- `title`: 1-255 characters (required)
- `slug`: 1-512 characters (required)
- `description`: 1-5000 characters (required)
- `coverImage`: Valid URL (optional, required for creation)
- `rating`: 0-10 (optional)
- `genres`: Array of {name} objects (optional)

### Chapter Data

- `title`: 1-255 characters (required)
- `chapterNumber`: Positive integer (required)
- `comic.title`: Required for lookup
- `comic.slug`: Required for lookup
- `images`: Array of {url} objects (optional)

---

## 🚀 Quick Start

### 1. Prepare Data Files

```bash
# Place JSON files in project root
users.json
comics.json
chapters.json
```

### 2. Run Seeding

```bash
# Validate without persisting
pnpm db:seed:dry-run

# Full seed
pnpm db:seed
```

### 3. Check Results

```bash
# Open Drizzle Studio
pnpm db:studio

# View uploaded images
ls public/uploads/
```

---

## 🐛 Troubleshooting

| Issue                | Solution                                     | Reference                        |
| -------------------- | -------------------------------------------- | -------------------------------- |
| Validation errors    | Check JSON format against schema             | schemas.ts, SEED_SYSTEM_GUIDE.md |
| Image downloads fail | Verify URLs accessible, check disk space     | imageManager.ts, Guide section 8 |
| Database connection  | Run `pnpm health:db`                         | run.ts                           |
| Out of memory        | Use `NODE_OPTIONS=--max-old-space-size=4096` | Guide section 12                 |
| Duplicate records    | Use upsert logic - runs automatically        | seeders/\*.ts                    |

---

## 📈 Performance Tips

1. **Image Downloads**
   - Check network speed
   - Adjust concurrency if needed (default: 3)
   - Pre-check URLs availability

2. **Database**
   - Use local database for testing
   - Increase connection pool for production
   - Monitor database size

3. **Memory**
   - Process large datasets in batches
   - Monitor with `node --max-old-space-size`
   - Use dry-run first

---

## 🔗 Related Files

| File                     | Purpose                   |
| ------------------------ | ------------------------- |
| `.env.local`             | Environment configuration |
| `appConfig.ts`           | Application settings      |
| `src/database/schema.ts` | Database schema           |
| `src/database/db.ts`     | Database connection       |
| `package.json`           | npm scripts               |

---

## 📞 Support Resources

1. **Documentation**: `SEED_SYSTEM_GUIDE.md`
2. **Report**: `SEED_SYSTEM_ENHANCEMENT_REPORT.md`
3. **Schemas**: `schemas.ts`
4. **Examples**: Data loader functions
5. **Logging**: Check terminal output with verbose flag

---

## ✨ Summary

The enhanced seed system is **production-ready** with:

✅ Dynamic data loading  
✅ Comprehensive validation  
✅ Smart image caching  
✅ Intelligent upsert logic  
✅ Parallel processing  
✅ Professional logging  
✅ Complete documentation  
✅ Best practices throughout

**Get Started**: `pnpm db:seed` 🚀

---

**Version**: 3.0.0  
**Status**: ✅ PRODUCTION READY  
**Last Updated**: January 15, 2026
