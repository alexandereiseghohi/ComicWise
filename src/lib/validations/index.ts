// ═══════════════════════════════════════════════════
// COMPREHENSIVE ZOD VALIDATION SCHEMAS (Next.js 16)
// ═══════════════════════════════════════════════════
// Canonical centralized validation schemas
import { z } from "zod";

// ═══════════════════════════════════════════════════
// AUTHENTICATION SCHEMAS
// ═══════════════════════════════════════════════════

export const signInSchema = z
  .object({
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email address")
      .trim()
      .toLowerCase(),
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters"),
  })
  .strict();

export const signUpSchema = z
  .object({
    name: z
      .string({ error: "Name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters")
      .trim(),
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email address")
      .trim()
      .toLowerCase(),
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string({ error: "Confirm password is required" }),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z
  .object({
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email address")
      .trim()
      .toLowerCase(),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string({ error: "Token is required" }),
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string({ error: "Confirm password is required" }),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verifyEmailSchema = z
  .object({
    token: z.string({ error: "Token is required" }),
  })
  .strict();

export const resendVerificationEmailSchema = z
  .object({
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email address")
      .trim()
      .toLowerCase(),
  })
  .strict();

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters")
      .trim()
      .optional(),
    image: z.string().url("Invalid image URL").optional(),
  })
  .strict();

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ═══════════════════════════════════════════════════
// USER SCHEMAS
// ═══════════════════════════════════════════════════

export const createUserSchema = z
  .object({
    name: z
      .string({ error: "Name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters")
      .trim(),
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email address")
      .trim()
      .toLowerCase(),
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters"),
    role: z.enum(["user", "admin", "moderator"]).default("user"),
    image: z.string().url().optional(),
  })
  .strict();

export const updateUserSchema = z
  .object({
    name: z.string().min(2).max(50).trim().optional(),
    email: z.string().email().trim().toLowerCase().optional(),
    role: z.enum(["user", "admin", "moderator"]).optional(),
    image: z.string().url().optional(),
    emailVerified: z.date().optional(),
  })
  .strict();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export const userIdSchema = z
  .object({
    id: z.string().uuid("Invalid user ID"),
  })
  .strict();

// ═══════════════════════════════════════════════════
// COMIC SCHEMAS
// ═══════════════════════════════════════════════════

export const createComicSchema = z
  .object({
    title: z
      .string({ error: "Title is required" })
      .min(1, "Title is required")
      .max(255, "Title must not exceed 255 characters")
      .trim(),
    description: z
      .string({ error: "Description is required" })
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description must not exceed 5000 characters")
      .trim(),
    coverImage: z.string({ error: "Cover image is required" }).url("Invalid cover image URL"),
    status: z.enum(["Ongoing", "Hiatus", "Completed", "Dropped", "Coming Soon"]).default("Ongoing"),
    publicationDate: z.coerce.date(),
    rating: z.coerce
      .number()
      .min(0, "Rating must be at least 0")
      .max(10, "Rating must not exceed 10")
      .optional(),
    views: z.coerce.number().int().min(0).default(0),
    authorId: z.coerce.number().int().positive().optional(),
    artistId: z.coerce.number().int().positive().optional(),
    typeId: z.coerce.number().int().positive().optional(),
  })
  .strict();

export const updateComicSchema = createComicSchema.partial();

export const comicIdSchema = z
  .object({
    id: z.coerce.number().int().positive("Invalid comic ID"),
  })
  .strict();

export const comicSlugSchema = z
  .object({
    slug: z.string().min(1, "Slug is required"),
  })
  .strict();

export const comicFormSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(512, "Title must not exceed 512 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description must not exceed 5000 characters"),
    slug: z
      .string()
      .min(1, "Slug is required")
      .max(512, "Slug must not exceed 512 characters")
      .regex(/^[\da-z]+(?:-[\da-z]+)*$/, "Slug must be lowercase with hyphens only")
      .optional(),
    coverImage: z.string().url("Cover image must be a valid URL"),
    status: z.enum(["Ongoing", "Hiatus", "Completed", "Dropped", "Coming Soon"]),
    publicationDate: z.instanceof(Date).or(z.string().pipe(z.coerce.date())),
    authorId: z.string().optional(),
    artistId: z.string().optional(),
    typeId: z.string().optional(),
    genreIds: z.array(z.string()).optional().default([]),
  })
  .strict();

// ═══════════════════════════════════════════════════
// CHAPTER SCHEMAS
// ═══════════════════════════════════════════════════

export const createChapterSchema = z
  .object({
    title: z
      .string({ error: "Title is required" })
      .min(1, "Title is required")
      .max(255, "Title must not exceed 255 characters")
      .trim(),
    chapterNumber: z.coerce
      .number({ error: "Chapter number is required" })
      .int("Chapter number must be an integer")
      .positive("Chapter number must be positive"),
    releaseDate: z.coerce.date(),
    comicId: z.coerce.number({ error: "Comic ID is required" }).int().positive(),
    views: z.coerce.number().int().min(0).default(0),
  })
  .strict();

export const updateChapterSchema = createChapterSchema.partial().extend({
  comicId: z.coerce.number().int().positive().optional(),
});

export const chapterIdSchema = z
  .object({
    id: z.coerce.number().int().positive("Invalid chapter ID"),
  })
  .strict();

// ═══════════════════════════════════════════════════
// AUTHOR/ARTIST SCHEMAS
// ═══════════════════════════════════════════════════

export const createAuthorSchema = z
  .object({
    name: z
      .string({ error: "Name is required" })
      .min(1, "Name is required")
      .max(100, "Name must not exceed 100 characters")
      .trim(),
    bio: z.string().max(2000, "Bio must not exceed 2000 characters").trim().optional(),
    image: z.string().url("Invalid image URL").optional(),
  })
  .strict();

export const updateAuthorSchema = createAuthorSchema.partial();

export const authorIdSchema = z
  .object({
    id: z.coerce.number().int().positive("Invalid author ID"),
  })
  .strict();

export const createArtistSchema = createAuthorSchema;
export const updateArtistSchema = updateAuthorSchema;
export const artistIdSchema = authorIdSchema;

// ═══════════════════════════════════════════════════
// GENRE SCHEMAS
// ═══════════════════════════════════════════════════

export const createGenreSchema = z
  .object({
    name: z
      .string({ error: "Name is required" })
      .min(1, "Name is required")
      .max(50, "Name must not exceed 50 characters")
      .trim(),
    description: z
      .string()
      .max(500, "Description must not exceed 500 characters")
      .trim()
      .optional(),
  })
  .strict();

export const updateGenreSchema = createGenreSchema.partial();

export const genreIdSchema = z
  .object({
    id: z.coerce.number().int().positive("Invalid genre ID"),
  })
  .strict();

// ═══════════════════════════════════════════════════
// TYPE SCHEMAS
// ═══════════════════════════════════════════════════

export const createTypeSchema = z
  .object({
    name: z
      .string({ error: "Name is required" })
      .min(1, "Name is required")
      .max(50, "Name must not exceed 50 characters")
      .trim(),
    description: z
      .string()
      .max(500, "Description must not exceed 500 characters")
      .trim()
      .optional(),
  })
  .strict();

export const updateTypeSchema = createTypeSchema.partial();

export const typeIdSchema = z
  .object({
    id: z.coerce.number().int().positive("Invalid type ID"),
  })
  .strict();

// ═══════════════════════════════════════════════════
// BOOKMARK SCHEMAS
// ═══════════════════════════════════════════════════

export const createBookmarkSchema = z
  .object({
    userId: z.string({ error: "User ID is required" }).uuid(),
    comicId: z.coerce.number({ error: "Comic ID is required" }).int().positive(),
    lastReadChapterId: z.coerce.number().int().positive().optional(),
    notes: z.string().max(1000, "Notes must not exceed 1000 characters").optional(),
  })
  .strict();

export const updateBookmarkSchema = z
  .object({
    lastReadChapterId: z.coerce.number().int().positive().optional(),
    notes: z.string().max(1000).optional(),
  })
  .strict();

export const bookmarkIdSchema = z
  .object({
    userId: z.string().uuid(),
    comicId: z.coerce.number().int().positive(),
  })
  .strict();

// ═══════════════════════════════════════════════════
// COMMENT SCHEMAS
// ═══════════════════════════════════════════════════

export const createCommentSchema = z
  .object({
    content: z
      .string({ error: "Content is required" })
      .min(1, "Content is required")
      .max(2000, "Content must not exceed 2000 characters")
      .trim(),
    userId: z.string({ error: "User ID is required" }).uuid(),
    chapterId: z.coerce.number({ error: "Chapter ID is required" }).int().positive(),
  })
  .strict();

export const updateCommentSchema = z
  .object({
    content: z
      .string({ error: "Content is required" })
      .min(1, "Content is required")
      .max(2000, "Content must not exceed 2000 characters")
      .trim(),
  })
  .strict();

export const commentIdSchema = z
  .object({
    id: z.coerce.number().int().positive("Invalid comment ID"),
  })
  .strict();

// ═══════════════════════════════════════════════════
// IMAGE SCHEMAS
// ═══════════════════════════════════════════════════

export const createChapterImageSchema = z
  .object({
    chapterId: z.coerce.number({ error: "Chapter ID is required" }).int().positive(),
    imageUrl: z.string({ error: "Image URL is required" }).url("Invalid image URL"),
    pageNumber: z.coerce.number({ error: "Page number is required" }).int().positive(),
  })
  .strict();

export const updateChapterImageSchema = createChapterImageSchema.partial().extend({
  chapterId: z.coerce.number().int().positive().optional(),
});

export const chapterImageIdSchema = z
  .object({
    id: z.coerce.number().int().positive("Invalid chapter image ID"),
  })
  .strict();

export const createComicImageSchema = z
  .object({
    comicId: z.coerce.number({ error: "Comic ID is required" }).int().positive(),
    imageUrl: z.string({ error: "Image URL is required" }).url("Invalid image URL"),
    imageOrder: z.coerce.number({ error: "Image order is required" }).int().min(0),
  })
  .strict();

export const updateComicImageSchema = createComicImageSchema.partial().extend({
  comicId: z.coerce.number().int().positive().optional(),
});

export const comicImageIdSchema = z
  .object({
    id: z.coerce.number().int().positive("Invalid comic image ID"),
  })
  .strict();

// ═══════════════════════════════════════════════════
// COMIC TO GENRE SCHEMAS
// ═══════════════════════════════════════════════════

export const createComicToGenreSchema = z
  .object({
    comicId: z.coerce.number().int().positive(),
    genreId: z.coerce.number().int().positive(),
  })
  .strict();

export const comicToGenreIdSchema = createComicToGenreSchema;

// ═══════════════════════════════════════════════════
// PAGINATION & FILTERING SCHEMAS
// ═══════════════════════════════════════════════════

export const paginationSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(12),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

export const comicFilterSchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(["Ongoing", "Hiatus", "Completed", "Dropped", "Coming Soon"]).optional(),
  genreId: z.coerce.number().int().positive().optional(),
  typeId: z.coerce.number().int().positive().optional(),
  authorId: z.coerce.number().int().positive().optional(),
  artistId: z.coerce.number().int().positive().optional(),
  minRating: z.coerce.number().min(0).max(10).optional(),
});

