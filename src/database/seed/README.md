# Database Seeding System

This directory contains the optimized database seeding system for ComicWise.

## Architecture

```
src/db/seed/
├── index.ts              # Entry point with CLI argument parsing
├── config.ts             # Configuration management
├── logger.ts             # Enhanced logging and progress tracking
├── orchestrator.ts       # Workflow coordination
├── seeders/              # Entity-specific processors
│   ├── user-seeder.ts    # User entity processing
│   ├── comic-seeder.ts   # Comic entity processing
│   └── chapter-seeder.ts # Chapter entity processing
└── utils/                # Shared utilities
    ├── metadata-cache.ts # Metadata caching for performance
    ├── file-utils.ts     # JSON file operations
    └── helpers.ts        # Utility functions
```

## Features

- **Upsert Logic**: Creates new entities or updates existing ones
- **Image Processing**: Downloads and processes images with configurable
  concurrency
- **Progress Tracking**: Detailed statistics for created/updated/skipped/errors
- **Validation**: Zod schema validation with error reporting
- **Deduplication**: Removes duplicate entries before processing
- **Metadata Caching**: Caches types, authors, artists, and genres to reduce DB
  queries
- **Dry Run Mode**: Test without making database changes
- **Selective Seeding**: Seed only specific entity types
- **Verbose Logging**: Optional detailed debug output
- **Batch Processing**: Configurable batch sizes for performance tuning

## Usage

### Basic Seeding

Seed all entities (users, comics, chapters):

```bash
pnpm db:seed
```

### Selective Seeding

Seed only specific entity types:

```bash
# Seed only users
pnpm db:seed:users

# Seed only comics
pnpm db:seed:comics

# Seed only chapters
pnpm db:seed:chapters
```

### Options

Control seeding behavior with flags:

```bash
# Dry run - validate data without making changes
pnpm db:seed:dry-run

# Verbose output - see detailed debug information
pnpm db:seed:verbose

# Skip image downloads - faster seeding for testing
pnpm db:seed:no-images

# Manual command with custom options
tsx --env-file=.env.local src/db/seed/index.ts --verbose --dry-run

# Custom batch size and image concurrency
tsx --env-file=.env.local src/db/seed/index.ts --batch-size 100 --image-concurrency 10
```

### Advanced Options

All available CLI flags:

- `--users-only` - Seed only users
- `--comics-only` - Seed only comics
- `--chapters-only` - Seed only chapters
- `--no-users` - Skip users (seed comics and chapters)
- `--no-comics` - Skip comics (seed users and chapters)
- `--no-chapters` - Skip chapters (seed users and comics)
- `--skip-images` - Skip image downloads
- `--verbose` or `-v` - Enable verbose logging
- `--dry-run` - Validate without making changes
- `--batch-size <n>` - Set batch processing size (default: 50)
- `--image-concurrency <n>` - Set image download concurrency (default: 5)

## Data Files

The seeder looks for JSON files in the workspace root:

- **Users**: `users.json`, `usersdata*.json`
- **Comics**: `comics.json`, `comicsdata*.json`
- **Chapters**: `chapters.json`, `chaptersdata*.json`

## Data Format

### Users

```json
{
  "email": "john@example.com",
  "emailVerified": "2024-01-01T00:00:00Z",
  "id": "user_123",
  "image": "https://example.com/avatar.jpg",
  "name": "John Doe",
  "password": "plaintext_password",
  "role": "user"
}
```

### Comics

```json
{
  "artist": "Artist Name",
  "author": "Author Name",
  "description": "Comic description",
  "genres": ["Action", "Adventure"],
  "image_urls": ["https://example.com/cover.jpg"],
  "images": [
    { "url": "https://example.com/image1.jpg" },
    { "url": "https://example.com/image2.jpg" }
  ],
  "publicationDate": "August 14th 2025",
  "rating": "4.5",
  "slug": "comic-title",
  "status": "Ongoing",
  "title": "Comic Title",
  "type": "Manga",
  "updated_at": "2025-01-01"
}
```

### Chapters

```json
{
  "chaptername": "Chapter 1",
  "comictitle": "Comic Title",
  "images": [
    { "url": "https://example.com/page1.jpg" },
    { "url": "https://example.com/page2.jpg" }
  ],
  "releaseDate": "2025-01-01",
  "title": "Chapter 1: The Beginning",
  "updated_at": "2025-01-01"
}
```

