export interface ChapterCreateDTO {
  comicId: string;
  title: string;
  number?: number;
  summary?: string;
  content?: string;
  published?: boolean;
}

export interface ChapterUpdateDTO extends Partial<ChapterCreateDTO> {}

export interface ChapterReadDTO {
  id: string;
  comicId: string;
  title: string;
  number?: number;
  summary?: string;
  content?: string;
  published: boolean;
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
}
