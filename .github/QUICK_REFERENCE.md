---
title: ComicWise - GitHub Copilot Prompts Quick Reference
version: 1.0.0
updated: 2026-01-22
---

# 🚀 ComicWise - GitHub Copilot Prompts Quick Reference

> **Quick reference guide for using GitHub Copilot prompts with ComicWise**

---

## 📋 Prompts Overview

| Prompt | Purpose | Time | Phase | Use When |
|--------|---------|------|-------|----------|
| **mainsetup.prompt.md** | Setup & Configuration | 4-6 hrs | Setup | First-time setup or re-configuration |
| **maintasks.prompt.md** | Feature Implementation | 2-3 wks | Implementation | After setup complete, for feature development |
| **.github/prompts/README.md** | Prompt Index & Guide | N/A | Reference | Need guidance on using prompts |
| **.github/README.md** | GitHub Workflows | N/A | Reference | GitHub Actions and workflows info |

---

## 🔧 Quick Start (5 Minutes)

### Step 1: Understand the Prompts

```markdown
📁 .github/prompts/
├── mainsetup.prompt.md    <- Use FIRST (Setup)
├── maintasks.prompt.md    <- Use SECOND (Implementation)
├── README.md              <- Reference guide
```

### Step 2: Choose Your Prompt

**Option A: First-time Setup**
→ Use `mainsetup.prompt.md`
- VS Code configuration
- Project configuration
- Environment variables
- Database seeding

**Option B: Feature Development**
→ Use `maintasks.prompt.md`
- Create pages
- Implement features
- Add tests
- Documentation

### Step 3: Copy Prompt

```bash
# Copy the entire content of chosen .prompt.md file
# Into GitHub Copilot Chat
```

### Step 4: Ask for Specific Task

```
"Complete Task 1: VS Code Configuration"
"Create user profile pages"
"Implement bookmark components"
```

---

## 🎯 Common Tasks

### Setting Up Development Environment

```bash
# Use mainsetup.prompt.md
# Tasks:
1. VS Code Configuration
2. Configuration Files Optimization
3. Environment Variables Setup
4. Database Seeding System
5. Validation & Testing

# Time: 4-6 hours
```

### Creating New Pages

```bash
# Use maintasks.prompt.md - Task 1-5
# Example: Create profile page

1. Create page file: src/app/(root)/profile/page.tsx
2. Create components: ProfileView, ProfileStats, etc.
3. Create server actions: getUserProfile, etc.
4. Create Zod schemas: ProfileSchema
5. Add tests for page and components
6. Update navigation links
7. Test in browser

# Time: 2-3 hours per page
```

### Implementing Database Seeding

```bash
# Use mainsetup.prompt.md - Task 4
# Creates complete seeding system:

1. Helper files (7 files)
2. Seeder files (7 files)
3. Orchestrator
4. API route
5. Package.json scripts

# Time: 4-6 hours
```

### Setting Up Testing

```bash
# Use maintasks.prompt.md - Task 12
# Creates:

1. Unit tests for components
2. Server action tests
3. E2E tests for user journeys
4. Coverage reports

# Time: 3-5 days for 80%+ coverage
```

### Configuring CI/CD

```bash
# Use maintasks.prompt.md - Task 13
# Creates GitHub Actions:

1. ci.yml - Continuous Integration
2. cd.yml - Continuous Deployment
3. migrations.yml - Database Migrations

# Time: 2-4 hours
```

---

## 🖥️ Using with GitHub Copilot

### Option 1: Copilot CLI

```bash
# Install Copilot CLI
npm install -g @github/copilot-cli

# Open Copilot
copilot-cli

# Reference prompt
@.github/prompts/mainsetup.prompt.md

# Ask for help
"Help me complete Task 1 from the prompt above"
```

### Option 2: VS Code Extension

1. Install GitHub Copilot extension
2. Press `Ctrl+Shift+I` (Windows) or `Cmd+Shift+I` (Mac)
3. Reference file: `#file:.github/prompts/mainsetup.prompt.md`
4. Ask: "Help with VS Code Configuration"

### Option 3: Web Interface

