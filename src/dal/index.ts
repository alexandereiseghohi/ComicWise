/**
 * Central export for all Data Access Layer modules
 */

// Base class for all DAL implementations
export { BaseDal, type ListOptions } from "@/dal/base-dal";

// DAL instances and classes
export { artistDal } from "@/dal/artist-dal";
export { authorDal } from "@/dal/author-dal";
export { bookmarkDal } from "@/dal/bookmark-dal";
export { chapterDal } from "@/dal/chapter-dal";
export { comicDal } from "@/dal/comic-dal";
export { comicToGenreDal } from "@/dal/comic-to-genre-dal";
export { commentDal } from "@/dal/comment-dal";
export { genreDal } from "@/dal/genre-dal";
export { typeDal } from "@/dal/type-dal";
export { userDal } from "@/dal/user-dal";
