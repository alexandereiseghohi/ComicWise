# DTO Migration Guide

## Overview

The project now uses Data Transfer Objects (DTOs) to centralize server action
exports.

## Structure

```
src/lib/
├── actions/           # Original server actions (kept)
│   ├── artists.ts
│   ├── auth.ts
│   ├── ...
│   └── utils.ts
└── dto/               # DTO layer (re-exports)
    ├── artistsDto.ts  # Re-exports from ../actions/artists
    ├── authDto.ts     # Re-exports from ../actions/auth
    ├── ...
    └── index.ts       # Centralized exports
```

## Usage

### Import from DTOs (Recommended)

```typescript
// Single import
import { createArtist, updateArtist } from "@/lib/dto/artistsDto";

// Multiple imports from index
import { createArtist, signInAction, createComic } from "@/lib/dto";
```

### Import from Actions (Still works)

```typescript
import { createArtist } from "@/lib/actions/artists";
```

## Benefits

1. **Single Source**: All server actions accessible from one location
2. **"use server"**: Ensured at DTO level for all re-exports
3. **Type Safety**: Full TypeScript support maintained
4. **Clean Imports**: Shorter, cleaner import statements
5. **Future-Proof**: Easy to add middleware, logging, or transformations

## Migration Checklist

- [x] Create DTO files in `src/lib/dto/`
- [x] Update DTO files to re-export from actions
- [x] Create centralized `index.ts`
- [ ] Update imports in components (optional)
- [ ] Update imports in pages (optional)
- [ ] Update tests (optional)

## Notes

- Action files in `src/lib/actions/` are kept for organization
- DTOs are thin re-export layers
- Both patterns work - DTOs are recommended for consistency