1. Visit [github.com/copilot](https://github.com/copilot)
2. Click "Ask Copilot"
3. Share prompt content
4. Ask for specific help

---

## ✅ Task Completion Checklist

### After Completing Mainsetup:

- [ ] VS Code configurations created (5 files)
- [ ] Configuration files optimized (9 files)
- [ ] Environment variables configured (.env.local, env.ts, appConfig.ts)
- [ ] Database seeding system working
  - [ ] Helper files created (7 files)
  - [ ] Seeder files created (7 files)
  - [ ] Orchestrator created
  - [ ] API route updated
  - [ ] Package.json scripts added
- [ ] `pnpm validate` passes
- [ ] `pnpm db:seed:dry-run` succeeds
- [ ] `pnpm db:seed` succeeds
- [ ] Database has seeded data
- [ ] Images downloaded successfully

### After Completing Maintasks:

- [ ] All pages created and working
  - [ ] Profile pages (4)
  - [ ] Comic pages (3)
  - [ ] Chapter reader page
  - [ ] Bookmarks page
  - [ ] Root pages (home, browse, genres)
- [ ] All server actions implemented
- [ ] All Zod schemas created
- [ ] All components created with proper types
- [ ] Unit tests passing (80%+ coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] GitHub Actions workflows created
- [ ] Documentation complete
  - [ ] README.md updated
  - [ ] API documentation
  - [ ] Setup guide
  - [ ] Deployment guide
- [ ] `pnpm validate` passes
- [ ] `pnpm build` succeeds
- [ ] `pnpm test` passes with 80%+ coverage
- [ ] Ready for production deployment

---

## 🔗 File Locations

```
Project Root
├── .github/
│   ├── prompts/
│   │   ├── README.md                  ← Guide to prompts
│   │   ├── mainsetup.prompt.md        ← Setup prompt
│   │   └── maintasks.prompt.md        ← Implementation prompt
│   ├── README.md                      ← GitHub workflows doc
│   ├── COPILOT_PROMPTS_SUMMARY.md    ← This file (summary)
│   ├── workflows/                     ← GitHub Actions
│   └── [other GitHub files]
├── src/
├── scripts/
├── docs/
└── [other project files]
```

---

## ❓ Common Questions

### Q: Which prompt should I start with?
**A:** Start with `mainsetup.prompt.md` if it's first-time setup. Otherwise use `maintasks.prompt.md`.

### Q: Can I do both prompts in parallel?
**A:** No, mainsetup must be completed first (it's a dependency for maintasks).

### Q: How do I track progress?
**A:** Use the completion checklists provided in each prompt. Mark items as you complete them.

### Q: What if I encounter an error?
**A:** 
1. Check the error message carefully
2. Review the related section in prompt
3. Consult troubleshooting guides
4. Ask Copilot: "Help me debug this error: [error message]"

### Q: Can I customize the prompts?
**A:** Yes! Update the `.prompt.md` files as your project evolves. Keep version numbers updated.

### Q: How often should I reference the prompts?
**A:** Throughout development. They serve as both guide and reference documentation.

### Q: Are these prompts for beginners?
**A:** They're designed for developers with Next.js experience. Requires understanding of:
- React/TypeScript basics
- Next.js fundamentals
- Database concepts
- Git/GitHub workflows

---

## 🎯 Workflow Recommendation

### Week 1: Setup Phase
```
Monday-Wednesday: Run mainsetup.prompt.md
├── VS Code Configuration (2 hours)
├── Configuration Files (2 hours)
├── Environment Setup (1 hour)
├── Database Seeding (3 hours)
└── Validation & Testing (2 hours)
```

### Week 2-4: Implementation Phase
```
Thursday-Friday of Week 1 onwards: Run maintasks.prompt.md
Week 2: Profile & Comic Pages
Week 3: Chapter Reader & Bookmarks + Server Actions
Week 4: Testing, CI/CD, Documentation
```

### Week 5: Polish & Deployment
```
Final validation, performance optimization, production deployment
```

---

## 📊 Estimated Effort

### By Role:

**Full-Stack Developer:**
- Mainsetup: 4-6 hours
- Maintasks: 2-3 weeks
- Total: 3-4 weeks

**Frontend-Only Developer:**
- Maintasks Tasks 1-5 (Pages): 2 weeks
- Maintasks Task 12 (Testing): 1 week
- Total: 3 weeks

**Backend Developer:**
- Mainsetup Task 4 (Seeding): 4-6 hours
- Maintasks Task 6 (Server Actions): 1 week
- Total: 8-9 days

---

## 🚀 Pro Tips

### 1. Copy Key Sections
```
If a section is very long, copy just the relevant task
Paste it into Copilot for focused help
```

### 2. Ask Detailed Questions
```
Instead of: "Create profile page"
Better: "Based on Task 1.1 in maintasks.prompt.md, 
         create the profile view page with ProfileView 
         and ProfileStats components"
```

### 3. Reference Related Files
```
When asking for help, mention existing similar files
"Like the admin/comics page, create a similar profile page"
```

### 4. Test Incrementally
```
Don't wait for entire task completion
Test and validate at each sub-task
Report issues immediately
```

### 5. Keep Documentation Updated
```
As you complete tasks, update relevant docs
Add code examples
Share learnings with team
```

---

## 🔐 Security Reminders

When following prompts:

✅ **Do:**
- Use environment variables for secrets
- Hash passwords with bcryptjs
- Validate all user input with Zod
- Use server actions for mutations
- Keep dependencies updated

❌ **Don't:**
- Commit .env.local to git
- Put API keys in code
- Use `any` types
- Skip input validation
- Ignore security warnings

---

## 📚 Related Documentation

Inside prompts:
- Setup instructions
- Configuration examples
- Code patterns
- Testing guides
- Deployment procedures

Outside prompts (in repository):
- `.github/README.md` - GitHub workflows
- `README.md` - Project overview
- `docs/setup.md` - Detailed setup guide
- `docs/architecture.md` - System architecture

---

## 🎓 Learning Path

### For New Team Members:

```
1. Read .github/prompts/README.md (10 min)
2. Understand project structure (20 min)
3. Review mainsetup.prompt.md overview (15 min)
4. Run setup steps with Copilot guidance (4-6 hours)
5. Review maintasks.prompt.md (15 min)
6. Complete first assigned task (2-3 hours)
7. Pair with senior dev on complex tasks
```

---

## 🆘 Getting Help

### Troubleshooting Steps:

1. **Check prompt guidance** - Most issues covered
2. **Search error message** - Check online docs
3. **Ask Copilot** - Provide context and error
4. **Check git history** - See how others solved it
5. **Ask team** - Share learnings

### Asking Copilot for Help:

```
"I'm following maintasks.prompt.md Task 1.1. 
 When I run `pnpm validate`, I get error: [error message]
 How can I fix this?"

"Based on the pattern in admin/comics/page.tsx,
 how would I create a similar profile page?"

"In mainsetup.prompt.md Task 4, where should 
 I place the image validation logic?"
```

---

## ✨ Best Practices

### When Using Prompts:

1. **Read fully first** - Understand overview before starting
2. **Follow order** - Don't skip tasks
3. **Validate frequently** - Test after major changes
4. **Document learning** - Note what you learned
5. **Share improvements** - Suggest prompt updates
6. **Ask questions** - Copilot is there to help
7. **Commit regularly** - Track progress in git
8. **Take breaks** - Complex tasks need rest

### When Completing Tasks:

1. **Understand why** - Don't just follow commands
2. **Review code** - Ensure it matches patterns
3. **Test thoroughly** - Run all validation
4. **Document changes** - Update relevant docs
5. **Get code review** - Have peer review changes
6. **Ask for feedback** - Learn from mistakes

---

## 🎉 Celebrating Progress

### Milestones to Celebrate:

- ✅ Mainsetup prompt completed (4-6 hours)
- ✅ First page created (2-3 hours)
- ✅ Database seeding working (3-4 hours)
- ✅ Tests reaching 80% coverage (multiple days)
- ✅ All pages completed
- ✅ CI/CD pipelines working
- ✅ Ready for production deployment

**Each completed task is progress toward a complete application!** 🚀

---

## 📞 Support Contacts

### For Help With:

**Copilot Usage:**
- GitHub Copilot CLI: `copilot-cli help`
- GitHub Copilot Docs: [github.com/features/copilot](https://github.com/features/copilot)

**Project Questions:**
- Review `.github/README.md`
- Check `docs/` directory
- Ask team members
- Review git history

**Technical Issues:**
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- TypeScript: [typescriptlang.org](https://www.typescriptlang.org)
- Drizzle: [orm.drizzle.team](https://orm.drizzle.team)
- Other tools: Check respective documentation

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-22 | Initial creation |
| - | - | - |

---

**🚀 Ready to get started? Open `.github/prompts/mainsetup.prompt.md` and begin your journey!**

---

**Last Updated:** 2026-01-22  
**Status:** ✅ Ready for Use  
**Questions?** Review this document or ask Copilot for help!

