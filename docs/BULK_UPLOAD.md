# Bulk Image Upload Tool

## Overview

Upload all local images from your `public` directory to configured cloud storage
providers (ImageKit, Cloudinary, AWS S3) in one command.

## Features

- ✅ **Multi-Provider Support**: Upload to ImageKit, Cloudinary, and AWS S3
- ✅ **Selective Upload**: Choose specific providers or directories
- ✅ **Dry Run Mode**: Preview uploads without actually uploading
- ✅ **Progress Tracking**: See detailed progress and results
- ✅ **Error Handling**: Graceful error handling with detailed summaries
- ✅ **Rate Limiting**: Built-in delays to avoid API limits
- ✅ **Folder Structure**: Maintains directory structure in cloud storage

## Installation

The script is already included in your project. Just ensure you have the
required dependencies:

```bash
pnpm install @aws-sdk/client-s3
```

## Setup

### 1. Configure Environment Variables

Add credentials for the providers you want to use in `.env.local`:

```bash
# ImageKit (https://imagekit.io/dashboard)
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Cloudinary (https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AWS S3 (https://console.aws.amazon.com/)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name
```

### 2. Verify Configuration

Run a dry run to verify your setup:

```bash
pnpm upload:bulk:dry-run
```

## Usage

### Basic Commands

```bash
# Upload to all configured providers
pnpm upload:bulk

# Preview uploads without actually uploading
pnpm upload:bulk:dry-run

# Upload only to ImageKit
pnpm upload:bulk:imagekit

# Upload only to Cloudinary
pnpm upload:bulk:cloudinary

# Upload only to AWS S3
pnpm upload:bulk:aws

# Upload specific directory (e.g., comics folder)
pnpm upload:comics
```

### Advanced Usage

```bash
# Custom directory
pnpm tsx --env-file=.env.local scripts/upload-bulk.ts --path=public/custom

# Specific provider with custom path
pnpm tsx --env-file=.env.local scripts/upload-bulk.ts --provider=imagekit --path=public/comics

# Dry run for specific provider
pnpm tsx --env-file=.env.local scripts/upload-bulk.ts --provider=cloudinary --dry-run
```

## CLI Options

| Option               | Description                                                          | Default  |
| -------------------- | -------------------------------------------------------------------- | -------- |
| `--provider=<name>`  | Upload to specific provider (`imagekit`, `cloudinary`, `aws`, `all`) | `all`    |
| `--path=<directory>` | Upload from specific directory                                       | `public` |
| `--dry-run`          | Preview uploads without actually uploading                           | `false`  |
| `--verbose`          | Show detailed output                                                 | `false`  |
| `--help`, `-h`       | Show help message                                                    | -        |

## Examples

### 1. Upload All Public Images to All Providers

```bash
pnpm upload:bulk
```

Output:

```
════════════════════════════════════════════════════════════
  📦 Bulk Image Upload Tool
════════════════════════════════════════════════════════════

🔧 Initializing providers...

✅ ImageKit initialized
✅ Cloudinary initialized
✅ AWS S3 initialized

📦 3 provider(s) ready

📂 Scanning: public

📊 Found 15 image file(s)

[1/15]

📤 Uploading: placeholder-comic.jpg (45.23 KB)
   → imagekit...
   ✅ imagekit: https://ik.imagekit.io/...
   → cloudinary...
   ✅ cloudinary: https://res.cloudinary.com/...
   → aws...
   ✅ aws: https://bucket.s3.region.amazonaws.com/...

...

════════════════════════════════════════════════════════════
  📊 Upload Summary
════════════════════════════════════════════════════════════

IMAGEKIT:
  ✅ Success: 15
  ❌ Failed:  0
  📦 Size:    2.34 MB

CLOUDINARY:
  ✅ Success: 15
  ❌ Failed:  0
  📦 Size:    2.34 MB

AWS:
  ✅ Success: 15
  ❌ Failed:  0
  📦 Size:    2.34 MB

TOTAL:
  ✅ Success: 45
  ❌ Failed:  0
  📦 Size:    7.02 MB
  ⏱️  Time:    12.45s

════════════════════════════════════════════════════════════
```

### 2. Dry Run (Preview)

```bash
pnpm upload:bulk:dry-run
```

Shows what would be uploaded without actually uploading.

### 3. Upload Only Comics to ImageKit

```bash
pnpm tsx --env-file=.env.local scripts/upload-bulk.ts --provider=imagekit --path=public/comics
```

### 4. Backup All Images to AWS S3

```bash
pnpm upload:bulk:aws
```

## Supported File Formats

