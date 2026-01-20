# Zustand Store Integration Documentation

## Overview

This document describes the complete integration of Zustand stores across the
ComicWise platform for state management.

## Store Architecture

### Available Stores

1. **Auth Store** (`authStore.ts`)
   - User authentication state
   - Session management
   - User profile data

2. **Bookmark Store** (`bookmarkStore.ts`)
   - Comic bookmarks
   - Reading progress tracking
   - Persistent storage via localStorage

3. **Comic Store** (`comicStore.ts`)
   - Comics listing and filtering
   - Search functionality
   - Sorting and pagination
   - Recently viewed comics

4. **Reader Store** (`readerStore.ts`)
   - Chapter reading state
   - Reader settings (mode, layout, quality)
   - Page navigation
   - Reading history
   - Zoom and fullscreen controls

5. **Notification Store** (`notificationStore.ts`)
   - Toast notifications
   - System notifications
   - Notification history

6. **UI Store** (`uiStore.ts`)
   - Sidebar state
   - Theme preferences
   - Modal management
   - Search UI state

## Usage

### Importing Stores

```typescript
import {
  useAuth,
  useBookmarks,
  useComics,
  useReader,
  useNotifications,
  useUI,
} from "@/hooks/useStores";
```

### Auth Store Examples

```typescript
// In a component
function MyComponent() {
  const { user, isAuthenticated, setUser, logout } = useAuth();

  // Check authentication
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  // Update user
  const handleUpdateProfile = (data) => {
    updateUser(data);
  };

  return <div>Welcome, {user.name}!</div>;
}
```

### Bookmark Store Examples

```typescript
function ComicDetailPage({ comic }) {
  const { isBookmarked, addBookmark, removeBookmark, updateProgress } = useBookmarks();

  const handleToggleBookmark = () => {
    if (isBookmarked(comic.id)) {
      removeBookmark(comic.id);
    } else {
      addBookmark(comic.id);
    }
  };

  // Track reading progress
  const handleChapterRead = (chapterId) => {
    updateProgress(comic.id, chapterId);
  };

  return (
    <button onClick={handleToggleBookmark}>
      {isBookmarked(comic.id) ? 'Remove Bookmark' : 'Add Bookmark'}
    </button>
  );
}
```

### Comic Store Examples

```typescript
function ComicsListPage() {
  const {
    filteredComics,
    filters,
    applyFilters,
    setSorting,
    setPage
  } = useComics();

  const handleSearch = (search) => {
    applyFilters({ search });
  };

  const handleSort = (sortBy, sortOrder) => {
    setSorting(sortBy, sortOrder);
  };

  return (
    <div>
      <SearchInput onChange={handleSearch} />
      <ComicGrid comics={filteredComics} />
    </div>
  );
}
```

### Reader Store Examples

```typescript
function ChapterReaderPage() {
  const {
    currentPage,
    totalPages,
    readingMode,
    setReadingMode,
    nextPage,
    prevPage,
    setZoom,
    toggleFullscreen
  } = useReader();

  return (
    <div>
      <ReaderControls
        mode={readingMode}
        onModeChange={setReadingMode}
        onZoomChange={setZoom}
        onFullscreen={toggleFullscreen}
      />
      <PageDisplay page={currentPage} total={totalPages} />
      <NavigationButtons onNext={nextPage} onPrev={prevPage} />
    </div>
  );
}
```

### Notification Store Examples

```typescript
function FormComponent() {
  const { success, error, warning, info } = useNotifications();

  const handleSubmit = async (data) => {
    try {
      await submitData(data);
      success('Success!', 'Your changes have been saved');
    } catch (err) {
      error('Error', 'Failed to save changes');
    }
  };

  return <Form onSubmit={handleSubmit} />;
}
```

### UI Store Examples

```typescript
function Layout() {
  const {
    sidebarOpen,
    toggleSidebar,
    theme,
    setTheme,
    openModal,
    closeModal
  } = useUI();

  return (
    <div>
      <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />
      <ThemeToggle theme={theme} onChange={setTheme} />
      <Modal isOpen={activeModal === 'settings'} onClose={closeModal} />
    </div>
  );
}
```

## Integration with Next.js

### Server Components

Server components cannot directly use Zustand stores. Pass data as props to
client components:

```typescript
// app/comics/page.tsx (Server Component)
export default async function ComicsPage() {
  const comics = await getComics();

  return <ComicsClient comics={comics} />;
}

// components/ComicsClient.tsx (Client Component)
'use client';

export function ComicsClient({ comics }) {
  const { setComics } = useComics();

  useEffect(() => {
    setComics(comics);
  }, [comics, setComics]);

  return <ComicsList />;
}
```

### Auth Synchronization

The `AuthSync` component automatically synchronizes NextAuth session with the
auth store:

