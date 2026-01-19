import type { SQL } from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ═══════════════════════════════════════════════════
// CUSTOM SQL TYPES FOR FULL-TEXT SEARCH
// ═══════════════════════════════════════════════════

// tsvector type for PostgreSQL full-text search
export const tsvector: (name: string) => SQL<string> = (name: string) => {
  return sql<string>`${sql.raw(name)} tsvector`;
};

// ═══════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════

export const userRole = pgEnum("user_role", ["user", "admin", "moderator"]);
export const comicStatus = pgEnum("comic_status", [
  "Ongoing",
  "Hiatus",
  "Completed",
  "Dropped",
  "Season End",
  "Coming Soon",
]);

// ═══════════════════════════════════════════════════
// AUTHENTICATION TABLES
// ═══════════════════════════════════════════════════

export const user = pgTable(
  "user",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique().notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    password: text("password"),
    role: userRole("role").default("user").notNull(),
    status: boolean("status").notNull().default(false),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("userEmailIdx").on(table.email), index("userRoleIdx").on(table.role)]
);

export const account = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
  })
);

export const session = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey().notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationToken = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.identifier, table.token] }),
  })
);

export const authenticator = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.credentialID] }),
  })
);

export const passwordResetToken = pgTable("passwordResetToken", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ═══════════════════════════════════════════════════
// COMIC CONTENT TABLES (ORDERED FOR REFERENCES)
// ═══════════════════════════════════════════════════

export const type = pgTable("type", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const author = pgTable("author", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio"),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  searchVector: text("searchVector"),
});

export const artist = pgTable("artist", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio"),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  searchVector: text("searchVector"),
});

export const genre = pgTable("genre", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const comic = pgTable(
  "comic",
  {
    id: serial("id").primaryKey(),
    title: text("title").unique().notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description").notNull(),
    coverImage: text("coverImage").notNull(),
    status: comicStatus("status").default("Ongoing").notNull(),
    publicationDate: timestamp("publicationDate", { mode: "date" }).notNull(),
    rating: decimal("rating", { precision: 10, scale: 1 }).default("0"),
    views: integer("views").default(0).notNull(),
    url: text("url"), // External source URL
    serialization: text("serialization"), // Serialization info
    authorId: integer("authorId").references(() => author.id),
    artistId: integer("artistId").references(() => artist.id),
    typeId: integer("typeId").references(() => type.id),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
    searchVector: text("searchVector"),
  },
  (table) => [
    index("comicSlugIdx").on(table.slug),
    index("comicTitleIdx").on(table.title),
    index("comicStatusIdx").on(table.status),
    index("comicRatingIdx").on(table.rating),
    index("comicViewsIdx").on(table.views),
    index("comicAuthorIdx").on(table.authorId),
    index("comicArtistIdx").on(table.artistId),
    index("comicTypeIdx").on(table.typeId),
    index("comicCreatedAtIdx").on(table.createdAt),
  ]
);

export const chapter = pgTable(
  "chapter",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    chapterNumber: integer("chapterNumber").notNull(),
    releaseDate: timestamp("releaseDate", { mode: "date" }).notNull(),
    comicId: integer("comicId")
      .references(() => comic.id, { onDelete: "cascade" })
      .notNull(),
    views: integer("views").default(0).notNull(),
    url: text("url"), // External source URL
    content: text("content"), // Chapter content/description
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("chapterSlugIdx").on(table.slug),
    index("chapterComicIdIdx").on(table.comicId),
    index("chapterNumberIdx").on(table.chapterNumber),
    index("chapterReleaseDateIdx").on(table.releaseDate),
    index("chapterComicChapterIdx").on(table.comicId, table.chapterNumber),
    // Unique constraint for upsert operations
    unique("chapter_comic_number_unique").on(table.comicId, table.chapterNumber),
  ]
);

export const comicImage = pgTable("comicImage", {
  id: serial("id").primaryKey(),
  comicId: integer("comicId")
    .references(() => comic.id, { onDelete: "cascade" })
    .notNull(),
  imageUrl: text("imageUrl").notNull(),
  imageOrder: integer("imageOrder").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const chapterImage = pgTable(
  "chapterImage",
  {
    id: serial("id").primaryKey(),
    chapterId: integer("chapterId")
      .references(() => chapter.id, { onDelete: "cascade" })
      .notNull(),
    imageUrl: text("imageUrl").notNull(),
    pageNumber: integer("pageNumber").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("chapterImageChapterIdIdx").on(table.chapterId),
    index("chapterImagePageNumberIdx").on(table.pageNumber),
  ]
);

export const comicToGenre = pgTable(
  "comicToGenre",
  {
    comicId: integer("comicId")
      .references(() => comic.id, { onDelete: "cascade" })
      .notNull(),
    genreId: integer("genreId")
      .references(() => genre.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.comicId, table.genreId] }),
  })
);

// ═══════════════════════════════════════════════════
// USER INTERACTION TABLES
// ═══════════════════════════════════════════════════

export const bookmark = pgTable(
  "bookmark",
  {
    userId: text("userId")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    comicId: integer("comicId")
      .references(() => comic.id, { onDelete: "cascade" })
      .notNull(),
    lastReadChapterId: integer("lastReadChapterId").references(() => chapter.id),
    status: text("status").default("Reading").notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.comicId] }),
    index("bookmarkUserIdIdx").on(table.userId),
    index("bookmarkComicIdIdx").on(table.comicId),
  ]
);

export const comment = pgTable(
  "comment",
  {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    userId: text("userId")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    chapterId: integer("chapterId")
      .references(() => chapter.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("commentUserIdIdx").on(table.userId),
    index("commentChapterIdIdx").on(table.chapterId),
    index("commentCreatedAtIdx").on(table.createdAt),
  ]
);

export const readingProgress = pgTable(
  "readingProgress",
  {
    id: serial("id").primaryKey(),
    userId: text("userId")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    comicId: integer("comicId")
      .references(() => comic.id, { onDelete: "cascade" })
      .notNull(),
    chapterId: integer("chapterId")
      .references(() => chapter.id, { onDelete: "cascade" })
      .notNull(),
    pageNumber: integer("pageNumber").default(0).notNull(),
    scrollPosition: integer("scrollPosition").default(0).notNull(),
    totalPages: integer("totalPages").default(0).notNull(),
    progressPercent: integer("progressPercent").default(0).notNull(),
    completedAt: timestamp("completedAt", { mode: "date" }),
    lastReadAt: timestamp("lastReadAt", { mode: "date" }).defaultNow().notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("readingProgressUserIdIdx").on(table.userId),
    index("readingProgressComicIdIdx").on(table.comicId),
    index("readingProgressChapterIdIdx").on(table.chapterId),
    index("readingProgressLastReadIdx").on(table.lastReadAt),
    index("readingProgressUserComicIdx").on(table.userId, table.comicId),
  ]
);
