# PowerShell script to fix all lowercase component names

$fixes = @{
  'src\app\(root)\search\page.tsx'        = @(
    @{Old = 'function searchResultsSkeleton\(\)'; New = 'function SearchResultsSkeleton()' }
    @{Old = '<searchResultsSkeleton\s*/?>'; New = '<SearchResultsSkeleton />' }
  )
  'src\app\(root)\genres\[slug]\page.tsx' = @(
    @{Old = 'function comicGridSkeleton\(\)'; New = 'function ComicGridSkeleton()' }
    @{Old = '<comicGridSkeleton\s*/?>'; New = '<ComicGridSkeleton />' }
    @{Old = '<comicCard\b'; New = '<ComicCard' }
  )
  'src\app\(root)\comics\page.tsx'        = @(
    @{Old = 'function comicsGallery\(\)'; New = 'function ComicsGallery()' }
    @{Old = '<comicsGallery\b'; New = '<ComicsGallery' }
  )
  'src\app\(root)\browse\page.tsx'        = @(
    @{Old = '<comicCard\b'; New = '<ComicCard' }
  )
  'src\app\(root)\profile\layout.tsx'     = @(
    @{Old = '<profileLink\b'; New = '<ProfileLink' }
  )
  'src\app\admin\users\page.tsx'          = @(
    @{Old = 'async function usersTable\(\)'; New = 'async function UsersTable()' }
    @{Old = 'function usersHeader\(\)'; New = 'function UsersHeader()' }
    @{Old = '<usersHeader\s*/?>'; New = '<UsersHeader />' }
    @{Old = '<usersTable\s*/?>'; New = '<UsersTable />' }
  )
  'src\app\admin\chapters\page.tsx'       = @(
    @{Old = 'async function chaptersTable\(\)'; New = 'async function ChaptersTable()' }
    @{Old = 'function chaptersHeader\(\)'; New = 'function ChaptersHeader()' }
    @{Old = '<chaptersHeader\s*/?>'; New = '<ChaptersHeader />' }
    @{Old = '<chaptersTable\s*/?>'; New = '<ChaptersTable />' }
  )
  'src\app\admin\page.tsx'                = @(
    @{Old = 'function quickActions\(\)'; New = 'function QuickActions()' }
    @{Old = 'async function statsGrid\(\)'; New = 'async function StatsGrid()' }
    @{Old = 'async function recentComics\(\)'; New = 'async function RecentComics()' }
    @{Old = 'async function recentUsers\(\)'; New = 'async function RecentUsers()' }
    @{Old = 'async function recentChapters\(\)'; New = 'async function RecentChapters()' }
    @{Old = 'async function recentComments\(\)'; New = 'async function RecentComments()' }
    @{Old = '<statsGrid\s*/?>'; New = '<StatsGrid />' }
    @{Old = '<quickActions\s*/?>'; New = '<QuickActions />' }
    @{Old = '<recentComics\s*/?>'; New = '<RecentComics />' }
    @{Old = '<recentUsers\s*/?>'; New = '<RecentUsers />' }
    @{Old = '<recentChapters\s*/?>'; New = '<RecentChapters />' }
    @{Old = '<recentComments\s*/?>'; New = '<RecentComments />' }
  )
  'src\app\admin\types\page.tsx'          = @(
    @{Old = 'function typesHeader\(\)'; New = 'function TypesHeader()' }
    @{Old = 'async function typesTable\(\)'; New = 'async function TypesTable()' }
    @{Old = '<typesHeader\s*/?>'; New = '<TypesHeader />' }
    @{Old = '<typesTable\s*/?>'; New = '<TypesTable />' }
  )
  'src\app\admin\genres\page.tsx'         = @(
    @{Old = 'function genresHeader\(\)'; New = 'function GenresHeader()' }
    @{Old = 'async function genresTable\(\)'; New = 'async function GenresTable()' }
    @{Old = '<genresHeader\s*/?>'; New = '<GenresHeader />' }
    @{Old = '<genresTable\s*/?>'; New = '<GenresTable />' }
  )
  'src\app\admin\artists\page.tsx'        = @(
    @{Old = '<artistsHeader\s*/?>'; New = '<ArtistsHeader />' }
    @{Old = '<artistsTable\s*/?>'; New = '<ArtistsTable />' }
  )
  'src\app\admin\authors\page.tsx'        = @(
    @{Old = '<authorsHeader\s*/?>'; New = '<AuthorsHeader />' }
    @{Old = '<authorsTable\s*/?>'; New = '<AuthorsTable />' }
  )
  'src\app\admin\comics\[id]\page.tsx'    = @(
    @{Old = '<comicEditForm\b'; New = '<ComicEditForm' }
  )
  'src\app\admin\comics\new\page.tsx'     = @(
    @{Old = '<protectedComicForm\b'; New = '<ProtectedComicForm' }
  )
  'src\app\admin\comics\page.tsx'         = @(
    @{Old = '<comicsListPageContent\b'; New = '<ComicsListPageContent' }
  )
}

$totalFixed = 0
foreach ($file in $fixes.Keys) {
  $path = Join-Path $PWD $file
  if (Test-Path $path) {
    $content = Get-Content $path -Raw
    $originalContent = $content

    foreach ($fix in $fixes[$file]) {
      $content = $content -replace $fix.Old, $fix.New
    }

    if ($content -ne $originalContent) {
      Set-Content $path $content -NoNewline
      Write-Host "Fixed: $file" -ForegroundColor Green
      $totalFixed++
    }
  }
  else {
    Write-Host "File not found: $file" -ForegroundColor Yellow
  }
}

Write-Host "`nTotal files fixed: $totalFixed" -ForegroundColor Cyan
