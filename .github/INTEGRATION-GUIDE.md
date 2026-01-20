# Quick Integration Guide: New Components & Actions

This guide shows how to integrate the new components and actions created in Phase 2a.

---

## 🔐 Auth Components (For Task 3)

### OAuthProviders - Social Sign-In Buttons

**Import**:
```typescript
import { OAuthProviders } from "@/components/auth";
```

**Usage in sign-in/page.tsx**:
```tsx
'use client';

import { OAuthProviders, FormErrorAlert } from "@/components/auth";
import { GenericForm } from "@/components/shared/GenericForm";

export default function SignInPage() {
  const [error, setError] = useState<string>();

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show errors */}
          <FormErrorAlert
            message={error}
            onDismiss={() => setError(undefined)}
          />

          {/* Email/password form */}
          <GenericForm
            schema={signInSchema}
            onSubmit={handleSignIn}
            submitText="Sign In"
          >
            {/* form fields */}
          </GenericForm>

          {/* OAuth providers */}
          <OAuthProviders redirectTo="/dashboard" />
        </CardContent>
      </Card>
    </div>
  );
}
```

**Props**:
- `redirectTo?: string` - Where to redirect after signin (default: "/")
- `isLoading?: boolean` - Loading state

---

### PasswordStrengthMeter - Password Validation

**Import**:
```typescript
import { PasswordStrengthMeter } from "@/components/auth";
```

**Usage in sign-up/page.tsx**:
```tsx
'use client';

import { useState } from 'react';
import { PasswordStrengthMeter } from "@/components/auth";
import { FormAlert } from "@/components/auth";

export default function SignUpPage() {
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "fair" | "good" | "strong">("weak");

  const handleSubmit = async () => {
    // Require "good" or "strong" password
    if (passwordStrength === "weak" || passwordStrength === "fair") {
      return; // Don't allow submit
    }
    // Continue with signup
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
      />

      {/* Show password strength */}
      <PasswordStrengthMeter
        password={password}
        onStrengthChange={setPasswordStrength}
      />

      <button type="submit" disabled={passwordStrength === "weak"}>
        Create Account
      </button>
    </form>
  );
}
```

**Props**:
- `password: string` - Password to evaluate
- `onStrengthChange?: (strength: PasswordStrength) => void` - Callback when strength changes

**Strength Levels**: `"weak"`, `"fair"`, `"good"`, `"strong"`

---

### FormErrorAlert - Error Display

**Import**:
```typescript
import { FormErrorAlert, FormAlert } from "@/components/auth";
```

**Usage for Errors**:
```tsx
const [error, setError] = useState<string>();

<FormErrorAlert
  message={error}
  visible={!!error}
  onDismiss={() => setError(undefined)}
  autoDismissDelay={5000} // Auto-dismiss after 5s
/>
```

**Usage for Success/Info**:
```tsx
const [success, setSuccess] = useState<string>();

<FormAlert
  message={success}
  type="success"
  visible={!!success}
  onDismiss={() => setSuccess(undefined)}
  autoDismissDelay={3000}
/>
```

**Props**:
- `message?: string` - Alert message
- `visible?: boolean` - Whether to show (default: true)
- `type?: "error" | "success" | "warning" | "info"` - Alert type
- `onDismiss?: () => void` - Callback on dismiss
- `autoDismissDelay?: number` - Auto-dismiss after ms

---

## 🛠️ Admin Components & Actions (For Task 4)

### CrudModal - Create/Edit/Delete Forms

**Import**:
```typescript
import { CrudModal, ConfirmationModal } from "@/components/admin/CrudModal";
```

**Usage for Create Comic**:
```tsx
'use client';

import { useState } from 'react';
import { CrudModal } from "@/components/admin/CrudModal";
import { createComicAsAdmin } from "@/lib/actions/admin";

export function CreateComicButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const result = await createComicAsAdmin(formData);
    if (result.success) {
      setIsOpen(false);
      toast.success("Comic created!");
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Create Comic</Button>

      <CrudModal
        title="Create Comic"
        description="Add a new comic to the platform"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        submitLabel="Create"
        isLoading={isLoading}
        size="lg"
      >
        <form className="space-y-4">
          <input type="text" name="title" placeholder="Comic Title" required />
          <textarea name="description" placeholder="Description" required />
          <input type="text" name="slug" placeholder="URL Slug" required />
          {/* More fields */}
        </form>
      </CrudModal>
    </>
  );
}
```

**Props**:
- `title: string` - Modal title
- `description?: string` - Modal description
- `isOpen: boolean` - Whether modal is visible
- `onClose: () => void` - Callback to close
- `children: ReactNode` - Form content
- `submitLabel?: string` - Button text (default: "Save")
- `onSubmit?: (e: FormEvent) => void` - Form submission handler
- `isLoading?: boolean` - Loading state
- `size?: "sm" | "default" | "lg" | "xl"` - Modal size