export const chapterFilterSchema = paginationSchema.extend({
  comicId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});

export const userFilterSchema = paginationSchema.extend({
  search: z.string().optional(),
  role: z.enum(["user", "admin", "moderator"]).optional(),
  emailVerified: z.boolean().optional(),
});

export const commentFilterSchema = paginationSchema.extend({
  chapterId: z.coerce.number().int().positive().optional(),
  comicId: z.coerce.number().int().positive().optional(),
  userId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export const bookmarkFilterSchema = paginationSchema.extend({
  userId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export const authorFilterSchema = paginationSchema.extend({
  search: z.string().optional(),
});

export const artistFilterSchema = paginationSchema.extend({
  search: z.string().optional(),
});

export const genreFilterSchema = paginationSchema.extend({
  search: z.string().optional(),
});

export const typeFilterSchema = paginationSchema.extend({
  search: z.string().optional(),
});

// ═══════════════════════════════════════════════════
// BATCH OPERATION SCHEMAS
// ═══════════════════════════════════════════════════

export const batchDeleteSchema = z
  .object({
    ids: z.array(z.number().int().positive()).min(1, "At least one ID is required"),
  })
  .strict();

export const batchUpdateComicImagesSchema = z
  .object({
    images: z.array(
      z
        .object({
          id: z.number().int().positive(),
          imageOrder: z.number().int().min(0),
        })
        .strict()
    ),
  })
  .strict();

export const batchUpdateChapterImagesSchema = z
  .object({
    images: z.array(
      z
        .object({
          id: z.number().int().positive(),
          pageNumber: z.number().int().positive(),
        })
        .strict()
    ),
  })
  .strict();

export const batchCreateChapterImagesSchema = z
  .object({
    chapterId: z.coerce.number().int().positive(),
    images: z
      .array(
        z
          .object({
            imageUrl: z.string().url(),
            pageNumber: z.number().int().positive(),
          })
          .strict()
      )
      .min(1),
  })
  .strict();

export const batchCreateComicImagesSchema = z
  .object({
    comicId: z.coerce.number().int().positive(),
    images: z
      .array(
        z
          .object({
            imageUrl: z.string().url(),
            imageOrder: z.number().int().min(0),
          })
          .strict()
      )
      .min(1),
  })
  .strict();

export const bulkAssignGenresSchema = z
  .object({
    comicId: z.coerce.number().int().positive(),
    genreIds: z.array(z.number().int().positive()).min(1),
  })
  .strict();

// ═══════════════════════════════════════════════════
// EMAIL SCHEMAS
// ═══════════════════════════════════════════════════

export const sendEmailSchema = z
  .object({
    to: z.string().email("Invalid email address"),
    subject: z.string().min(1, "Subject is required"),
    html: z.string().min(1, "Email content is required"),
    from: z.string().email().optional(),
  })
  .strict();

export const emailSchema = z
  .object({
    to: z.string().email("Invalid email address"),
    subject: z.string().min(1, "Subject is required"),
    body: z.string().min(1, "Body is required"),
  })
  .strict();

export const verificationEmailSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(1, "Name is required"),
    token: z.string().min(1, "Token is required"),
  })
  .strict();

export const resetPasswordEmailSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(1, "Name is required"),
    token: z.string().min(1, "Token is required"),
  })
  .strict();

