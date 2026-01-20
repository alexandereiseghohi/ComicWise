# CDN Configuration Guide

Complete guide for configuring and using the multi-provider CDN system in
ComicWise.

## Table of Contents

- [Overview](#overview)
- [Supported Providers](#supported-providers)
- [Configuration](#configuration)
  - [ImageKit](#imagekit)
  - [Cloudinary](#cloudinary)
  - [AWS S3](#aws-s3)
  - [Local Storage](#local-storage)
- [Environment Variables](#environment-variables)
- [Implementation](#implementation)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

ComicWise supports multiple CDN providers for image storage and delivery:

- **ImageKit** - Recommended (free tier: 20GB bandwidth/month)
- **Cloudinary** - Alternative (free tier: 25GB bandwidth/month)
- **AWS S3** - Enterprise solution (pay-as-you-go)
- **Local Storage** - Development only (not recommended for production)

The system automatically selects the configured provider based on environment
variables.

## Supported Providers

### ImageKit (Recommended)

**Pros:**

- Real-time image transformation
- Built-in CDN with global delivery
- Generous free tier
- Simple integration
- Automatic format optimization (WebP, AVIF)

**Cons:**

- Requires API authentication
- Limited to image/video files

**Pricing:**

- Free: 20GB bandwidth, 20GB storage, unlimited transformations
- Pro: $49/month for 60GB bandwidth
- [Pricing details](https://imagekit.io/pricing)

### Cloudinary

**Pros:**

- Comprehensive media management
- Advanced image transformations
- Video support with streaming
- Large free tier

**Cons:**

- More complex configuration
- Slower than ImageKit in some regions

**Pricing:**

- Free: 25GB bandwidth, 25 credits/month
- Plus: $89/month for 100GB bandwidth
- [Pricing details](https://cloudinary.com/pricing)

### AWS S3

**Pros:**

- Unlimited scalability
- Integration with AWS ecosystem
- Fine-grained access control
- High reliability (99.999999999%)

**Cons:**

- Requires AWS account setup
- More expensive for small projects
- Needs CloudFront for CDN

**Pricing:**

- $0.023 per GB stored
- $0.09 per GB transferred
- [Pricing details](https://aws.amazon.com/s3/pricing/)

### Local Storage

**Pros:**

- No external dependencies
- Free
- Fast in development

**Cons:**

- Not scalable
- No CDN
- No redundancy
- **NEVER use in production**

## Configuration

### ImageKit

1. **Create Account:**

   ```
   https://imagekit.io/registration/
   ```

2. **Get Credentials:**
   - Go to Developer Options → API Keys
   - Copy:
     - Public Key
     - Private Key
     - URL Endpoint

3. **Set Environment Variables:**

   ```bash
   # Primary provider
   IMAGE_UPLOAD_PROVIDER=imagekit

   # ImageKit credentials
   IMAGEKIT_PUBLIC_KEY=public_xxx
   IMAGEKIT_PRIVATE_KEY=private_xxx
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
   ```

4. **Configure Upload Folder Structure:**

   ```javascript
   // Folders are automatically created:
   // - /avatars/ - User profile images
   // - /comics/ - Comic cover images
   // - /chapters/ - Chapter page images
   ```

5. **Enable Real-time Transformations:**
   - Dashboard → Settings → Image Settings
   - Enable: Auto format conversion, Quality optimization
   - Set default format: Auto (WebP/AVIF)

### Cloudinary

1. **Create Account:**

   ```
   https://cloudinary.com/users/register/free
   ```

2. **Get Credentials:**
   - Dashboard → Account Details
   - Copy:
     - Cloud Name
     - API Key
     - API Secret

3. **Set Environment Variables:**

   ```bash
   # Primary provider
   IMAGE_UPLOAD_PROVIDER=cloudinary

   # Cloudinary credentials
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abc123xyz
   ```

4. **Configure Upload Presets:**

   ```bash
   # Optional: Use upload presets for automatic transformations
   CLOUDINARY_UPLOAD_PRESET=comicwise_default
   ```

5. **Dashboard Settings:**
   - Media Library → Folders → Create: avatars, comics, chapters
   - Settings → Upload → Upload presets:
     - Name: comicwise_default
     - Mode: Unsigned (if using client uploads) or Signed
     - Format: Auto
     - Quality: Auto
     - Allowed formats: jpg, png, webp, gif

### AWS S3

1. **Create S3 Bucket:**

   ```bash
   # AWS CLI
   aws s3 mb s3://comicwise-media --region us-east-1
   ```

2. **Configure Bucket Permissions:**

   ```json
   {
     "Statement": [
       {
         "Sid": "PublicRead",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::comicwise-media/*"
       }
     ],
     "Version": "2012-10-17"
   }
   ```

3. **Create IAM User:**
   - IAM → Users → Add User
   - Permissions: AmazonS3FullAccess
   - Get Access Key ID and Secret Access Key

4. **Set Environment Variables:**

   ```bash
   # Primary provider
   IMAGE_UPLOAD_PROVIDER=s3

   # AWS S3 credentials
   AWS_S3_BUCKET_NAME=comicwise-media
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   ```

5. **Optional: Setup CloudFront CDN:**
   ```bash
   # CloudFront distribution domain
   AWS_CLOUDFRONT_DOMAIN=d1234.cloudfront.net
   ```

### Local Storage

1. **Set Environment Variable:**

   ```bash
   IMAGE_UPLOAD_PROVIDER=local
   ```

2. **Configure Upload Directory:**

   ```bash
   # Default: public/uploads
   LOCAL_UPLOAD_PATH=/public/uploads
   ```

3. **Ensure Directory Exists:**
   ```bash
   mkdir -p public/uploads/avatars
   mkdir -p public/uploads/comics
   mkdir -p public/uploads/chapters
   ```

## Environment Variables

### Production (.env.production)

```bash
# CDN Provider Selection
IMAGE_UPLOAD_PROVIDER=imagekit  # imagekit | cloudinary | s3 | local

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=public_xxx
IMAGEKIT_PRIVATE_KEY=private_xxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Cloudinary Configuration (Alternative)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abc123xyz
CLOUDINARY_UPLOAD_PRESET=comicwise_default

# AWS S3 Configuration (Alternative)
AWS_S3_BUCKET_NAME=comicwise-media
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_CLOUDFRONT_DOMAIN=d1234.cloudfront.net

# Local Storage (Development Only)
LOCAL_UPLOAD_PATH=/public/uploads
```

### Development (.env.local)

```bash
# Use local storage in development
IMAGE_UPLOAD_PROVIDER=local
LOCAL_UPLOAD_PATH=/public/uploads
```

## Implementation

### Upload Service

The upload service automatically detects the configured provider:

```typescript
// src/lib/uploadImage.ts
import { uploadImageToProvider } from "@/lib/uploadImage";

const result = await uploadImageToProvider(file, "avatars");

if (result.success) {
  console.log("Uploaded to:", result.url);
  console.log("Provider:", result.provider); // imagekit, cloudinary, s3, local
}
```

### Provider-Specific Code

```typescript
// ImageKit upload
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

const upload = await imagekit.upload({
  file: buffer,
  fileName: filename,
  folder: "/avatars",
});

// Cloudinary upload
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = await cloudinary.uploader.upload(file, {
  folder: "avatars",
  upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
});

// AWS S3 upload
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

await s3.send(
  new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: `avatars/${filename}`,
    Body: buffer,
    ContentType: mimeType,
  })
);
```

## Usage Examples

### Avatar Upload

```typescript
// src/lib/actions/avatar.ts
import { uploadImageToProvider } from "@/lib/uploadImage";

export async function uploadAvatar(formData: FormData) {
  const file = formData.get("avatar") as File;

  // Validate file
  if (!file || file.size > 5 * 1024 * 1024) {
    return { success: false, error: "Invalid file" };
  }

  // Upload to configured provider
  const result = await uploadImageToProvider(file, "avatars");

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Update user profile with new avatar URL
  await updateUserAvatar(userId, result.url);

  return { success: true, data: { url: result.url } };
}
```

### Comic Cover Upload

```typescript
// src/lib/actions/comics.ts
export async function uploadComicCover(formData: FormData) {
  const cover = formData.get("cover") as File;

  const result = await uploadImageToProvider(cover, "comics");

  return {
    success: result.success,
    data: result.success ? { coverUrl: result.url } : null,
    error: result.error,
  };
}
```

### Chapter Pages Upload

```typescript
// src/lib/actions/chapters.ts
export async function uploadChapterPages(formData: FormData) {
  const files = formData.getAll("pages") as File[];

  const uploads = await Promise.all(
    files.map((file, index) =>
      uploadImageToProvider(file, `chapters/chapter-${chapterId}`)
    )
  );

  const urls = uploads.filter((r) => r.success).map((r) => r.url);

  return { success: true, data: { pages: urls } };
}
```

## Best Practices

### 1. Image Optimization

```typescript
// Always compress images before upload
import sharp from "sharp";

const optimized = await sharp(buffer)
  .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
  .webp({ quality: 85 })
  .toBuffer();
```

### 2. File Validation

```typescript
// Validate file type and size
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error("Invalid file type");
}

if (file.size > MAX_SIZE) {
  throw new Error("File too large");
}
```

### 3. Error Handling

```typescript
// Always handle upload failures
try {
  const result = await uploadImageToProvider(file, "avatars");

  if (!result.success) {
    // Log error for debugging
    console.error("Upload failed:", result.error);

    // Return user-friendly message
    return { error: "Failed to upload image. Please try again." };
  }
} catch (error) {
  console.error("Unexpected upload error:", error);
  return { error: "An unexpected error occurred." };
}
```

### 4. Progress Tracking

```typescript
// Show upload progress to users
const [uploadProgress, setUploadProgress] = useState(0);

const upload = await uploadImageToProvider(file, "avatars", {
  onProgress: (progress) => setUploadProgress(progress),
});
```

### 5. Cleanup Old Images

```typescript
// Delete old avatars when uploading new ones
if (user.image) {
  await deleteImageFromProvider(user.image);
}

const newAvatar = await uploadImageToProvider(file, "avatars");
```

## Troubleshooting

### ImageKit Issues

**Problem:** "Invalid authentication credentials"

```bash
# Solution: Verify API keys
echo $IMAGEKIT_PUBLIC_KEY
echo $IMAGEKIT_PRIVATE_KEY
echo $IMAGEKIT_URL_ENDPOINT
```

**Problem:** "Folder not found"

```typescript
// Solution: Ensure folder exists (automatically created on first upload)
// Or create manually in ImageKit dashboard
```

### Cloudinary Issues

**Problem:** "Upload preset not found"

```bash
# Solution: Create upload preset in dashboard or remove preset requirement
CLOUDINARY_UPLOAD_PRESET=  # Leave empty for signed uploads
```

**Problem:** "Invalid cloud name"

```bash
# Solution: Double-check cloud name from dashboard
# It's the subdomain in cloudinary.com URLs
```

### AWS S3 Issues

**Problem:** "Access Denied"

```json
// Solution: Update bucket policy to allow public reads
{
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET/*"
    }
  ],
  "Version": "2012-10-17"
}
```

**Problem:** "Region mismatch"

```bash
# Solution: Ensure region matches bucket region
AWS_REGION=us-east-1  # Match your bucket's region
```

### Local Storage Issues

**Problem:** "ENOENT: no such file or directory"

```bash
# Solution: Create upload directories
mkdir -p public/uploads/{avatars,comics,chapters}
```

**Problem:** "Images not accessible"

```typescript
// Solution: Ensure Next.js serves static files
// Files in public/ are automatically served
// Access via: /uploads/avatars/image.jpg
```

## Migration Between Providers

### From Local to ImageKit

1. Upload existing files to ImageKit:

   ```bash
   pnpm run migrate:images --from=local --to=imagekit
   ```

2. Update database URLs:

   ```sql
   UPDATE users
   SET image = REPLACE(image, '/uploads/', 'https://ik.imagekit.io/your_id/');
   ```

3. Update environment:
   ```bash
   IMAGE_UPLOAD_PROVIDER=imagekit
   ```

### From Cloudinary to ImageKit

1. Download images from Cloudinary
2. Upload to ImageKit using bulk upload API
3. Update database URLs
4. Remove Cloudinary credentials

## Performance Optimization

### Enable Caching

```typescript
// Cache transformed images
const url = `${imagekit_url}/tr:w-400,h-400,fo-auto/${filename}`;
```

### Lazy Loading

```tsx
import Image from "next/image";

<Image src={avatarUrl} loading="lazy" width={200} height={200} alt="Avatar" />;
```

### Responsive Images

```tsx
// Serve different sizes based on viewport
<Image
  src={imageUrl}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  fill
  alt="Comic cover"
/>
```

## Security Considerations

1. **Never expose private keys in client code**
2. **Validate file types server-side**
3. **Implement rate limiting for uploads**
4. **Use signed URLs for sensitive content**
5. **Scan uploads for malware in production**

## Support

- ImageKit: https://help.imagekit.io/
- Cloudinary: https://support.cloudinary.com/
- AWS S3: https://aws.amazon.com/s3/faqs/
- ComicWise: Open an issue on GitHub
