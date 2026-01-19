# DTO Usage Examples

## Basic Imports

### Single Module Import

```typescript
// Import from specific DTO module
import { createArtist, updateArtist, deleteArtist } from "@/lib/dto/artistsDto";
import {
  signInAction,
  signOutAction,
  registerUserAction,
} from "@/lib/dto/authDto";
```

### Centralized Import

```typescript
// Import from centralized index
import {
  createArtist,
  signInAction,
  createComic,
  addBookmark,
} from "@/lib/dto";
```

## Server Components

```typescript
import { getComics } from "@/lib/dto/comicsDto";

export default async function ComicsPage() {
  const comics = await getComics();

  return (
    <div>
      {comics.map(comic => (
        <ComicCard key={comic.id} comic={comic} />
      ))}
    </div>
  );
}
```

## Client Components with Server Actions

```typescript
"use client";

import { createComment } from "@/lib/dto/commentsDto";
import { useTransition } from "react";

export function CommentForm({ comicId }: { comicId: number }) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createComment(formData);
      if (result.success) {
        console.log("Comment created!");
      }
    });
  }

  return (
    <form action={handleSubmit}>
      <textarea name="content" />
      <input type="hidden" name="comicId" value={comicId} />
      <button disabled={isPending}>Submit</button>
    </form>
  );
}
```

## Form Actions

```typescript
import { updateUser } from "@/lib/dto/usersDto";

export function EditUserForm({ userId }: { userId: number }) {
  return (
    <form action={updateUser}>
      <input type="hidden" name="id" value={userId} />
      <input name="name" placeholder="Name" />
      <input name="email" type="email" placeholder="Email" />
      <button type="submit">Update</button>
    </form>
  );
}
```

## Multiple Actions in One Component

```typescript
import {
  createGenre,
  updateGenre,
  deleteGenre,
  getAllGenres
} from "@/lib/dto/genresDto";

export async function GenreManager() {
  const genres = await getAllGenres();

  async function handleCreate(formData: FormData) {
    "use server";
    await createGenre(formData);
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateGenre(formData);
  }

  async function handleDelete(id: number) {
    "use server";
    await deleteGenre(id);
  }

  return (
    <div>
      {/* UI implementation */}
    </div>
  );
}
```

## Error Handling

```typescript
import { createComic } from "@/lib/dto/comicsDto";
import { toast } from "sonner";

export function CreateComicForm() {
  async function handleSubmit(formData: FormData) {
    try {
      const result = await createComic(formData);

      if (result.success) {
        toast.success("Comic created successfully!");
      } else {
        toast.error(result.error || "Failed to create comic");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    }
  }

  return <form action={handleSubmit}>{/* Form fields */}</form>;
}
```

## With React Hook Form

```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { updateAuthor } from "@/lib/dto/authorsDto";
import { useForm } from "react-hook-form";
import { z } from "zod";

const authorSchema = z.object({
  name: z.string().min(1),
  bio: z.string().optional(),
});

export function EditAuthorForm({ authorId }: { authorId: number }) {
  const form = useForm({
    resolver: zodResolver(authorSchema),
  });

  async function onSubmit(data: z.infer<typeof authorSchema>) {
    const formData = new FormData();
    formData.append("id", authorId.toString());
    formData.append("name", data.name);
    if (data.bio) formData.append("bio", data.bio);

    const result = await updateAuthor(formData);
    if (result.success) {
      // Handle success
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form implementation */}
    </form>
  );
}
```

## API Routes (Still use original actions)

```typescript
// app/api/comics/route.ts
import { createComic } from "@/lib/actions/comics";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const result = await createComic(formData);

  return Response.json(result);
}
```

## Testing

```typescript
import { describe, it, expect } from "vitest";
import { createArtist } from "@/lib/dto/artistsDto";

describe("Artist Actions", () => {
  it("should create an artist", async () => {
    const formData = new FormData();
    formData.append("name", "Test Artist");

    const result = await createArtist(formData);
    expect(result.success).toBe(true);
  });
});
```

## Benefits

1. **Consistency**: All server actions follow the same import pattern
2. **Type Safety**: Full TypeScript support with autocomplete
3. **Tree Shaking**: Only imports what you use
4. **Easy Migration**: Can gradually update from actions to DTOs
5. **Centralized**: Single source of truth for all server actions
