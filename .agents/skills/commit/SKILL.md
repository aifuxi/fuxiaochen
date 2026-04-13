---
name: commit
description: Analyze git changes and generate Conventional Commits formatted commit messages. Use when user asks to commit code, generate commit message, or analyze git diff.
allowed-tools: Bash, Glob, Grep, Read
---

# Commit Message Generator

## Overview

This skill analyzes git changes and generates commit messages following the [Conventional Commits v1.0.0-beta.4](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) specification.

## Commit Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

## Commit Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Changes that do not affect the meaning of the code (formatting, semicolons, etc) |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `perf` | A code change that improves performance |
| `test` | Adding missing tests or correcting existing tests |
| `build` | Changes that affect the build system or external dependencies |
| `ci` | Changes to CI configuration files and scripts |
| `chore` | Other changes that don't modify src or test files |
| `temp` | Temporary commits that won't be included in CHANGELOG |

## Scope

The scope should identify the affected module/component:
- `blog`, `category`, `tag`, `user`, `changelog` - Business modules
- `ui`, `components` - UI components
- `auth` - Authentication
- `db`, `prisma` - Database
- `config` - Configuration files
- `deps` - Dependencies
- `style`, `css` - Styling
- `docs` - Documentation
- `api` - API routes
- `lib` - Utility libraries

## Analysis Process

### Step 1: Check Git Status

```bash
git status
git diff --cached  # staged changes
git diff          # unstaged changes
```

### Step 2: Categorize Changes

Group changes by type and scope:

1. **New files** - Identify new functionality
2. **Modified files** - Analyze what changed
3. **Deleted files** - Note removals
4. **Renamed files** - Track relocations

### Step 3: Generate Commit Message

1. **Type**: Determine primary type (use most significant change)
2. **Scope**: Identify affected module
3. **Subject**: Concise description in imperative mood
   - Max 50 characters
   - No period at end
   - Start with lowercase
4. **Body** (optional): Explain *what* and *why*, not *how*
   - Max 72 characters per line
5. **Footer** (optional): Breaking changes or issue references

## Examples

### Single Module Change
```
feat(blog): add markdown support for blog posts

Implement ByteMD editor for writing blog content with
markdown syntax highlighting and preview.

Closes #123
```

### Multiple Changes
```
feat(auth): add GitHub OAuth login

- Integrate Better Auth with GitHub provider
- Add OAuth callback handling
- Store linked accounts in database

BREAKING CHANGE: email login now requires email verification
```

### Simple Chore
```
chore: update TypeScript to 5.9.3
```

### Documentation Only
```
docs: add API documentation for blog endpoints
```

### Configuration Change
```
chore(config): update tsconfig.json path aliases

Remove redundant baseUrl since paths already handle @/ alias resolution
```

## Multi-commit Strategy

When changes span multiple unrelated modules, suggest splitting into separate commits:

```
# Commit 1: Feature
feat(blog): add new blog listing page

# Commit 2: Refactor
refactor(ui): extract shared button variants

# Commit 3: Config
chore(config): update eslint rules
```

## Constraints

1. Subject line must be 50 characters or less
2. Body lines should be 72 characters or less
3. Use imperative mood ("add" not "added")
4. Type is always lowercase
5. Scope is optional but recommended when applicable
6. Do not end subject with period
