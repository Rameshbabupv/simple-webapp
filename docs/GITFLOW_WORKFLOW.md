# Git Flow Workflow Guide

## Overview
This project follows the **Git Flow** branching model to ensure organized development and stable releases.

## Branch Structure

### Main Branches
- **`main`** - Production-ready code. Only release and hotfix merges allowed.
- **`develop`** - Integration branch for features. All feature branches merge here.

### Supporting Branches
- **`feature/*`** - New features and enhancements
- **`release/*`** - Preparation for production releases
- **`hotfix/*`** - Critical production fixes
- **`bugfix/*`** - Bug fixes for develop branch

## Common Git Flow Commands

### Starting New Work

#### New Feature
```bash
git flow feature start feature-name
# Creates: feature/feature-name from develop
```

#### New Release
```bash
git flow release start 1.0.0
# Creates: release/1.0.0 from develop
```

#### Emergency Hotfix
```bash
git flow hotfix start critical-fix
# Creates: hotfix/critical-fix from main
```

### Finishing Work

#### Complete Feature
```bash
git flow feature finish feature-name
# Merges feature/feature-name into develop
# Deletes feature branch
```

#### Complete Release
```bash
git flow release finish 1.0.0
# Merges release/1.0.0 into main AND develop
# Tags main with version
# Deletes release branch
```

#### Complete Hotfix
```bash
git flow hotfix finish critical-fix
# Merges hotfix/critical-fix into main AND develop
# Tags main with hotfix version
# Deletes hotfix branch
```

## Workflow Examples

### 🚀 Feature Development
```bash
# Start new feature
git flow feature start user-management

# Make changes and commits
git add .
git commit -m "✨ Add user creation form"
git commit -m "🔧 Fix validation logic"

# Finish feature (merges to develop)
git flow feature finish user-management
```

### 📦 Release Process
```bash
# Start release from develop
git flow release start 1.0.0

# Make final adjustments
git commit -m "🔖 Bump version to 1.0.0"
git commit -m "📝 Update changelog"

# Finish release (merges to main + develop, creates tag)
git flow release finish 1.0.0
```

### 🚨 Hotfix Process
```bash
# Emergency fix from main
git flow hotfix start security-patch

# Apply critical fix
git commit -m "🔒 Fix security vulnerability"

# Finish hotfix (merges to main + develop, creates tag)
git flow hotfix finish security-patch
```

## Branch Naming Conventions

### Features
- `feature/keycloak-auth` - Authentication system
- `feature/user-dashboard` - User management UI
- `feature/role-permissions` - RBAC implementation

### Releases
- `release/1.0.0` - Major release
- `release/1.1.0` - Minor release
- `release/1.0.1` - Patch release

### Hotfixes
- `hotfix/security-fix` - Security patches
- `hotfix/critical-bug` - Production issues

## Commit Message Format

Follow conventional commits with emojis:

```
<emoji> <type>: <description>

Examples:
✨ feat: Add user authentication with Keycloak
🐛 fix: Resolve login redirect issue
📝 docs: Update API documentation
🔧 chore: Update dependencies
🎨 style: Improve UI components
♻️ refactor: Restructure user service
✅ test: Add integration tests
🔒 security: Fix authorization vulnerability
```

## Remote Repository Integration

### Push Branches
```bash
# Push feature branch for collaboration
git push -u origin feature/feature-name

# Push develop after feature merges
git push origin develop

# Push main after releases
git push origin main --tags
```

### Pull Request Workflow
1. Create feature branch: `git flow feature start my-feature`
2. Push to remote: `git push -u origin feature/my-feature`
3. Create PR: `feature/my-feature` → `develop`
4. After review: `git flow feature finish my-feature`

## Project-Specific Rules

### For Systech Nexus Platform:

1. **All Keycloak changes** must include updated documentation
2. **UI changes** require screenshots in PR description
3. **API changes** need contract test updates
4. **Security features** require security review
5. **Database changes** need migration scripts

### Required Checks Before Merge:
- [ ] Tests pass: `npm run test:ci`
- [ ] Build succeeds: `npm run build`
- [ ] No lint errors: `npm run lint` (if configured)
- [ ] Documentation updated
- [ ] Environment variables documented

## Git Flow Configuration

The project is initialized with these settings:
```
Production branch: main
Development branch: develop
Feature prefix: feature/
Release prefix: release/
Hotfix prefix: hotfix/
Bugfix prefix: bugfix/
Support prefix: support/
```

## Troubleshooting

### Abort Feature
```bash
git flow feature delete feature-name
```

### Abort Release
```bash
git flow release delete 1.0.0
```

### Manual Branch Creation (if git-flow unavailable)
```bash
# Feature branch
git checkout develop
git checkout -b feature/my-feature

# Release branch
git checkout develop
git checkout -b release/1.0.0

# Hotfix branch
git checkout main
git checkout -b hotfix/critical-fix
```

## Team Collaboration

1. **Always start from latest develop**: `git checkout develop && git pull origin develop`
2. **Keep features small**: One feature per branch
3. **Regular updates**: Merge develop into long-running features
4. **Clean history**: Use `--no-ff` for important merges
5. **Meaningful commits**: Clear, descriptive commit messages

---

**Remember**: Git Flow ensures stability and organized collaboration. Follow the workflow consistently for best results! 🚀