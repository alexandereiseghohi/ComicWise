# Production Validation Checklist

Complete pre-deployment validation checklist for ComicWise.

## Quick Reference

✅ = Completed ⚠️ = Needs attention ❌ = Not configured 📝 = Optional

---

## 1. Environment Configuration

### Production Environment Variables

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `DIRECT_URL` - Direct PostgreSQL connection (non-pooled)
- [ ] `AUTH_SECRET` - NextAuth secret (32+ characters)
- [ ] `NEXTAUTH_URL` - Production URL
- [ ] `NEXT_PUBLIC_APP_URL` - Public application URL

### CDN Configuration

- [ ] `IMAGE_UPLOAD_PROVIDER` - Selected provider
- [ ] ImageKit/Cloudinary/S3 credentials configured
- [ ] CDN upload tested
- [ ] Image transformations working

### Email Configuration

- [ ] `SMTP_HOST` - Email server host
- [ ] `SMTP_PORT` - Email server port
- [ ] `SMTP_USER` - SMTP username
- [ ] `SMTP_PASSWORD` - SMTP password
- [ ] Email templates tested

### Redis Configuration

- [ ] `UPSTASH_REDIS_REST_URL` - Redis connection
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Redis auth token
- [ ] Rate limiting tested
- [ ] Cache working

### Monitoring

- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN configured
- [ ] Source maps uploading
- [ ] Error tracking verified
- [ ] Performance monitoring enabled

---

## 2. Database

### Schema

- [ ] All migrations applied
- [ ] Schema matches production structure
- [ ] Indexes created on frequently queried columns
- [ ] Foreign key constraints configured
- [ ] Cascade delete rules verified

### Backups

- [ ] Automated backup script configured
- [ ] Backup schedule set (daily recommended)
- [ ] Backup retention policy defined (30 days)
- [ ] Restore procedure tested
- [ ] S3 backup upload configured (optional)

### Performance

- [ ] Connection pooling enabled
- [ ] Query performance tested
- [ ] Slow query logging enabled
- [ ] Database size monitored

---

## 3. Security

### Authentication

- [ ] NextAuth configured properly
- [ ] Session timeout appropriate (7 days default)
- [ ] Password hashing using bcrypt
- [ ] Email verification enabled
- [ ] OAuth providers tested (if applicable)

### API Security

- [ ] Rate limiting active on all endpoints
- [ ] CORS configured correctly
- [ ] Input validation on all routes
- [ ] SQL injection prevention (using Drizzle ORM)
- [ ] XSS prevention (React escaping)

### Sensitive Data

- [ ] No secrets in client-side code
- [ ] Environment variables not committed
- [ ] Database credentials secured
- [ ] API keys rotated
- [ ] .env files in .gitignore

---

## 4. Performance

### Build Optimization

- [ ] Production build completed without errors
- [ ] Bundle size analyzed
- [ ] Code splitting implemented
- [ ] Tree shaking verified
- [ ] Unused dependencies removed

### Image Optimization

- [ ] Next.js Image component used
- [ ] Images served from CDN
- [ ] Lazy loading implemented
- [ ] WebP format enabled
- [ ] Responsive images configured

### Caching

- [ ] Redis caching configured
- [ ] Static pages cached
- [ ] API responses cached where appropriate
- [ ] CDN caching headers set
- [ ] Cache invalidation working

### Code Quality

- [ ] TypeScript strict mode enabled
- [ ] No TypeScript errors
- [ ] ESLint passing
- [ ] No console.logs in production code
- [ ] Proper error boundaries implemented

---

## 5. Testing

### Unit Tests

- [ ] Server actions tested
- [ ] Database mutations tested
- [ ] Utility functions tested
- [ ] Rate limiting tested
- [ ] Test coverage > 60%

### Integration Tests

- [ ] API routes tested
- [ ] Authentication flow tested
- [ ] Upload functionality tested
- [ ] Email sending tested

### E2E Tests

- [ ] User signup/login flow
- [ ] Comic browsing
- [ ] Chapter reading
- [ ] Bookmark functionality
- [ ] Comment posting

---

## 6. Deployment

### Vercel Configuration

- [ ] Project connected to GitHub
- [ ] Environment variables set
- [ ] Build settings configured
- [ ] Custom domain connected (if applicable)
- [ ] Preview deployments enabled

### CI/CD

- [ ] GitHub Actions workflows configured
- [ ] Automated tests running
- [ ] Build verification on PR
- [ ] Deployment on merge to main
- [ ] Rollback procedure documented

### Monitoring

- [ ] Sentry error tracking active
- [ ] Performance metrics tracked
- [ ] Uptime monitoring configured
- [ ] Alert notifications set up
- [ ] Dashboard access configured

---

## 7. Content & Data

