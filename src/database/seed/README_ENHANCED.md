# Enhanced Dynamic Seeding System

A comprehensive, type-safe database seeding system for ComicWise with full CRUD
API support.

## 🌟 Features

- ✅ **Dynamic Data Loading** - Automatically loads from multiple JSON sources
- ✅ **Zod Validation** - Full type safety with schema validation
- ✅ **Upsert Logic** - Smart update/insert with conflict resolution
- ✅ **Batch Processing** - Efficient bulk operations
- ✅ **Progress Tracking** - Detailed logging and progress reports
- ✅ **DRY Principles** - Reusable base classes and helpers
- ✅ **RESTful API** - Complete CRUD operations via HTTP
- ✅ **CLI Support** - Flexible command-line interface
- ✅ **Transaction Support** - Safe database operations
- ✅ **Relation Handling** - Automatic author/artist/genre/type management

## 📁 Structure

```
src/database/seed/
├── types.ts                    # TypeScript interfaces & types
├── dataLoader.ts               # Dynamic JSON data loader
├── baseSeeder.ts               # Abstract base seeder class
├── seedHelpersEnhanced.ts      # Main seeding functions
├── runEnhanced.ts              # CLI entry point
├── config.ts                   # CLI configuration parser
├── logger.ts                   # Enhanced logging
└── seeders/
    ├── userSeederEnhanced.ts   # User seeding logic
    ├── comicSeederEnhanced.ts  # Comic seeding (with relations)
    └── chapterSeederEnhanced.ts # Chapter seeding

src/app/api/seed/
└── route.ts                    # RESTful CRUD API
```

## 🚀 Quick Start

### CLI Usage

```bash
# Seed all entities
pnpm seed

# Seed specific entities
pnpm seed --users
pnpm seed --comics
pnpm seed --chapters

# Clear all data
pnpm seed --clear

# Reset (clear + seed)
pnpm seed --reset

# Dry run (validate without inserting)
pnpm seed --dry-run

# Force overwrite existing records
pnpm seed --force

# Custom batch size
pnpm seed --batch-size=500

# Verbose logging
pnpm seed --verbose
```

### API Usage

```typescript
// Seed all entities
fetch("/api/seed", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    entities: "all",
    options: {
      batchSize: 100,
      verbose: true,
    },
  }),
});

// Seed specific entity
fetch("/api/seed", {
  method: "POST",
  body: JSON.stringify({
    entities: "users", // or "comics" or "chapters"
    options: {
      forceOverwrite: true,
    },
  }),
});

// Validate data (GET)
fetch("/api/seed");

// Clear all data (DELETE)
fetch("/api/seed", { method: "DELETE" });

// Reset database (PUT)
fetch("/api/seed", { method: "PUT" });

// Upsert data (PATCH)
fetch("/api/seed", {
  method: "PATCH",
  body: JSON.stringify({
    entities: "all",
  }),
});
```

## 📊 Data Sources

The system automatically loads from these JSON files:

### Users

- `./users.json`
- `./data/users.json`
- `./seed-data/users*.json`

### Comics

- `./comics.json`
- `./comicsdata.json`
- `./comicsdata*.json`
- `./data/comics*.json`
- `./seed-data/comics*.json`

### Chapters

- `./chapters.json`
- `./chaptersdata.json`
- `./chaptersdata*.json`
- `./data/chapters*.json`
- `./seed-data/chapters*.json`

## 🔧 Configuration Options

```typescript
interface SeedOptions {
  batchSize?: number; // Batch size (default: 100)
  verbose?: boolean; // Enable detailed logging
  dryRun?: boolean; // Validate without inserting
  skipValidation?: boolean; // Skip Zod validation
  forceOverwrite?: boolean; // Overwrite existing records
  useTransaction?: boolean; // Use database transactions
}
```

## 📝 JSON Format Examples

