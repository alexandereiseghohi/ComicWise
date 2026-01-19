-- ═══════════════════════════════════════════════════════════════════════════
-- ComicWise Database Indexes - Performance Optimization
-- ═══════════════════════════════════════════════════════════════════════════

-- Comics table indexes
CREATE INDEX IF NOT EXISTS idx_comics_slug ON comics(slug);
CREATE INDEX IF NOT EXISTS idx_comics_status ON comics(status);
CREATE INDEX IF NOT EXISTS idx_comics_rating ON comics(rating DESC);
CREATE INDEX IF NOT EXISTS idx_comics_created_at ON comics("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_comics_type_id ON comics("typeId");

-- Chapters table indexes
CREATE INDEX IF NOT EXISTS idx_chapters_comic_id ON chapters("comicId");
CREATE INDEX IF NOT EXISTS idx_chapters_slug ON chapters(slug);
CREATE INDEX IF NOT EXISTS idx_chapters_number ON chapters("chapterNumber");
CREATE INDEX IF NOT EXISTS idx_chapters_comic_number ON chapters("comicId", "chapterNumber" DESC);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Junction table indexes
CREATE INDEX IF NOT EXISTS idx_comic_genre_comic_id ON "comicToGenre"("comicId");
CREATE INDEX IF NOT EXISTS idx_comic_genre_genre_id ON "comicToGenre"("genreId");

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_comics_title_search ON comics USING gin(to_tsvector('english', title));