// ═══════════════════════════════════════════════════
// WORKFLOW SCHEMAS
// ═══════════════════════════════════════════════════

export const workflowSchema = z
  .object({
    action: z.enum(["register", "forgot-password", "verify-email", "reset-password"]),
    data: z.record(z.string(), z.any()),
  })
  .strict();

// ═══════════════════════════════════════════════════
// SEED DATA VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════

export const userSeedSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().min(1),
    email: z.string().email(),
    emailVerified: z.coerce.date().nullable().optional(),
    image: z.string().nullable().optional(),
    password: z.string().optional(),
    role: z.enum(["user", "admin", "moderator"]).default("user"),
    status: z.boolean().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    lastActivityDate: z.coerce.date().nullable().optional(),
  })
  .strict();

export const userArraySchema = z.array(userSeedSchema);

export const seedUserSchema = userSeedSchema.extend({
  id: z.string().uuid().optional(),
  emailVerified: z.coerce.date().nullable().optional(),
  password: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

// ═══════════════════════════════════════════════════
// IMAGE HELPER SCHEMA
// ═══════════════════════════════════════════════════

export const imageSchema = z
  .object({
    url: z.string().url(),
    path: z.string().optional(),
    checksum: z.string().optional(),
    status: z.string().optional(),
  })
  .strict();

// ═══════════════════════════════════════════════════
// METADATA SEED SCHEMAS
// ═══════════════════════════════════════════════════

export const typeSeedSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().nullable().optional(),
  })
  .strict();

