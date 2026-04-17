---
name: commit-helper
description: Use when the user wants help analyzing current repository changes, generating a Chinese Conventional Commits message, or committing current work safely.
---

# Commit Helper

## Overview

这个 skill 用于分析当前仓库工作区改动，生成中文 Conventional Commits 提交信息，并在改动主题单一时帮助完成自动提交。

核心原则：

- 默认分析整个工作区，不只看 staged changes
- 只有在改动足够集中时，才允许自动 `git add -A` 和 `git commit`
- 发现混杂改动时，必须停止自动提交并给出拆分建议
- 不使用交互式 git，不自动 `git push`

## When to Use

当用户表达以下意图时使用：

- “帮我提交”
- “分析当前改动并提交”
- “生成提交信息并提交”
- “给我一个合适的 commit message”
- “按 Conventional Commits 帮我提交”

如果用户只想要提交信息建议而没有要求实际提交，可以生成信息但不执行 `git commit`。

## Workflow

### 1. 收集上下文

先运行脚本：

```bash
.agents/skills/commit-helper/scripts/collect_commit_context.sh
```

该脚本只负责输出：

- 仓库根目录
- 当前分支
- 当前 git 特殊状态
- `git status --short`
- staged / unstaged diff 摘要
- 未跟踪文件
- 变更文件列表

必要时，再补充读取关键 diff：

```bash
git diff -- <path>
git diff --cached -- <path>
```

### 2. 先判断能不能安全提交

出现以下情况时，必须停止自动提交：

- 不在 git 仓库中
- 工作区为空，没有任何可提交内容
- 存在 merge 冲突
- 正处于不适合直接提交的高风险 git 状态，且无法从当前上下文安全判断
- 改动明显混杂，无法归纳为一个主题

停止时要明确说明原因，不得伪称已完成。

### 3. 判断是单一主题还是混杂改动

满足以下多数特征时，可视为单一主题：

- 所有改动围绕同一个功能、修复、重构或文档目标
- 虽然文件分散，但属于同一条链路
- 可以用一句中文准确概括改动结果
- 提交信息不需要依赖“并且 / 同时 / 顺便”才能说清楚

以下情况通常判定为混杂改动：

- 两个及以上互不从属的目标并列出现
- 功能改动与配置改动、文档改动、工具链改动混在一起
- 两个独立模块同时被修改，且没有明显主从关系
- 变更中夹杂“顺手改一下”的独立修正

如果是混杂改动：

- 不执行 `git add`
- 不执行 `git commit`
- 输出拆分建议
- 为每一组建议提供一条中文 Conventional Commits 信息

### 4. 生成提交信息

格式：

```text
<type>(<scope>): <中文描述>
```

要求：

- `type` 使用英文 Conventional Commits 关键字
- `scope` 可选，但如果能识别模块，优先补上
- 描述必须是中文
- 描述要简洁、准确、聚焦结果

优先考虑的 `type`：

- `feat`
- `fix`
- `refactor`
- `docs`
- `style`
- `test`
- `chore`
- `perf`
- `build`
- `ci`

示例：

- `feat(blog): 新增博客精选文章展示区`
- `fix(auth): 修复后台登录态校验异常`
- `docs(skill): 新增提交助手技能设计文档`

### 5. 自动提交

只有在以下条件同时成立时才自动提交：

- 用户明确希望提交，而不只是要一条 message 建议
- 当前改动被判断为单一主题
- 工作区状态适合安全提交

执行顺序固定为：

```bash
git add -A
git commit -m "<生成的提交信息>"
```

注意：

- 不自动只 add 部分文件
- 不自动生成多个 commit
- 不自动 `push`
- 不使用交互式 git

### 6. 结果输出

如果成功提交，应输出：

- 当前改动主题总结
- 实际使用的提交信息
- commit hash

如果未提交，应输出：

- 未提交的原因
- 是否因为混杂改动而停止
- 建议拆分方案和对应提交信息

## Common Judgement Rules

### 可自动提交的典型场景

- 一个功能及其配套组件、样式、页面接入
- 一个 bug 修复及其相关逻辑调整
- 围绕一个主题的文档更新
- 一次目标清晰的重构

### 不可自动提交的典型场景

- 页面重构和 `.gitignore` 调整同时存在
- 功能改动和工具链改动并列存在
- 两个不同模块各自有独立改动
- 生成产物和人工改动混杂

## Failure Rules

遇到以下情况，直接返回真实状态：

- `git add` 失败
- `git commit` 失败
- 无法清晰判断改动主题
- 仓库存在冲突或异常状态

不要说“已经提交”或“应该没问题”。必须以实际命令结果为准。
