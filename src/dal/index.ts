/**
 * Central export for all Data Access Layer modules
 */

// Base class for all DAL implementations
export { BaseDal, type ListOptions } from "@/dal/baseDal";

// DAL instances and classes
export { artistDal } from "@/dal/artistDal";
export { authorDal } from "@/dal/authorDal";
export { bookmarkDal } from "@/dal/bookmarkDal";
export { chapterDal } from "@/dal/chapterDal";
export { comicDal } from "@/dal/comicDal";
export { comicToGenreDal } from "@/dal/comicToGenreDal";
export { commentDal } from "@/dal/commentDal";
export { genreDal } from "@/dal/genreDal";
export { typeDal } from "@/dal/typeDal";
export { userDal } from "@/dal/userDal";