export const authorSeedSchema = z
  .object({
    name: z.string().min(1),
    bio: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
  })
  .strict();

export const artistSeedSchema = z
  .object({
    name: z.string().min(1),
    bio: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
  })
  .strict();

export const genreSeedSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().nullable().optional(),
  })
  .strict();

// ═══════════════════════════════════════════════════
// COMIC SEED SCHEMAS
// ═══════════════════════════════════════════════════

export const comicSeedSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().optional(),
    description: z.string().default(""),
    serialization: z.string().optional(),
    author: z
      .union([
        z.string(),
        z
          .object({
            name: z.string(),
          })
          .strict(),
      ])
      .optional(),
    artist: z
      .union([
        z.string(),
        z
          .object({
            name: z.string(),
          })
          .strict(),
      ])
      .optional(),
    rating: z.coerce.number().min(0).max(10).optional(),
    status: z
      .string()
      .default("Ongoing")
      .transform((value) => {
        const statusMap: Record<string, string> = {
          ongoing: "Ongoing",
          hiatus: "Hiatus",
          completed: "Completed",
          dropped: "Dropped",
          "coming soon": "Coming Soon",
          coming_soon: "Coming Soon",
          "season end": "Season End",
          season_end: "Season End",
        };
        const normalized = value.toLowerCase();
        return statusMap[normalized] ?? "Ongoing";
      }),
    category: z.string().optional(),
    type: z
      .union([
        z.string(),
        z
          .object({
            name: z.string(),
          })
          .strict(),
      ])
      .optional(),
    genres: z
      .array(
        z.union([
          z.string(),
          z
            .object({
              name: z.string(),
            })
            .strict(),
        ])
      )
      .default([]),
    updated_at: z
      .union([z.string(), z.date()])
      .transform((value) => {
        if (!value) return undefined;
        const date = typeof value === "string" ? new Date(value) : value;
        return isNaN(date.getTime()) ? undefined : date;
      })
      .optional(),
    updatedAt: z
      .union([z.string(), z.date()])
      .transform((value) => {
        if (!value) return undefined;
        const date = typeof value === "string" ? new Date(value) : value;
        return isNaN(date.getTime()) ? undefined : date;
      })
      .optional(),
    url: z.string().url().optional(),
    image_urls: z.array(z.string().url()).optional(),
    images: z
      .array(
        z.union([
          imageSchema,
          z
            .object({
              url: z.string().url(),
            })
            .strict(),
        ])
      )
      .optional(),
    numchapters: z.number().optional(),
    publicationDate: z
      .union([z.string(), z.date()])
      .transform((value) => {
        if (!value) return undefined;
        const date = typeof value === "string" ? new Date(value) : value;
        return isNaN(date.getTime()) ? undefined : date;
      })
      .optional(),
    coverImage: z.string().optional(),
    spider: z.string().optional(),
  })
  .passthrough();

