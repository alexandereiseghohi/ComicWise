# Image Upload System Documentation

## Overview

ComicWise uses **ImageKit** as its image management service for uploading,
storing, optimizing, and delivering images. This guide covers the complete image
upload system including configuration, API usage, client-side integration, and
best practices.

## Table of Contents

1. [Architecture](#architecture)
2. [Configuration](#configuration)
3. [API Reference](#api-reference)
4. [Client-Side Integration](#client-side-integration)
5. [Upload Types](#upload-types)
6. [Image Optimization](#image-optimization)
7. [Security](#security)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Architecture

### System Components

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Client/Browser │────▶│   Upload API    │────▶│    ImageKit     │
│                 │     │  /api/upload    │     │   (CDN/Cloud)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │                         │
                              ▼                         ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  ImageKit Lib   │     │  Image Storage  │
                        │  (Service)      │     │  & Delivery     │
                        └─────────────────┘     └─────────────────┘
```

### Key Features

- **Centralized Service**: `src/lib/imagekit.ts` handles all ImageKit operations
- **Type-Safe API**: TypeScript interfaces for upload options and results
- **Specialized Uploads**: Dedicated functions for comics, chapters, and avatars
- **Image Optimization**: Built-in URL transformation for responsive images
- **Batch Operations**: Support for multiple file uploads and deletions
- **Validation**: File type and size validation before upload

---

## Configuration

### Environment Variables

Add the following to your `.env.local`:

```env
# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_public_key_here
IMAGEKIT_PRIVATE_KEY=your_private_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# Upload Provider (imagekit | cloudinary | local)
UPLOAD_PROVIDER=imagekit
```

### App Configuration

Configuration is managed in `src/app-config/index.ts`:

```typescript
export const appConfig = {
  upload: {
    provider: process.env.UPLOAD_PROVIDER || "imagekit",
    imageKit: {
      enabled: true,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
    },
  },
};
```

### Getting ImageKit Credentials

1. Sign up at [ImageKit.io](https://imagekit.io/)
2. Navigate to **Developer Options** in your dashboard
3. Copy your:
   - **Public Key**
   - **Private Key**
   - **URL Endpoint**
4. Add them to your environment variables

---

## API Reference

### Upload API Endpoint

**Endpoint**: `POST /api/upload`

**Authentication**: Required (session-based)

**Content-Type**: `multipart/form-data`

### Request Parameters

| Parameter  | Type   | Required    | Description                                                      |
| ---------- | ------ | ----------- | ---------------------------------------------------------------- |
| `file`     | File   | Yes         | Image file to upload (JPEG, PNG, GIF, WebP)                      |
| `type`     | string | No          | Upload type: `comic-cover`, `chapter-image`, `avatar`, `general` |
| `entityId` | string | Conditional | Required for `comic-cover` and `chapter-image` types             |
| `sequence` | number | No          | Image sequence number (for chapter images)                       |

### Response Format

#### Success Response (200)

```json
{
  "fileId": "imagekit_file_id",
  "name": "comic-cover-1234567890-abc123.jpg",
  "size": 524288,
  "success": true,
  "thumbnailUrl": "https://ik.imagekit.io/.../tr:w-200,h-300/...",
  "type": "comic-cover",
  "url": "https://ik.imagekit.io/your_id/comicwise/comics/covers/comic-123.jpg"
}
```

#### Error Response (4xx/5xx)

```json
{
  "details": "Detailed error information",
  "error": "Error message"
}
```

### Error Codes

| Status Code | Description                                   |
| ----------- | --------------------------------------------- |
| 400         | Bad Request - Invalid file or parameters      |
| 401         | Unauthorized - Not authenticated              |
| 500         | Internal Server Error - Upload failed         |
| 503         | Service Unavailable - ImageKit not configured |

---

## Client-Side Integration

### Basic Upload Example

```typescript
async function uploadImage(file: File, type: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  return await response.json();
}
```

### React Component Example

```typescript
"use client";

import { useState } from "react";

export function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("File is too large. Maximum size is 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "comic-cover");
      formData.append("entityId", "comic-123");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      console.log("Upload successful:", result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

### Drag & Drop Upload Example

```typescript
"use client";

import { useState } from "react";

export function DragDropUploader() {
  const [dragging, setDragging] = useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Upload logic here
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "chapter-image");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("Uploaded:", result.url);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed p-8 ${
        dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <p>Drag and drop an image here</p>
    </div>
  );
}
```

---

## Upload Types

### 1. Comic Cover Upload

Uploads cover images for comics.

```typescript
// API Request
const formData = new FormData();
formData.append("file", coverFile);
formData.append("type", "comic-cover");
formData.append("entityId", "comic-123");

// Server-side (ImageKit Service)
const result = await uploadComicCover(buffer, comicId, fileName);
```

**Folder Structure**: `/comicwise/comics/covers/`

**Tags**: `["comic-cover", "comic-{comicId}"]`

### 2. Chapter Image Upload

Uploads content images for chapters.

```typescript
// API Request
const formData = new FormData();
formData.append("file", imageFile);
formData.append("type", "chapter-image");
formData.append("entityId", "chapter-456");
formData.append("sequence", "1");

// Server-side (ImageKit Service)
const result = await uploadChapterImage(buffer, chapterId, fileName, sequence);
```

**Folder Structure**: `/comicwise/chapters/images/`

**Tags**: `["chapter-image", "chapter-{chapterId}"]`

### 3. Avatar Upload

Uploads user profile avatars.

```typescript
// API Request
const formData = new FormData();
formData.append("file", avatarFile);
formData.append("type", "avatar");

// Server-side (ImageKit Service)
const result = await uploadAvatar(buffer, userId, fileName);
```

**Folder Structure**: `/comicwise/avatars/`

**Tags**: `["avatar", "user-{userId}"]`

### 4. General Upload

Uploads general-purpose images.

```typescript
// API Request
const formData = new FormData();
formData.append("file", imageFile);
formData.append("type", "general");

// Server-side (ImageKit Service)
const result = await uploadImage({
  file: buffer,
  fileName,
  folder: "/comicwise/general",
  tags: ["general"],
});
```

**Folder Structure**: `/comicwise/general/`

---

## Image Optimization

### Optimized URLs

Generate optimized image URLs with transformations:

```typescript
import { getOptimizedUrl } from "@/lib/imagekit";

// Basic optimization
const optimized = getOptimizedUrl(originalUrl, {
  width: 800,
  height: 600,
  quality: 80,
  format: "webp",
});

// With blur effect
const blurred = getOptimizedUrl(originalUrl, {
  width: 400,
  blur: 10,
});
```

### Thumbnail Generation

Generate thumbnail URLs:

```typescript
import { getThumbnailUrl } from "@/lib/imagekit";

const thumbnail = getThumbnailUrl(originalUrl, "medium");
// Sizes: "small" (200x300), "medium" (400x600), "large" (800x1200)
```

### Responsive Images

Generate responsive image sets:

```typescript
import { getResponsiveUrls } from "@/lib/imagekit";

const responsiveUrls = getResponsiveUrls(originalUrl);

// Returns:
// {
//   thumbnail: "...tr:w-200,h-300...",
//   small: "...tr:w-400,h-600...",
//   medium: "...tr:w-800,h-1200...",
//   large: "...tr:w-1200,h-1800...",
//   original: "..."
// }
```

### HTML Implementation

```tsx
<img
  src={responsiveUrls.medium}
  srcSet={`
    ${responsiveUrls.small} 400w,
    ${responsiveUrls.medium} 800w,
    ${responsiveUrls.large} 1200w
  `}
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  alt="Comic cover"
/>
```

---

## Security

### Authentication

All upload endpoints require authentication:

```typescript
const session = await auth();

if (!session?.user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### File Validation

Files are validated on both client and server:

```typescript
// Client-side validation
const maxSize = 10 * 1024 * 1024; // 10MB
const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Server-side validation
const validation = validateImageFile(file);
if (!validation.valid) {
  return NextResponse.json({ error: validation.error }, { status: 400 });
}
```

### Rate Limiting

Consider implementing rate limiting for upload endpoints:

```typescript
// Example with upstash/ratelimit
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 uploads per hour
});

const { success } = await ratelimit.limit(`upload_${session.user.id}`);
if (!success) {
  return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
}
```

### File Size Limits

Maximum file size: **10MB**

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_FILE_SIZE) {
  throw new Error("File too large. Maximum size is 10MB");
}
```

### Allowed File Types

- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

---

## Error Handling

### Client-Side Error Handling

```typescript
try {
  const result = await uploadImage(file, "comic-cover");
  console.log("Upload successful:", result.url);
} catch (error) {
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes("too large")) {
      alert("File is too large. Please choose a smaller image.");
    } else if (error.message.includes("Invalid file type")) {
      alert("Please upload a valid image file (JPEG, PNG, GIF, or WebP).");
    } else {
      alert("Upload failed. Please try again.");
    }
  }
}
```

### Server-Side Error Handling

All ImageKit service functions return a result object:

```typescript
interface UploadResult {
  success: boolean;
  url?: string;
  fileId?: string;
  name?: string;
  size?: number;
  thumbnailUrl?: string;
  error?: string;
}

// Usage
const result = await uploadComicCover(buffer, comicId, fileName);

if (!result.success) {
  console.error("Upload failed:", result.error);
  return NextResponse.json(
    { error: "Upload failed", details: result.error },
    { status: 500 }
  );
}
```

### Common Errors

| Error                     | Cause                         | Solution                                 |
| ------------------------- | ----------------------------- | ---------------------------------------- |
| "No file provided"        | Missing file in FormData      | Ensure file is appended to FormData      |
| "Invalid file type"       | Unsupported file format       | Only use JPEG, PNG, GIF, or WebP         |
| "File too large"          | File exceeds 10MB             | Compress image before upload             |
| "Unauthorized"            | No active session             | Ensure user is logged in                 |
| "ImageKit not configured" | Missing environment variables | Add ImageKit credentials to `.env.local` |
| "Upload failed"           | ImageKit API error            | Check ImageKit dashboard and API logs    |

---

## Best Practices

### 1. Image Optimization

Always optimize images before uploading:

```bash
# Using ImageMagick
magick convert input.jpg -quality 85 -strip output.jpg

# Using Sharp (Node.js)
npm install sharp
```

```typescript
import sharp from "sharp";

const optimizedBuffer = await sharp(inputBuffer)
  .resize(1200, 1800, { fit: "inside" })
  .webp({ quality: 85 })
  .toBuffer();
```

### 2. Progressive Loading

Use blur placeholders for better UX:

```typescript
const blurDataUrl = getOptimizedUrl(imageUrl, {
  width: 20,
  blur: 10,
  quality: 30,
});

<Image
  src={imageUrl}
  placeholder="blur"
  blurDataURL={blurDataUrl}
  alt="Comic cover"
/>
```

### 3. Lazy Loading

Implement lazy loading for better performance:

```tsx
<img src={imageUrl} loading="lazy" alt="Chapter image" />
```

### 4. Error Boundaries

Wrap upload components in error boundaries:

```tsx
<ErrorBoundary fallback={<div>Upload failed</div>}>
  <ImageUploader />
</ErrorBoundary>
```

### 5. Progress Indicators

Show upload progress to users:

```typescript
const xhr = new XMLHttpRequest();

xhr.upload.addEventListener("progress", (e) => {
  if (e.lengthComputable) {
    const percentComplete = (e.loaded / e.total) * 100;
    setProgress(percentComplete);
  }
});

xhr.open("POST", "/api/upload");
xhr.send(formData);
```

### 6. Batch Uploads

For multiple images, use batch upload:

```typescript
import { uploadMultipleImages } from "@/lib/imagekit";

const files = [
  { file: buffer1, fileName: "image1.jpg", folder: "/chapter-1" },
  { file: buffer2, fileName: "image2.jpg", folder: "/chapter-1" },
  { file: buffer3, fileName: "image3.jpg", folder: "/chapter-1" },
];

const results = await uploadMultipleImages(files);
const successful = results.filter((r) => r.success);
const failed = results.filter((r) => !r.success);
```

### 7. Cleanup Old Images

Delete unused images to save storage:

```typescript
import { deleteImage } from "@/lib/imagekit";

// When deleting a comic
const result = await deleteImage(oldCoverImageId);
if (result.success) {
  console.log("Old cover image deleted");
}
```

---

## Troubleshooting

### Issue: "ImageKit not configured" Error

**Cause**: Missing environment variables

**Solution**:

1. Check `.env.local` for required variables
2. Ensure variables are set correctly:
   ```env
   IMAGEKIT_PUBLIC_KEY=your_key
   IMAGEKIT_PRIVATE_KEY=your_key
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
   ```
3. Restart development server after changing env variables

### Issue: Upload Returns 401 Unauthorized

**Cause**: No active session or expired token

**Solution**:

1. Verify user is logged in
2. Check session middleware configuration
3. Ensure `auth()` is properly configured

### Issue: Upload Fails with 500 Error

**Cause**: ImageKit API error

**Solution**:

1. Check ImageKit dashboard for API limits
2. Verify API credentials are correct
3. Check server logs for detailed error message
4. Ensure ImageKit account is active

### Issue: Images Not Loading

**Cause**: Incorrect URL or missing permissions

**Solution**:

1. Verify URL endpoint in configuration
2. Check ImageKit dashboard for file existence
3. Ensure URL endpoint matches your ImageKit account
4. Check browser console for CORS errors

### Issue: Large File Upload Fails

**Cause**: File exceeds size limit or timeout

**Solution**:

1. Compress image before upload
2. Use WebP format for smaller file sizes
3. Increase Next.js body size limit:
   ```typescript
   // next.config.ts
   export default {
     api: {
       bodyParser: {
         sizeLimit: "10mb",
       },
     },
   };
   ```

### Issue: Slow Upload Performance

**Cause**: Large file size or network issues

**Solution**:

1. Optimize images before upload
2. Use WebP format
3. Implement chunked uploads for large files
4. Show progress indicator to improve UX

---

## Additional Resources

- [ImageKit Documentation](https://docs.imagekit.io/)
- [ImageKit Node.js SDK](https://github.com/imagekit-developer/imagekit-nodejs)
- [Next.js File Upload Guide](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#formdata)
- [Web Performance - Image Optimization](https://web.dev/fast/#optimize-your-images)

---

## Support

For issues or questions:

- Check the troubleshooting section above
- Review ImageKit documentation
- Check server logs for detailed error messages
- Contact support team

---

**Last Updated**: 2024 **Version**: 1.0.0
