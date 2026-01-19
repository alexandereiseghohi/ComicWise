/**
 * Genres and Types Combined DTOs
 * Data Transfer Objects for combined genre and type operations
 */

import type { GenreDto } from "@/dto/genresDto";
import type { TypeDto } from "@/dto/typesDto";

export interface GenresTypesDto {
  genres: GenreDto[];
  types: TypeDto[];
}

export interface GenresTypesWithCountsDto {
  genres: Array<GenreDto & { comicCount: number }>;
  types: Array<TypeDto & { comicCount: number }>;
}

export type { CreateGenreDto, UpdateGenreDto } from "@/dto/genresDto";
export type { CreateTypeDto, UpdateTypeDto } from "@/dto/typesDto";
export type { GenreDto, TypeDto };

export { getAllGenres, getAllTypes } from "@/lib/actions/genresTypes";
