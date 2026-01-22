/**
 * Genres and Types Combined DTOs
 * Data Transfer Objects for combined genre and type operations
 */

import type { GenreDto } from "@/dto/genres-dto";
import type { TypeDto } from "@/dto/types-dto";

export interface GenresTypesDto {
  genres: GenreDto[];
  types: TypeDto[];
}

export interface GenresTypesWithCountsDto {
  genres: Array<GenreDto & { comicCount: number }>;
  types: Array<TypeDto & { comicCount: number }>;
}

export type { CreateGenreDto, UpdateGenreDto } from "@/dto/genres-dto";
export type { CreateTypeDto, UpdateTypeDto } from "@/dto/types-dto";
export type { GenreDto, TypeDto };

export { getAllGenres, getAllTypes } from "@/lib/actions/genres-types";