### Users (`users.json`)

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user",
    "image": "/avatar.jpg",
    "emailVerified": "2025-01-01T00:00:00Z"
  }
]
```

### Comics (`comics.json`)

```json
[
  {
    "title": "Comic Title",
    "slug": "comic-slug",
    "description": "Description",
    "coverImage": "/cover.jpg",
    "status": "Ongoing",
    "rating": "9.5",
    "author": { "name": "Author Name" },
    "artist": { "name": "Artist Name" },
    "type": { "name": "Manhwa" },
    "genres": [{ "name": "Action" }, { "name": "Adventure" }]
  }
]
```

### Chapters (`chapters.json`)

```json
[
  {
    "name": "Chapter 1",
    "title": "Chapter Title",
    "comic": { "slug": "comic-slug" },
    "chapterNumber": 1,
    "images": [{ "url": "/image1.jpg" }, { "url": "/image2.jpg" }]
  }
]
```

## 🎯 Features in Detail

### 1. Upsert Logic

- Checks for existing records by unique field
- Updates if exists (with `forceOverwrite`)
- Inserts if new
- Skips if exists (without `forceOverwrite`)

### 2. Relation Handling

- Auto-creates authors, artists, genres, types
- Caches lookups for performance
- Links entities automatically

### 3. Batch Processing

- Processes large datasets efficiently
- Configurable batch sizes
- Progress tracking
- Error isolation (one batch failure doesn't stop others)

### 4. Validation

- Zod schema validation for all entities
- Detailed error reporting
- Optional validation skip for performance

### 5. Progress Tracking

```
Seeding Users
Loading data from sources: ./users.json
Loaded 50 users from JSON files
Validating 50 records...
Transforming 50 records...
Processing 1 batches (size: 100)...
✓ Users: 50 inserted, 0 updated, 0 skipped, 0 errors
```

## 🔒 Type Safety

All seeders use Zod schemas:

- `userSeedSchema`
- `comicSeedSchema`
- `chapterSeedSchema`

Validation happens before insertion, ensuring data integrity.

## 📊 API Response Format

```typescript
// Success
{
  "success": true,
  "data": {
    "message": "Seeding completed successfully",
    "results": {
      "users": { "inserted": 50, "updated": 0, "skipped": 0, "errors": 0, "duration": 1234 },
      "comics": { "inserted": 100, "updated": 0, "skipped": 0, "errors": 0, "duration": 5678 },
      "chapters": { "inserted": 500, "updated": 0, "skipped": 0, "errors": 0, "duration": 9012 }
    }
  }
}

// Error
{
  "success": false,
  "error": "Error message here"
}
```

## 🛠️ Extending the System

### Add New Entity

1. Create seeder class:

```typescript
export class MyEntitySeeder extends BaseSeeder<MyEntitySeed> {
  constructor(options: SeedOptions = {}) {
    super("myEntity", myEntityTable, myEntitySchema, options);
  }

  protected getDataSources(): string[] {
    return ["./myentity.json"];
  }

  protected getUniqueField(): string {
    return "slug";
  }

  protected prepareData(item: MyEntitySeed) {
    return {
      /* transform logic */
    };
  }

  protected async insertBatch(batch, options) {
    // insertion logic
  }
}
```

2. Add to `seedHelpersEnhanced.ts`:

```typescript
export async function seedMyEntity(options = {}) {
  const seeder = new MyEntitySeeder(options);
  return seeder.seed([], options);
}
```

3. Update API route and CLI config

## 📈 Performance

- Batch size: 100 records (configurable)
- Transaction support: Yes
- Caching: Author/Artist/Genre/Type lookups
- Memory efficient: Streaming for large datasets

## 🐛 Troubleshooting

### No data found

- Check file paths in `getDataSources()`
- Verify JSON files exist
- Check file permissions

### Validation errors

- Check Zod schemas match your data
- Use `--verbose` for detailed error messages
- Use `--dry-run` to validate without inserting

### Duplicate key errors

- Use `--force` to overwrite existing records
- Check unique fields (email, slug, etc.)

## 📝 Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "seed": "tsx src/database/seed/runEnhanced.ts",
    "seed:users": "tsx src/database/seed/runEnhanced.ts --users",
    "seed:comics": "tsx src/database/seed/runEnhanced.ts --comics",
    "seed:chapters": "tsx src/database/seed/runEnhanced.ts --chapters",
    "seed:clear": "tsx src/database/seed/runEnhanced.ts --clear",
    "seed:reset": "tsx src/database/seed/runEnhanced.ts --reset",
    "seed:validate": "tsx src/database/seed/runEnhanced.ts --dry-run"
  }
}
```

## 🎉 Benefits

1. **Maintainable** - DRY principles, reusable base classes
2. **Type-Safe** - Full TypeScript + Zod validation
3. **Flexible** - CLI + API, multiple data sources
4. **Efficient** - Batch processing, caching, transactions
5. **Developer-Friendly** - Clear logs, error messages, progress tracking
6. **Production-Ready** - Tested, optimized, documented

---

**Created**: 2025-12-26  
**Version**: 2.0.0  
**Status**: ✅ Production Ready
