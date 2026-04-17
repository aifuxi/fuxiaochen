# Commit Helper Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个仓库内的 `commit-helper` skill，用于分析当前工作区改动、生成中文 Conventional Commits 提交信息，并在单一主题改动时自动提交。

**Architecture:** 采用 `SKILL.md + 轻量脚本` 结构。`SKILL.md` 负责触发条件、判断规则和执行流程，脚本只负责收集 git 上下文摘要，不负责决策或提交。

**Tech Stack:** Markdown、POSIX shell、git

---

### Task 1: 创建计划与技能骨架

**Files:**
- Create: `.agents/skills/commit-helper/SKILL.md`
- Create: `.agents/skills/commit-helper/scripts/collect_commit_context.sh`

- [ ] **Step 1: 创建技能目录与脚本目录**

```bash
mkdir -p .agents/skills/commit-helper/scripts
```

- [ ] **Step 2: 写入 `SKILL.md`**

```markdown
---
name: commit-helper
description: Use when the user wants to analyze current repository changes, generate a Chinese Conventional Commits message, and commit automatically when the changes are a single theme.
---
```

- [ ] **Step 3: 写入脚本文件并赋予可执行权限**

```bash
chmod +x .agents/skills/commit-helper/scripts/collect_commit_context.sh
```

### Task 2: 实现上下文采集脚本

**Files:**
- Modify: `.agents/skills/commit-helper/scripts/collect_commit_context.sh`

- [ ] **Step 1: 输出仓库与分支信息**

```bash
git rev-parse --show-toplevel
git branch --show-current
```

- [ ] **Step 2: 输出工作区摘要**

```bash
git status --short
git diff --stat
git diff --cached --stat
git ls-files --others --exclude-standard
```

- [ ] **Step 3: 输出变更文件列表**

```bash
git diff --name-only
git diff --cached --name-only
```

### Task 3: 验证技能与脚本

**Files:**
- Test: `.agents/skills/commit-helper/SKILL.md`
- Test: `.agents/skills/commit-helper/scripts/collect_commit_context.sh`

- [ ] **Step 1: 运行脚本，确认能输出 git 上下文**

```bash
.agents/skills/commit-helper/scripts/collect_commit_context.sh
```

- [ ] **Step 2: 检查 `SKILL.md` 是否覆盖触发条件、自动提交规则、混杂改动停止规则**

```bash
sed -n '1,240p' .agents/skills/commit-helper/SKILL.md
```

- [ ] **Step 3: 检查脚本是否仅收集上下文，不包含 `git add` / `git commit`**

```bash
rg -n "git add|git commit" .agents/skills/commit-helper/scripts/collect_commit_context.sh
```

### Task 4: 结果确认

**Files:**
- Review: `docs/superpowers/specs/2026-04-17-commit-helper-design.md`
- Review: `.agents/skills/commit-helper/`

- [ ] **Step 1: 对照设计 spec 复核实现范围**

```bash
sed -n '1,220p' docs/superpowers/specs/2026-04-17-commit-helper-design.md
```

- [ ] **Step 2: 输出使用说明**

```text
用户可以在仓库内通过“帮我提交”“分析当前改动并提交”“生成提交信息并提交”等表达触发该 skill。
```