export const comicArraySchema = z.array(comicSeedSchema);

// ═══════════════════════════════════════════════════
// CHAPTER SEED SCHEMAS
// ═══════════════════════════════════════════════════

export const chapterSeedSchema = z
  .object({
    url: z.string().url().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
    chaptertitle: z.string().optional(),
    chaptername: z.string().optional(),
    chapterslug: z.string().optional(),
    updated_at: z
      .union([z.string(), z.date()])
      .transform((value) => {
        if (!value) return undefined;
        const date = typeof value === "string" ? new Date(value) : value;
        return isNaN(date.getTime()) ? undefined : date;
      })
      .optional(),
    updatedAt: z
      .union([z.string(), z.date()])
      .transform((value) => {
        if (!value) return undefined;
        const date = typeof value === "string" ? new Date(value) : value;
        return isNaN(date.getTime()) ? undefined : date;
      })
      .optional(),
    spider: z.string().optional(),
    releaseDate: z
      .union([z.string(), z.date()])
      .transform((value) => {
        if (!value) return undefined;
        const date = typeof value === "string" ? new Date(value) : value;
        return isNaN(date.getTime()) ? undefined : date;
      })
      .optional(),
    comic: z
      .union([
        z
          .object({
            title: z.string(),
            slug: z.string().optional(),
          })
          .strict(),
        z
          .object({
            comictitle: z.string(),
            comicslug: z.string().optional(),
          })
          .strict(),
      ])
      .optional(),
    comictitle: z.string().optional(),
    comicslug: z.string().optional(),
    image_urls: z.array(z.string().url()).optional(),
    images: z
      .array(
        z.union([
          imageSchema,
          z
            .object({
              url: z.string().url(),
            })
            .strict(),
        ])
      )
      .optional(),
  })
  .passthrough();

