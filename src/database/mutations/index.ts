// ═══════════════════════════════════════════════════
// AUTH MUTATIONS
// ═══════════════════════════════════════════════════
export * from "@/database/mutations/accounts";
export * from "@/database/mutations/authenticators";
export * from "@/database/mutations/password-reset-token";
export * from "@/database/mutations/sessions";
export * from "@/database/mutations/verification-tokens";

// ═══════════════════════════════════════════════════
// USER MUTATIONS
// ═══════════════════════════════════════════════════
export * from "@/database/mutations/users";

// ═══════════════════════════════════════════════════
// COMIC CONTENT MUTATIONS
// ═══════════════════════════════════════════════════
export * from "@/database/mutations/artists";
export * from "@/database/mutations/authors";
export * from "@/database/mutations/chapter-images";
export {
  addChapterImage,
  addChapterImages,
  createChapter,
  deleteChapter,
  incrementChapterViews,
  updateChapter,
} from "@/database/mutations/chapters";
export * from "@/database/mutations/comic-images";
export * from "@/database/mutations/comic-to-genre";
export * from "@/database/mutations/comics";
export * from "@/database/mutations/genres";
export * from "@/database/mutations/types";

// ═══════════════════════════════════════════════════
// INTERACTION MUTATIONS
// ═══════════════════════════════════════════════════
export * from "@/database/mutations/bookmarks";
export * from "@/database/mutations/comments";