- `.jpg`, `.jpeg` - JPEG images
- `.png` - PNG images
- `.gif` - GIF images
- `.webp` - WebP images
- `.svg` - SVG vector graphics
- `.avif` - AVIF images

## How It Works

1. **Initialization**: Script loads credentials from `.env.local` and
   initializes provider clients
2. **Scanning**: Recursively scans the specified directory for supported image
   files
3. **Upload**: Uploads each file to all configured providers with:
   - Rate limiting (200ms between providers, 500ms between files)
   - Error handling and retries
   - Folder structure preservation
4. **Reporting**: Provides detailed summary of successes and failures

## Directory Structure

The script maintains your directory structure in cloud storage:

```
Local:                          Cloud:
public/                         uploads/
  ├── comics/                   ├── comics/
  │   ├── comic1/               │   ├── comic1/
  │   │   └── cover.jpg         │   │   └── cover.jpg
  │   └── comic2/               │   └── comic2/
  │       └── cover.jpg         │       └── cover.jpg
  └── placeholder.jpg           └── placeholder.jpg
```

## Rate Limiting

Built-in delays to avoid hitting API limits:

- **Between providers**: 200ms delay
- **Between files**: 500ms delay
- **Retries**: Automatic retry with exponential backoff (if provider supports
  it)

## Error Handling

### Common Errors

1. **Missing Credentials**

   ```
   ⚠️  ImageKit credentials missing - skipping
   ```

   **Solution**: Add credentials to `.env.local`

2. **File Too Large**

   ```
   ❌ File too large: 30.5MB (max 25MB)
   ```

   **Solution**: Reduce file size or use AWS S3 (5GB limit)

3. **Network Error**

   ```
   ❌ Network connection failed
   ```

   **Solution**: Check internet connection and retry

4. **Invalid Credentials**
   ```
   ❌ Authentication failed - check API keys
   ```
   **Solution**: Verify credentials in `.env.local`

### Handling Failed Uploads

Failed uploads are listed at the end:

```
❌ Failed Uploads:

  comics/large-file.jpg (imagekit): File too large
  placeholder.gif (cloudinary): Network timeout
```

You can retry failed uploads by running the command again (successfully uploaded
files are skipped due to caching).

## Provider-Specific Notes

### ImageKit

- **Free Tier**: 20GB bandwidth/month
- **File Limit**: 25MB per file
- **Features**: Auto optimization, transformations
- **Best For**: Fast CDN delivery

### Cloudinary

- **Free Tier**: 25GB storage, 25GB bandwidth/month
- **File Limit**: 100MB per file (free tier)
- **Features**: Advanced transformations, video support
- **Best For**: Rich media processing

### AWS S3

- **Pricing**: Pay-as-you-go (~$0.023/GB/month storage)
- **File Limit**: 5GB per upload (5TB with multipart)
- **Features**: High durability, integration with AWS services
- **Best For**: Large-scale storage, enterprise use

## Security Considerations

⚠️ **Never commit `.env.local` to version control** - it contains sensitive
credentials.

✅ **Best Practices**:

- Use IAM roles with minimal permissions for AWS
- Rotate API keys regularly
- Use separate credentials for development and production
- Enable bucket policies/CORS as needed

## Troubleshooting

### Script Won't Run

```bash
# Ensure tsx is installed
pnpm install -D tsx

# Verify .env.local exists and has credentials
cat .env.local
```

### No Files Found

```bash
# Check if files exist
ls -la public/

# Verify file extensions are supported
file public/image.jpg
```

### Slow Upload Speed

- Normal for large files or many images
- Network speed affects upload time
- Rate limiting adds delays (by design)

### Memory Issues

For very large batches:

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm upload:bulk
```

## Integration with Seeding

To automatically upload images during database seeding, the image service
already uses these providers. The bulk upload tool is for **existing files** in
`public/` that weren't uploaded during seeding.

## Performance Tips

1. **Upload to one provider first** - Test with one provider before uploading to
   all
2. **Use dry run** - Always preview before bulk uploads
3. **Upload during off-peak hours** - Some providers have rate limits
4. **Compress images first** - Use tools like `sharp` to optimize before upload

## Monitoring

Monitor your provider dashboards for:

- Storage usage
- Bandwidth consumption
- API request counts
- Costs (for paid tiers)

## Related Scripts

- `pnpm db:seed` - Seed database with comics and chapters (includes image
  upload)
- `pnpm db:seed --skip-images` - Seed without images
- Image service (`src/services/image.service.ts`) - Used by seeder

## Support

For issues:

1. Check provider status pages
2. Verify credentials in `.env.local`
3. Review error messages in output
4. Run with `--verbose` for detailed logs

---

**Note**: The first run may take longer as images are uploaded. Subsequent runs
will be faster due to caching.