export const chapterArraySchema = z.array(chapterSeedSchema);

// ═══════════════════════════════════════════════════
// COMPLEX SEED DATA SCHEMAS
// ═══════════════════════════════════════════════════

export const seedComicSchema = z
  .object({
    url: z.string().url().optional(),
    title: z.string().min(1),
    slug: z.string().min(1).optional(),
    images: z.array(z.object({ url: z.string().url() }).strict()).optional(),
    description: z.string().min(1),
    rating: z.string().optional(),
    status: z.string().optional(),
    publicationDate: z.string().or(z.coerce.date()).optional(),
    updatedAt: z.string().optional(),
    serialization: z.string().optional(),
    coverImage: z.string().optional(),
    type: z.object({ name: z.string() }).strict().optional(),
    artist: z.object({ name: z.string() }).strict().optional(),
    author: z.object({ name: z.string() }).strict().optional(),
    genres: z.array(z.object({ name: z.string() }).strict()).optional(),
  })
  .strict();

export const seedChapterSchema = z
  .object({
    url: z.string().url().optional(),
    name: z.string(),
    title: z.string().optional(),
    chapterNumber: z.number().optional(),
    comic: z
      .object({
        title: z.string(),
        slug: z.string().optional(),
      })
      .strict(),
    releaseDate: z.string().or(z.coerce.date()).optional(),
    updatedAt: z.string().optional(),
    images: z.array(z.object({ url: z.string().url() }).strict()).optional(),
  })
  .strict();

export const seedDataSchema = z
  .object({
    users: z.array(seedUserSchema).optional(),
    comics: z.array(seedComicSchema).optional(),
    chapters: z.array(seedChapterSchema).optional(),
    data: z.record(z.string(), z.any()).optional(),
  })
  .strict();

// ═══════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationEmailInput = z.infer<typeof resendVerificationEmailSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type CreateComicInput = z.infer<typeof createComicSchema>;
export type UpdateComicInput = z.infer<typeof updateComicSchema>;
export type ComicIdInput = z.infer<typeof comicIdSchema>;
export type ComicSlugInput = z.infer<typeof comicSlugSchema>;
export type ComicFormData = z.infer<typeof comicFormSchema>;

export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
export type ChapterIdInput = z.infer<typeof chapterIdSchema>;

export type CreateAuthorInput = z.infer<typeof createAuthorSchema>;
export type UpdateAuthorInput = z.infer<typeof updateAuthorSchema>;
export type AuthorIdInput = z.infer<typeof authorIdSchema>;

