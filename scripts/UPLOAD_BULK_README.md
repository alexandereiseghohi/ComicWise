# Bulk Image Upload Script - Quick Start

## What It Does

Uploads all images from `public/` (and subdirectories) to your configured cloud
storage providers in one command.

## Setup (2 minutes)

1. **Install AWS SDK** (only if using AWS S3):

   ```bash
   pnpm install @aws-sdk/client-s3
   ```

2. **Add credentials to `.env.local`**:

   ```bash
   # ImageKit
   IMAGEKIT_PUBLIC_KEY=your_key
   IMAGEKIT_PRIVATE_KEY=your_secret
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret

   # AWS S3
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_S3_BUCKET_NAME=your_bucket
   ```

## Usage

```bash
# Preview what will be uploaded (safe, no actual upload)
pnpm upload:bulk:dry-run

# Upload to all configured providers
pnpm upload:bulk

# Upload to specific provider
pnpm upload:bulk:imagekit
pnpm upload:bulk:cloudinary
pnpm upload:bulk:aws

# Upload specific directory
pnpm upload:comics  # uploads public/comics only
```

## Common Use Cases

### Backup to multiple providers

```bash
pnpm upload:bulk
```

### Move from local to cloud

```bash
pnpm upload:bulk:imagekit
```

### Test before uploading

```bash
pnpm upload:bulk:dry-run
```

## Output Example

```
📦 Bulk Image Upload Tool

🔧 Initializing providers...
✅ ImageKit initialized
✅ Cloudinary initialized

📂 Scanning: public
📊 Found 15 image file(s)

[1/15]
📤 Uploading: comics/hero/cover.jpg (125.5 KB)
   ✅ imagekit: https://ik.imagekit.io/...
   ✅ cloudinary: https://res.cloudinary.com/...

...

📊 Upload Summary
  ✅ Success: 30 uploads
  ❌ Failed:  0 uploads
  📦 Size:    4.5 MB
  ⏱️  Time:    8.2s
```

## Supported Formats

`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.avif`

## Features

- ✅ Maintains folder structure
- ✅ Rate limiting to avoid API limits
- ✅ Detailed progress and error reporting
- ✅ Dry run mode for testing
- ✅ Multi-provider support

## Troubleshooting

**"Provider credentials missing"** → Add credentials to `.env.local`

**"File too large"** → ImageKit: 25MB limit, Cloudinary: 100MB, AWS: 5GB

**"Network error"** → Check internet connection, retry

**Want more details?** → See `docs/BULK_UPLOAD.md` for full documentation

## Files

- **Script**: `scripts/upload-bulk.ts`
- **Docs**: `docs/BULK_UPLOAD.md`
- **Providers**: `src/services/upload/providers/`

---

**Quick Start**: `pnpm upload:bulk:dry-run` then `pnpm upload:bulk`
