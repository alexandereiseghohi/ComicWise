// ═══════════════════════════════════════════════════════════════════════════
// DATABASE RELATION TYPES (Drizzle ORM Inferred Types)
// ═══════════════════════════════════════════════════════════════════════════

import type {
  Artist,
  Author,
  Bookmark,
  Chapter,
  ChapterImage,
  Comic,
  ComicImage,
  ComicType,
  Comment,
  Genre,
  ReadingProgress,
  User,
} from "@/types/database";

// ═══════════════════════════════════════════════════════════════════════════
// COMIC RELATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Comic with all related data
 * Includes chapters, genres, author, artist, type, and images
 */
export interface ComicWithChapters extends Comic {
  chapters: Chapter[];
  genres?: Genre[];
  author?: Author | null;
  artist?: Artist | null;
  type?: ComicType | null;
  images?: ComicImage[];
}

/**
 * Comic with search metadata
 * Optimized for search result pages
 */
export interface ComicSearchResult {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  description: string;
  rating: string | null;
  views: number;
  status: Comic["status"];
  authorName?: string | null;
  artistName?: string | null;
  typeName?: string | null;
  genreCount?: number;
  chapterCount?: number;
  createdAt: Date;
}

/**
 * Comic with brief info and stats
 * For lists and cards
 */
export interface ComicListItem {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  rating: string | null;
  views: number;
  status: Comic["status"];
  authorName?: string | null;
  chapterCount: number;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// CHAPTER RELATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Chapter with related comic
 */
export interface ChapterWithComic extends Chapter {
  comic: Comic;
  images?: ChapterImage[];
  comments?: Comment[];
  commentCount?: number;
}

/**
 * Chapter with full context
 * Includes comic, images, and comments
 */
export interface ChapterWithContext extends Chapter {
  comic: Comic & {
    author?: Author | null;
    artist?: Artist | null;
    type?: ComicType | null;
  };
  images: ChapterImage[];
  comments: CommentWithUser[];
  totalComments: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// USER RELATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * User with statistics
 * Includes bookmark count, comment count, and reading progress
 */
export interface UserWithStats extends User {
  bookmarkCount: number;
  commentCount: number;
  readingProgressCount: number;
  recentReading?: ReadingProgress[];
  recentBookmarks?: Bookmark[];
}

/**
 * User profile with activity
 */
export interface UserProfile extends User {
  bookmarks: Bookmark[];
  comments: Comment[];
  readingProgress: ReadingProgress[];
  stats: {
    bookmarkCount: number;
    commentCount: number;
    readingProgressCount: number;
    lastActiveAt: Date | null;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMENT RELATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Comment with user information
 */
export interface CommentWithUser extends Comment {
  user: User;
  chapter?: Chapter;
}

/**
 * Comment with full context
 */
export interface CommentWithContext extends Comment {
  user: User;
  chapter: Chapter & {
    comic: Comic;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOKMARK RELATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Bookmark with associated comic
 */
export interface BookmarkWithComic extends Bookmark {
  comic: ComicWithChapters;
  lastReadChapter?: Chapter | null;
}

/**
 * Bookmark with brief comic info
 */
export interface BookmarkListItem extends Bookmark {
  comicTitle: string;
  comicSlug: string;
  comicCoverImage: string;
  lastReadChapterTitle?: string | null;
  lastReadChapterNumber?: number | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// READING PROGRESS RELATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Reading progress with comic and chapter context
 */
export interface ReadingProgressWithContext extends ReadingProgress {
  comic: Comic;
  chapter: Chapter;
  user?: User;
}

/**
 * Reading progress for dashboard display
 */
export interface ReadingProgressItem {
  comicId: number;
  comicTitle: string;
  comicSlug: string;
  comicCoverImage: string;
  chapterId: number;
  chapterNumber: number;
  chapterTitle: string;
  progressPercent: number;
  lastReadAt: Date;
  isCompleted: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTHOR & ARTIST RELATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Author with list of comics
 */
export interface AuthorWithComicsList extends Author {
  comics: ComicListItem[];
  comicCount: number;
}

/**
 * Artist with list of comics
 */
export interface ArtistWithComicsList extends Artist {
  comics: ComicListItem[];
  comicCount: number;
}

/**
 * Genre with associated comics
 */
export interface GenreWithComicsList extends Genre {
  comics: ComicListItem[];
  comicCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// AGGREGATE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Combined relations for comic detail page
 */
export interface ComicDetailPage extends ComicWithChapters {
  relatedComics: ComicListItem[];
  bookmarkCount: number;
  commentCount: number;
  userBookmark?: Bookmark | null;
}

/**
 * Combined relations for chapter detail page
 */
export interface ChapterDetailPage extends ChapterWithContext {
  previousChapter?: Chapter | null;
  nextChapter?: Chapter | null;
  relatedChapters: Chapter[];
}

/**
 * Dashboard data with all relations
 */
export interface DashboardData {
  user: UserWithStats;
  recentReadings: ReadingProgressItem[];
  recentBookmarks: BookmarkListItem[];
  recommendedComics: ComicSearchResult[];
  continueReadingComics: ReadingProgressItem[];
}

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH RESULT TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Unified search result across comics, chapters, authors
 */
export interface UnifiedSearchResult {
  type: "comic" | "chapter" | "author" | "artist" | "genre";
  id: number | string;
  title: string;
  description?: string;
  image?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Search results with pagination
 */
export interface SearchResultsPage {
  query: string;
  results: UnifiedSearchResult[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// READING CONTEXT TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Full context for chapter reading
 */
export interface ChapterReaderContext {
  chapter: ChapterWithContext;
  previousChapter: Chapter | null;
  nextChapter: Chapter | null;
  userProgress: ReadingProgress | null;
  isBookmarked: boolean;
  userComment?: Comment | null;
}

/**
 * Comic browsing context
 */
export interface ComicBrowseContext {
  comic: ComicDetailPage;
  currentChapter?: Chapter | null;
  userBookmark?: Bookmark | null;
  userProgress?: ReadingProgress | null;
}
