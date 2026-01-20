# Database Backup & Recovery Strategy

## Overview

Comprehensive database backup and disaster recovery procedures for ComicWise
PostgreSQL database.

---

## Backup Strategy

### 1. Automated Daily Backups

**Schedule:** Every day at 2:00 AM UTC **Retention:** 30 days **Storage:** AWS
S3 (or equivalent)

#### Setup Automated Backup (Neon PostgreSQL)

Neon provides automatic backups. Configure via Neon Dashboard:

1. Navigate to your project settings
2. Enable "Point-in-Time Restore" (7-day retention)
3. Configure backup schedule
4. Set retention period

#### Manual Backup Script

Create `scripts/backup-database.ts`:

```typescript
import { exec } from "child_process";
import { env } from "@/appConfig";
import { promises as fs } from "fs";
import path from "path";

const BACKUP_DIR = path.join(process.cwd(), "backups");

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `comicwise-backup-${timestamp}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);

  // Ensure backup directory exists
  await fs.mkdir(BACKUP_DIR, { recursive: true });

  // Create backup using pg_dump
  const command = `pg_dump "${env.DATABASE_URL}" > ${filepath}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Backup failed:", error);
        reject(error);
      } else {
        console.log(`✅ Backup created: ${filename}`);
        resolve(filepath);
      }
    });
  });
}

backupDatabase().catch(console.error);
```

Add to `package.json`:

```json
{
  "scripts": {
    "db:backup": "tsx scripts/backup-database.ts"
  }
}
```

---

### 2. Pre-Migration Backups

**Always backup before running migrations:**

```bash
# Create backup
pnpm db:backup

# Run migration
pnpm db:push

# If migration fails, restore from backup
pnpm db:restore --file=backups/latest.sql
```

---

### 3. Manual On-Demand Backups

**Before major changes:**

```bash
# Create backup with custom name
pg_dump $DATABASE_URL > backups/pre-feature-x-$(date +%Y%m%d).sql

# Compress backup
gzip backups/pre-feature-x-*.sql
```

---

## Backup Storage

### Option 1: AWS S3 (Recommended for Production)

**Setup:**

```bash
# Install AWS CLI
npm install -g aws-cli

# Configure credentials
aws configure
```

**Upload Backup:**

```bash
# Upload to S3
aws s3 cp backups/backup-latest.sql s3://comicwise-backups/$(date +%Y/%m/%d)/

# With encryption
aws s3 cp backups/backup-latest.sql \
  s3://comicwise-backups/$(date +%Y/%m/%d)/ \
  --sse AES256
```

**Automated S3 Upload Script:**

```typescript
// scripts/upload-backup-to-s3.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync } from "fs";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

async function uploadBackup(filePath: string) {
  const fileContent = readFileSync(filePath);
  const key = `backups/${new Date().toISOString()}/backup.sql`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: "comicwise-backups",
      Key: key,
      Body: fileContent,
      ServerSideEncryption: "AES256",
    })
  );

  console.log(`✅ Uploaded to S3: ${key}`);
}
```

---

### Option 2: Vercel Blob Storage

```bash
# Install Vercel Blob
pnpm add @vercel/blob

# Upload backup
vercel blob upload backups/latest.sql
```

---

## Restoration Procedures

### 1. Full Database Restore

**⚠️ WARNING: This will delete all existing data**

```bash
# 1. Drop existing database (USE WITH CAUTION)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 2. Restore from backup
psql $DATABASE_URL < backups/backup-2026-01-20.sql

# 3. Verify restoration
psql $DATABASE_URL -c "SELECT COUNT(*) FROM user;"

# 4. Run migrations to bring schema up-to-date
pnpm db:push
```

---

### 2. Partial Table Restore

**Restore specific tables without affecting others:**

```bash
# Extract specific table from backup
pg_restore --table=user backups/backup.sql > user-table.sql

# Truncate existing table
psql $DATABASE_URL -c "TRUNCATE TABLE user CASCADE;"

# Import restored data
psql $DATABASE_URL < user-table.sql
```

---

### 3. Point-in-Time Recovery (Neon)

**Restore to specific timestamp:**

1. Go to Neon Dashboard > Project > Settings
2. Click "Point-in-Time Restore"
3. Select timestamp to restore to
4. Create new branch with restored data
5. Test in branch before merging

---

## Recovery Scripts

### Create Recovery Script

`scripts/restore-database.ts`:

```typescript
import { exec } from "child_process";
import { env } from "@/appConfig";
import { argv } from "process";

async function restoreDatabase(backupFile: string) {
  console.log(`🔄 Restoring database from: ${backupFile}`);

  // Confirmation prompt
  const confirm = await promptConfirmation(
    "⚠️  This will overwrite the current database. Continue? (yes/no): "
  );

  if (confirm !== "yes") {
    console.log("❌ Restoration cancelled");
    process.exit(0);
  }

  // Drop and recreate schema
  const dropCommand = `psql "${env.DATABASE_URL}" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`;

  await execCommand(dropCommand);
  console.log("✅ Schema dropped and recreated");

  // Restore from backup
  const restoreCommand = `psql "${env.DATABASE_URL}" < ${backupFile}`;
  await execCommand(restoreCommand);

  console.log("✅ Database restored successfully");
}

function execCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

const backupFile = argv[2];
if (!backupFile) {
  console.error("❌ Usage: pnpm db:restore <backup-file>");
  process.exit(1);
}

restoreDatabase(backupFile).catch(console.error);
```

Add to `package.json`:

```json
{
  "scripts": {
    "db:restore": "tsx scripts/restore-database.ts"
  }
}
```

---

## Disaster Recovery Plan

### Scenario 1: Data Corruption Detected

**Immediate Response:**

1. Stop all write operations (maintenance mode)
2. Identify last known good backup
3. Create backup of corrupted state (for analysis)
4. Restore from last good backup
5. Replay transactions if possible
6. Verify data integrity
7. Exit maintenance mode

**Commands:**

```bash
# 1. Backup corrupted state
pnpm db:backup

# 2. Restore from last good backup
pnpm db:restore backups/backup-good.sql

# 3. Verify
pnpm db:validate
```

---

### Scenario 2: Accidental Data Deletion

**Recovery:**

```bash
# 1. Use point-in-time restore (Neon)
# - Go to Neon Dashboard
# - Select timestamp before deletion
# - Create restore branch

# 2. Export deleted data
pg_dump --table=deleted_table restored_branch_url > deleted-data.sql

# 3. Import to production
psql $DATABASE_URL < deleted-data.sql
```

---

### Scenario 3: Failed Migration

**Rollback:**

```bash
# 1. Check migration status
pnpm db:migration:status

# 2. Rollback last migration
pnpm db:migration:rollback

# 3. If schema corrupted, restore from pre-migration backup
pnpm db:restore backups/pre-migration.sql

# 4. Fix migration file
# 5. Re-run migration
pnpm db:push
```

---

## Backup Verification

### Monthly Verification Schedule

**Test restoration quarterly:**

```bash
# 1. Create test database
createdb comicwise_test

# 2. Restore backup to test database
psql postgres://localhost/comicwise_test < backups/latest.sql

# 3. Verify data integrity
psql comicwise_test -c "SELECT COUNT(*) FROM user;"
psql comicwise_test -c "SELECT COUNT(*) FROM comic;"

# 4. Cleanup
dropdb comicwise_test
```

---

## Monitoring & Alerts

### Setup Backup Monitoring

**GitHub Action for backup verification:**

``yaml

# .github/workflows/verify-backups.yml

name: Verify Database Backups

on: schedule: - cron: '0 6 \* \* 1' # Every Monday at 6 AM

jobs: verify: runs-on: ubuntu-latest steps: - name: Download latest backup run:
aws s3 cp s3://comicwise-backups/latest.sql backup.sql

      - name: Verify backup integrity
        run: pg_restore --list backup.sql

      - name: Alert if failed
        if: failure()
        run: curl -X POST ${{ secrets.SLACK_WEBHOOK }} -d '{"text":"⚠️ Backup verification failed!"}'

```

---

## Best Practices

1. **3-2-1 Backup Rule:**
   - 3 copies of data
   - 2 different storage types
   - 1 off-site backup

2. **Encryption:**
   - Encrypt backups at rest (AES-256)
   - Encrypt backups in transit (TLS)

3. **Access Control:**
   - Limit access to production backups
   - Use IAM roles for S3 access
   - Audit backup access logs

4. **Testing:**
   - Test restoration quarterly
   - Document recovery procedures
   - Train team on recovery process

5. **Retention Policy:**
   - Daily: 30 days
   - Weekly: 12 weeks
   - Monthly: 12 months
   - Yearly: 7 years

---

## Emergency Contacts

**Database Issues:**
- Primary: DevOps Lead
- Secondary: Backend Lead
- Escalation: CTO

**Neon Support:**
- Dashboard: https://console.neon.tech
- Support Email: support@neon.tech
- Emergency: Contact via dashboard chat

---

## Recovery Time Objectives (RTO)

- **Critical Data Loss:** < 1 hour
- **Full Database Restore:** < 4 hours
- **Point-in-Time Restore:** < 30 minutes
- **Partial Table Restore:** < 1 hour

---

## Recovery Point Objectives (RPO)

- **Maximum Data Loss:** < 24 hours (daily backups)
- **Optimal:** < 15 minutes (with transaction logs)

---

**Last Updated:** January 20, 2026
**Version:** 1.0.0
```