export type CreateArtistInput = z.infer<typeof createArtistSchema>;
export type UpdateArtistInput = z.infer<typeof updateArtistSchema>;
export type ArtistIdInput = z.infer<typeof artistIdSchema>;

export type CreateGenreInput = z.infer<typeof createGenreSchema>;
export type UpdateGenreInput = z.infer<typeof updateGenreSchema>;
export type GenreIdInput = z.infer<typeof genreIdSchema>;

export type CreateTypeInput = z.infer<typeof createTypeSchema>;
export type UpdateTypeInput = z.infer<typeof updateTypeSchema>;
export type TypeIdInput = z.infer<typeof typeIdSchema>;

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
export type UpdateBookmarkInput = z.infer<typeof updateBookmarkSchema>;
export type BookmarkIdInput = z.infer<typeof bookmarkIdSchema>;

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CommentIdInput = z.infer<typeof commentIdSchema>;

export type CreateChapterImageInput = z.infer<typeof createChapterImageSchema>;
export type UpdateChapterImageInput = z.infer<typeof updateChapterImageSchema>;
export type ChapterImageIdInput = z.infer<typeof chapterImageIdSchema>;

export type CreateComicImageInput = z.infer<typeof createComicImageSchema>;
export type UpdateComicImageInput = z.infer<typeof updateComicImageSchema>;
export type ComicImageIdInput = z.infer<typeof comicImageIdSchema>;

export type CreateComicToGenreInput = z.infer<typeof createComicToGenreSchema>;
export type ComicToGenreIdInput = z.infer<typeof comicToGenreIdSchema>;

export type PaginationInput = z.infer<typeof paginationSchema>;
export type ComicFilterInput = z.infer<typeof comicFilterSchema>;
export type ChapterFilterInput = z.infer<typeof chapterFilterSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;
export type CommentFilterInput = z.infer<typeof commentFilterSchema>;
export type BookmarkFilterInput = z.infer<typeof bookmarkFilterSchema>;
export type AuthorFilterInput = z.infer<typeof authorFilterSchema>;
export type ArtistFilterInput = z.infer<typeof artistFilterSchema>;
export type GenreFilterInput = z.infer<typeof genreFilterSchema>;
export type TypeFilterInput = z.infer<typeof typeFilterSchema>;

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type EmailInput = z.infer<typeof emailSchema>;
export type VerificationEmailInput = z.infer<typeof verificationEmailSchema>;
export type ResetPasswordEmailInput = z.infer<typeof resetPasswordEmailSchema>;
export type WorkflowInput = z.infer<typeof workflowSchema>;

export type BatchDeleteInput = z.infer<typeof batchDeleteSchema>;
export type BatchUpdateComicImagesInput = z.infer<typeof batchUpdateComicImagesSchema>;
export type BatchUpdateChapterImagesInput = z.infer<typeof batchUpdateChapterImagesSchema>;
export type BatchCreateChapterImagesInput = z.infer<typeof batchCreateChapterImagesSchema>;
export type BatchCreateComicImagesInput = z.infer<typeof batchCreateComicImagesSchema>;
export type BulkAssignGenresInput = z.infer<typeof bulkAssignGenresSchema>;

export type UserSeed = z.infer<typeof userSeedSchema>;
export type ComicSeed = z.infer<typeof comicSeedSchema>;
export type ChapterSeed = z.infer<typeof chapterSeedSchema>;
export type TypeSeed = z.infer<typeof typeSeedSchema>;
export type AuthorSeed = z.infer<typeof authorSeedSchema>;
export type ArtistSeed = z.infer<typeof artistSeedSchema>;
export type GenreSeed = z.infer<typeof genreSeedSchema>;

export type SeedUserInput = z.infer<typeof seedUserSchema>;
export type SeedComicInput = z.infer<typeof seedComicSchema>;
export type SeedChapterInput = z.infer<typeof seedChapterSchema>;
export type SeedDataInput = z.infer<typeof seedDataSchema>;