### ConfirmationModal - Delete Confirmation

**Usage for Delete**:
```tsx
const [showConfirm, setShowConfirm] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

const handleDelete = async () => {
  setIsDeleting(true);
  const result = await deleteComicAsAdmin(comicId);
  if (result.success) {
    toast.success("Comic deleted");
  } else {
    toast.error(result.error);
  }
  setIsDeleting(false);
};

<ConfirmationModal
  title="Delete Comic"
  description="This action cannot be undone. Are you sure?"
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  isLoading={isDeleting}
  isDangerous={true}
  confirmLabel="Delete Comic"
/>
```

---

## ⚙️ Admin Actions

### Available Admin Actions

**Import**:
```typescript
import {
  deleteUserAsAdmin,
  updateUserRoleAsAdmin,
  deleteComicAsAdmin,
  deleteChapterAsAdmin,
  deleteGenreAsAdmin,
  bulkDeleteUsers,
  bulkDeleteComics,
} from "@/lib/actions/admin";
```

### Delete User
```typescript
const result = await deleteUserAsAdmin(userId);
// Result: { success: true/false, message: string, error?: string }
```

**Safety Features**:
- ✅ Admin-only (checked in action)
- ✅ Prevents self-deletion
- ✅ Revalidates admin pages automatically

### Update User Role
```typescript
const result = await updateUserRoleAsAdmin(userId, "moderator");
// Result: { success: true/false, message: string, error?: string }
```

**Roles**: `"user"`, `"admin"`, `"moderator"`

**Safety Features**:
- ✅ Prevents self-demotion
- ✅ Admin-only

### Delete Comic
```typescript
const result = await deleteComicAsAdmin(comicId);
```

### Bulk Delete Users
```typescript
const result = await bulkDeleteUsers([userId1, userId2, userId3]);
// Result: { success: true/false, data: { deletedCount: number } }
```

**Safety Features**:
- ✅ Filters out self-deletion attempt
- ✅ Reports how many deleted

---

## 📋 Integration Checklist

### Task 3: Auth Pages
- [ ] Import OAuthProviders in sign-in page
- [ ] Import OAuthProviders in sign-up page
- [ ] Add PasswordStrengthMeter to sign-up form
- [ ] Import FormErrorAlert in all auth pages
- [ ] Display errors with FormErrorAlert
- [ ] Test OAuth buttons with Google/GitHub
- [ ] Verify password strength meter UX

### Task 4: Admin Pages
- [ ] Import CrudModal in user management page
- [ ] Import admin actions (delete, bulk operations)
- [ ] Add delete buttons to data tables
- [ ] Show confirmation modal on delete
- [ ] Execute delete action and revalidate
- [ ] Add create/edit modals for all resources
- [ ] Implement bulk delete UI
- [ ] Test all CRUD operations

---

## 🧪 Testing Example

### Test Auth Component
```typescript
import { render, screen } from "@testing-library/react";
import { OAuthProviders } from "@/components/auth";

test("OAuth buttons render correctly", () => {
  render(<OAuthProviders />);
  expect(screen.getByRole("button", { name: /google/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /github/i })).toBeInTheDocument();
});
```

### Test Admin Action
```typescript
import { deleteUserAsAdmin } from "@/lib/actions/admin";
import { auth } from "@/lib/auth";

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(() => ({
    user: { id: "admin1", role: "admin" }
  }))
}));

test("deleteUserAsAdmin requires admin role", async () => {
  const result = await deleteUserAsAdmin("user1");
  expect(result.success).toBe(true);
});
```

---

## 🚀 Performance Tips

1. **Lazy load modals** - Don't render until needed
2. **Memoize callbacks** - Use `useCallback` for action handlers
3. **Debounce password meter** - Don't recalculate on every keystroke
4. **Batch admin actions** - Use `bulkDeleteUsers` instead of individual deletes
5. **Cache OAuth button state** - Don't re-render unnecessarily

---

## 🐛 Troubleshooting

### OAuth buttons not showing
- ✅ Check NextAuth is configured with Google/GitHub providers
- ✅ Verify `NEXTAUTH_*` environment variables set
- ✅ Check browser console for errors

### Password meter not updating
- ✅ Ensure parent component re-renders on state change
- ✅ Check password state is passing to component
- ✅ Verify onStrengthChange callback is wired

### Admin actions failing
- ✅ Check user has admin role in database
- ✅ Verify `auth()` is configured correctly
- ✅ Check route revalidation is working

---

## 📚 Further Reading

- [Component Pattern](../PHASE-2A-PROGRESS.md)
- [Admin Actions Reference](../TASKS-2-4-PLAN.md)
- [Full Session Summary](../SESSION-SUMMARY.md)
