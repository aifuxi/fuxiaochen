---
name: commit
description: 分析 git 改动、总结当前 diff，并生成以中文为主的 Conventional Commits 提交信息。用于检查改动、撰写提交信息或准备提交。
allowed-tools: Bash, Glob, Grep, Read
---

# 提交信息生成

使用这个 skill，把当前 git 改动整理成清晰的提交信息，并遵守 [Conventional Commits v1.0.0-beta.4](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) 规范。

## 目标

1. 检查当前仓库状态。
2. 总结改了什么，以及为什么重要。
3. 输出一条提交信息；如果 diff 明显不相关，则给出拆分提交建议。

## 必要流程

### 1. 检查 diff

先查看：

```bash
git status --short
git diff --cached
git diff
```

要同时考虑已暂存、未暂存、未跟踪、重命名和删除的文件。

### 2. 总结改动

按“改动意图”分组，不要只按文件列表来判断。

- 用户可见行为有什么变化？
- 内部代码路径有什么变化？
- 这是文档、配置、依赖、测试还是重构？
- 这份 diff 里是否混进了多个不相关的改动？

如果 diff 明显包含多个不相关主题，要明确指出，并建议拆成多个提交。

### 3. 选择 Conventional Commit 结构

优先使用下面的结构：

```text
type(scope): 中文主题

中文正文

BREAKING CHANGE: 中文说明
```

规则：

- `type` 必须小写。
- `scope` 可选，但当有明确模块或区域时应尽量使用。
- `subject` 要短、直接、能说明变化。
- 默认用中文写主题和正文。
- `subject` 末尾不要加句号或其他终止标点。
- 一条提交信息只对应一个完整、连贯的改动。
- 除非仓库已有自定义类型，否则使用标准 Conventional Commit 类型。

## 类型选择

优先选择最贴切的主类型：

- `feat`：新增能力或用户可见功能
- `fix`：修复 bug
- `docs`：仅文档修改
- `style`：仅格式或 lint 调整，不影响行为
- `refactor`：代码移动或结构调整，不以修 bug 或加功能为目的
- `perf`：性能优化
- `test`：新增或更新测试
- `build`：构建系统或依赖管理相关变更
- `ci`：CI/CD 配置或脚本变更
- `chore`：无法归入以上类别的维护类工作

## 范围选择

选择最窄、但仍能让提交信息看懂的范围。

常见范围：

- `auth`
- `api`
- `db`
- `config`
- `deps`
- `docs`
- `ui`
- `components`
- `lib`

如果仓库已经有稳定的模块命名方式，就优先沿用。

## 中文写法要求

- `subject`：用一句简洁中文概括改动。
- `body`：说明改了什么，以及为什么改，不要逐行解释实现细节。
- 如果有多个重点，可以用项目符号列出来。
- 除非改动很大或风险较高，否则正文保持简短。
- 如果存在破坏性变更，必须用 `BREAKING CHANGE:` 明确标注。

## 质量检查

在最终输出前，确认：

- `type` 和主要改动一致。
- `scope` 没有过于宽泛。
- `subject` 单独看也能理解。
- 中文表达自然，同时保留 Conventional Commits 语法。
- 任何破坏性变更都已清楚标注。

## 输出格式

当用户要提交信息时，输出：

1. 一段中文的 diff 摘要。
2. 一条推荐提交信息。
3. 如果有必要，再给出 1 到 2 条拆分提交的备选方案。

推荐提交信息要单独放在代码块里，方便直接复制。

## 示例

```text
feat(auth): 增加 GitHub 登录回调

接入 GitHub OAuth 登录流程，补充回调处理和账户绑定逻辑。
```

```text
fix(api): 修复用户列表分页重复数据

修正分页游标计算错误，避免翻页时返回重复记录。
```

```text
chore(config): 更新 TypeScript 配置

统一路径别名配置并清理过时选项。
```

```text
refactor(ui): 拆分按钮样式逻辑

将通用按钮变体提取到独立层，降低组件耦合度。
```