```typescript
// app/Providers.tsx
export function Providers({ children }) {
  return (
    <SessionProvider>
      <AuthSync /> {/* Syncs NextAuth with Zustand */}
      {children}
    </SessionProvider>
  );
}
```

## Persistence

Stores that persist data:

1. **Auth Store** - Persists user and authentication state
2. **Bookmark Store** - Persists bookmarks and reading progress
3. **Comic Store** - Persists sort preferences and recently viewed
4. **Reader Store** - Persists reader settings and history
5. **UI Store** - Persists theme and UI preferences

Persisted data is stored in `localStorage` and automatically restored on page
load.

## Testing

### Unit Testing Stores

```typescript
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "@/hooks/useStores";

test("should authenticate user", () => {
  const { result } = renderHook(() => useAuth());

  act(() => {
    result.current.setUser({ id: "1", name: "Test" });
  });

  expect(result.current.isAuthenticated).toBe(true);
});
```

### Integration Testing

See `src/__tests__/integration/stores.test.tsx` for comprehensive integration
tests.

## Best Practices

1. **Component Scope**
   - Use hooks at the component level
   - Don't create store instances manually
   - Let Zustand manage the singleton

2. **Performance**
   - Use selector functions for specific state
   - Avoid subscribing to entire store unnecessarily

   ```typescript
   // Good
   const user = useAuthStore((state) => state.user);

   // Less optimal
   const { user, isAuthenticated, isLoading } = useAuth();
   ```

3. **Actions**
   - Keep actions simple and focused
   - Use separate functions for complex logic
   - Handle errors gracefully

4. **Persistence**
   - Be mindful of what you persist
   - Use `partialize` to control persisted state
   - Clear sensitive data on logout

5. **TypeScript**
   - Always type your store state and actions
   - Use interfaces for complex types
   - Leverage TypeScript's type inference

## Debugging

### DevTools

All stores use the `devtools` middleware for Redux DevTools integration:

1. Install Redux DevTools browser extension
2. Stores appear with their names (e.g., "comicwise-auth")
3. View state, actions, and time-travel debugging

### Logging

Enable logging in development:

```typescript
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useStore = create(
  devtools(
    (set) => ({
      // state
    }),
    {
      name: "my-store",
      trace: true, // Enable action tracing
    }
  )
);
```

## Migration Guide

### From React Context

```typescript
// Before (Context)
const { user } = useAuthContext();

// After (Zustand)
const { user } = useAuth();
```

### From Redux

```typescript
// Before (Redux)
const user = useSelector((state) => state.auth.user);
const dispatch = useDispatch();
dispatch(setUser(userData));

// After (Zustand)
const { user, setUser } = useAuth();
setUser(userData);
```

## Common Patterns

### Optimistic Updates

```typescript
const { updateProgress } = useBookmarks();
const { success, error } = useNotifications();

async function handleProgress(comicId, chapterId) {
  // Optimistic update
  updateProgress(comicId, chapterId);

  try {
    await api.updateProgress(comicId, chapterId);
    success("Progress saved");
  } catch (err) {
    // Revert on error
    error("Failed to save progress");
  }
}
```

### Derived State

```typescript
function useFilteredBookmarks() {
  const { bookmarks } = useBookmarks();
  const { comics } = useComics();

  return useMemo(() => {
    return comics.filter((c) => bookmarks.has(c.id));
  }, [comics, bookmarks]);
}
```

### Computed Values

```typescript
// In store
export const useComicStore = create((set, get) => ({
  // ... state

  // Computed getter
  getPaginatedComics: () => {
    const { filteredComics, currentPage, itemsPerPage } = get();
    const start = (currentPage - 1) * itemsPerPage;
    return filteredComics.slice(start, start + itemsPerPage);
  },
}));
```

## Performance Optimization

### Selector Memoization

```typescript
import { useShallow } from "zustand/react/shallow";

function MyComponent() {
  // Prevents re-renders when other state changes
  const { user, isAuthenticated } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
    }))
  );
}
```

### Subscription

```typescript
useEffect(() => {
  const unsubscribe = useAuthStore.subscribe(
    (state) => state.user,
    (user) => {
      console.log("User changed:", user);
    }
  );

  return unsubscribe;
}, []);
```

## Troubleshooting

### State Not Persisting

1. Check localStorage quota
2. Verify `persist` middleware is configured
3. Check browser privacy settings

### State Not Updating

1. Ensure you're using `set` function
2. Check for immutability violations
3. Verify component is subscribed to correct state

### Hydration Errors

1. Use `useEffect` for client-only state
2. Check SSR compatibility
3. Use `skipHydration` option if needed

## Additional Resources

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## Conclusion

The Zustand store integration provides a robust, type-safe, and performant state
management solution for ComicWise. All major components are integrated and
tested, with comprehensive documentation for future development.