### Database Seeding

- [ ] Production seed data prepared
- [ ] Test data removed
- [ ] Initial comics/chapters ready
- [ ] User roles configured
- [ ] Demo accounts created (if needed)

### File Uploads

- [ ] Upload directory permissions set
- [ ] File size limits configured (5MB avatars)
- [ ] File type validation implemented
- [ ] Malware scanning considered
- [ ] CDN storage tested

---

## 8. User Experience

### Accessibility

- [ ] Keyboard navigation working
- [ ] Screen reader compatible
- [ ] Color contrast adequate (WCAG AA)
- [ ] Alt text on images
- [ ] Form labels present

### Performance

- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Mobile responsive
- [ ] Touch-friendly UI
- [ ] Offline page configured

### SEO

- [ ] Meta tags configured
- [ ] Open Graph tags present
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Structured data added

---

## 9. Documentation

### Code Documentation

- [ ] README.md complete
- [ ] API documentation available
- [ ] Setup instructions clear
- [ ] Environment variables documented
- [ ] Architecture documented

### Operational Docs

- [ ] Deployment guide created
- [ ] Backup/restore procedures documented
- [ ] Troubleshooting guide available
- [ ] Monitoring setup documented
- [ ] Incident response plan

---

## 10. Legal & Compliance

### Privacy

- [ ] Privacy policy created
- [ ] Cookie consent implemented (if needed)
- [ ] Data deletion procedure
- [ ] GDPR compliance reviewed
- [ ] Terms of service available

### Security

- [ ] Security audit completed
- [ ] Dependency vulnerabilities checked
- [ ] SSL certificate active
- [ ] Security headers configured
- [ ] Rate limiting active

---

## Validation Commands

Run these commands to verify production readiness:

```bash
# 1. Type check
pnpm run type-check

# 2. Lint check
pnpm run lint:strict

# 3. Run tests
pnpm run test

# 4. Build check
pnpm run build

# 5. Database check
pnpm run db:check

# 6. Security audit
pnpm audit

# 7. Bundle analysis
pnpm run build:analyze
```

---

## Pre-Deployment Checklist

Run these final checks before deploying:

```bash
# 1. Ensure all environment variables are set
cat .env.production.template

# 2. Test database connection
pnpm run db:studio

# 3. Run full test suite
pnpm run ci:full

# 4. Create database backup
pnpm run db:backup --upload

# 5. Verify CDN upload
# Test avatar upload in staging

# 6. Check error tracking
# Trigger test error in Sentry

# 7. Verify email sending
# Send test email

# 8. Test rate limiting
# Make rapid API requests

# 9. Review deployment logs
# Check Vercel deployment logs

# 10. Monitor first hour
# Watch Sentry for errors
# Check performance metrics
```

---

## Post-Deployment Checklist

After deployment, verify:

- [ ] Application accessible at production URL
- [ ] Database connected successfully
- [ ] Authentication working
- [ ] File uploads functioning
- [ ] Email notifications sending
- [ ] Rate limiting active
- [ ] Error tracking operational
- [ ] Performance metrics normal
- [ ] No console errors in browser
- [ ] Mobile experience acceptable

---

## Rollback Procedure

If critical issues occur:

1. **Immediate:** Revert to previous Vercel deployment
2. **Database:** Restore from latest backup if needed
3. **Monitoring:** Check Sentry for error patterns
4. **Communication:** Notify team and users if necessary
5. **Post-mortem:** Document issue and prevention steps

---

## Support Contacts

- **Hosting:** Vercel Support
- **Database:** Neon/Supabase Support
- **CDN:** ImageKit/Cloudinary Support
- **Monitoring:** Sentry Support
- **Email:** SMTP Provider Support

---

## Maintenance Schedule

### Daily

- Monitor error rates
- Check application uptime
- Review performance metrics

### Weekly

- Review security alerts
- Check backup status
- Update dependencies (if needed)

### Monthly

- Full security audit
- Performance optimization review
- Backup restoration test
- Documentation updates

---

## Production Deployment Command

```bash
# Deploy to production
git checkout main
git pull origin main
pnpm run build
vercel --prod

# Or automatic deployment via GitHub
git push origin main
```

---

## Emergency Contacts

- **On-call Engineer:** [Contact Info]
- **Database Admin:** [Contact Info]
- **Security Team:** [Contact Info]
- **DevOps Lead:** [Contact Info]

---

## Revision History

- v1.0 - 2024-01-15 - Initial production checklist
- v1.1 - 2024-01-16 - Added monitoring section
- v1.2 - 2024-01-17 - Added rollback procedure

---

**Remember:** Production deployment is irreversible. Take time to review each
item carefully.

**Last Updated:** January 2024 **Next Review:** Monthly
