---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: "**"
description: Project Security At Inception
---

# Project security best practices

- If any security issues are found based on newly introduced or modified code or dependencies, attempt to fix the issues using the results context.
- Rescan the code after fixing the issues to ensure that the issues were fixed and that there are no newly introduced issues.
- Repeat this process until no new issues are found.