## Process Flow

1. **Parse CLI Arguments**: Determine what to seed and with what options
2. **Test Database Connection**: Verify database is accessible
3. **Seed Users** (if enabled):
   - Load and validate user JSON files
   - Deduplicate by email
   - Hash passwords
   - Download avatar images
   - Upsert users to database
4. **Seed Comics** (if enabled):
   - Load and validate comic JSON files
   - Preprocess dates
   - Deduplicate by title
   - Get or create metadata (types, authors, artists, genres)
   - Download cover and additional images
   - Upsert comics to database
5. **Seed Chapters** (if enabled):
   - Load and validate chapter JSON files
   - Look up comic IDs
   - Extract chapter numbers
   - Download page images
   - Upsert chapters to database
6. **Show Statistics**: Display metadata cache stats and completion summary

## Progress Output

```
===========================================
        Database Seeding Started
===========================================

✓ Database connection established

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Processing Users
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Loaded 10 users from files
Unique users after deduplication: 10
Processing 10 users...

Progress: 10/10 (100.0%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary:
  • Created:  8
  • Updated:  2
  • Skipped:  0
  • Errors:   0
  • Duration: 2.5s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Metadata Cache Statistics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Types cached:    5
Authors cached:  12
Artists cached:  8
Genres cached:   15

===========================================
        Seeding Complete
===========================================

✓ Seeding completed successfully
Total time: 45.3s
```

## Error Handling

- **Validation Errors**: Shows count and first 5 errors (verbose for all)
- **Comic Not Found**: Chapters skip if their comic doesn't exist
- **Image Download Failures**: Logs error but continues processing
- **Database Errors**: Full error message and stack trace (in DEBUG mode)

## Performance

- **Batch Processing**: Process entities in configurable batches (default: 50)
- **Image Concurrency**: Download multiple images in parallel (default: 5)
- **Metadata Caching**: Avoid repeated database queries for types, authors,
  artists, genres
- **Connection Pooling**: Reuses database connections via Drizzle
- **Deduplication**: Removes duplicates before processing

## Migration from Old System

The original seed scripts in `src/scripts/` are still available:

```bash
pnpm db:seed:legacy
```

The new system provides:

- Better organization and maintainability
- Enhanced CLI with more control
- Progress tracking with statistics
- Dry-run mode for safe testing
- Verbose logging for debugging
- Configurable performance parameters

All functionality from the original system is preserved.

## Troubleshooting

### "Comic not found" for chapters

The chapter's `comictitle` field must exactly match a comic's `title` field.
Check your JSON data for:

- Typos or spelling differences
- Extra spaces or special characters
- Case sensitivity issues

### Images not downloading

1. Check image URLs are accessible
2. Verify `public/static/uploads/` directory exists
3. Ensure sufficient disk space
4. Check network connectivity
5. Review logs with `--verbose` flag

### Validation errors

Use `--verbose` flag to see detailed validation error messages. Common issues:

- Missing required fields
- Invalid date formats (use "YYYY-MM-DD" or "Month DD YYYY")
- Invalid enum values (status, role)

### Performance issues

Adjust batch size and image concurrency:

```bash
tsx --env-file=.env.local src/db/seed/index.ts --batch-size 100 --image-concurrency 10
```

Or skip images for faster testing:

```bash
pnpm db:seed:no-images
```

## Development

To extend the seeding system:

1. **Add new entity type**: Create a new seeder in `seeders/`
2. **Add new utilities**: Add to `utils/` directory
3. **Add new CLI flags**: Update `config.ts` and `parseCLIArgs`
4. **Enhance logging**: Extend `SeedLogger` or `ProgressTracker`
5. **Update orchestrator**: Add new workflow step in `orchestrator.ts`

## Testing

Test without making changes:

```bash
pnpm db:seed:dry-run
```

Test with verbose output:

```bash
pnpm db:seed:verbose
```

Test without images:

```bash
pnpm db:seed:no-images
```

Combine options:

```bash
tsx --env-file=.env.local src/db/seed/index.ts --dry-run --verbose --skip-images
```
