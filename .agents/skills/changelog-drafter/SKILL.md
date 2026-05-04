---
name: changelog-drafter
description: Use when the user wants to generate a deployment-ready changelog draft for this fuxiaochen project from commits, git history, a commit range, or the default origin/master..HEAD range. Produces backend-ready changelog fields for the current site without publishing them.
---

# Changelog Drafter

## Purpose

Generate a project changelog draft from Git commits that can be pasted into the current admin changelog form.

This project publishes changelogs through the database/API-backed admin surface, not through a Markdown file. The draft must match the managed changelog fields:

```json
{
  "version": "",
  "title": "中文标题",
  "releaseDate": "YYYY-MM-DD",
  "type": "feature | improvement | bugfix | breaking",
  "description": "面向访客的简短描述",
  "changes": ["面向用户的变更项"]
}
```

## Workflow

1. Run the context collector from the repository root:

   ```bash
   .agents/skills/changelog-drafter/scripts/collect_changelog_context.sh
   ```

   The default range is `origin/master..HEAD`. If the user explicitly gives a range, pass it as the first argument.

2. If the output contains `NO_UNPUBLISHED_COMMITS`, stop. Tell the user there are no commits in the selected range and do not invent a changelog.

3. Read the commit subjects, bodies, diff stat, and changed file names. Inspect individual diffs only when the summary is not enough to understand user-facing impact.

4. Group commits into user-facing outcomes. Do not create one changelog item per commit unless each commit is independently meaningful to visitors or operators.

5. Produce one structured draft and a short basis summary. Do not create database records, call `/api/admin/changelogs`, stage files, commit, or push.

## Drafting Rules

- `version`: default to an empty string. Do not infer the next version from local data because the live latest changelog may differ.
- `releaseDate`: default to today's local date in `YYYY-MM-DD` format unless the user provides another date.
- `title`: use concise Chinese, focused on the released outcome, not implementation details.
- `description`: write one visitor-facing sentence that summarizes the release.
- `changes`: use Chinese user-facing bullets. Avoid commit hashes, branch names, file paths, route-handler names, and internal refactor noise.
- Keep `changes` short: usually 3-6 items. Merge related commits into one item.
- If a change is admin-only, say it as an operator-visible improvement, for example "完善后台更新日志管理体验".
- If the range mixes unrelated work, still draft one release when the user asked for a deployment changelog, but group bullets by outcome instead of exposing internal commit boundaries.

## Type Selection

- `feature`: the dominant outcome adds new visible capability or a new admin/site workflow.
- `improvement`: the dominant outcome improves UX, performance, loading states, copy, deployment docs, or maintainability without a clear bug fix.
- `bugfix`: the dominant outcome fixes broken behavior, wrong rendering, stale data, bad validation, or production/runtime errors.
- `breaking`: the release changes a public contract, deployment requirement, data schema, or behavior in a way that requires explicit migration or operator action.

If several types appear, choose the type that best describes the release's dominant user-facing value. Mention important fixes or breaking notes in `changes`.

## Output Shape

Return the draft first:

```json
{
  "version": "",
  "title": "",
  "releaseDate": "",
  "type": "improvement",
  "description": "",
  "changes": []
}
```

Then add:

- `依据范围`: the git range used.
- `归并依据`: 1-3 concise notes about which commit themes were merged into the draft.
