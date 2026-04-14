---
name: commit
description: 总结并分组当前改动的代码，生成符合 Conventional Commits 规范的提交信息（优先使用中文）
---

# Commit 技能

当用户要求提交代码、创建 commit 或描述代码改动时，使用此技能。

## 准备工作

1. 首先运行 `git status` 查看当前改动状态
2. 运行 `git diff --stat` 查看改动文件统计
3. 运行 `git diff` 查看具体改动内容
4. 运行 `git log --oneline -10` 了解项目最近的提交风格

## 分组逻辑

根据改动文件的路径和内容，将改动归类到以下分组：

| 分组 | 类型 (type) | 适用场景 |
|------|-------------|---------|
| feat | feat | 新增功能、页面、组件 |
| fix | fix | 修复 bug、错误 |
| docs | docs | 文档、注释、README |
| style | style | 代码格式、样式（不影响功能） |
| refactor | refactor | 重构（不修复 bug 不新增功能） |
| perf | perf | 性能优化 |
| test | test | 测试相关 |
| build | build | 构建系统、依赖变更 |
| ci | ci | CI/CD 配置 |
| chore | chore | 其他杂项（配置、工具等） |

## Conventional Commits 格式

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**格式要求：**
- `<type>` 使用英文小写
- `<scope>` 使用英文（可选，标识影响范围）
- `<description>` **优先使用中文**，简洁描述改动，不超过 72 字符
- 多个分组时，使用多个 commit 或在 body 中分点说明

## 执行步骤

### 步骤 1：分析改动

读取 git diff 输出，识别：
- 改动了哪些文件
- 每个文件改了什么（新增/修改/删除）
- 属于哪个功能模块或领域

### 步骤 2：确定 type 和 scope

根据改动内容选择最合适的 type：
- 新增功能 → `feat`
- 修复问题 → `fix`
- 样式调整 → `style`
- 重构代码 → `refactor`
- 文档更新 → `docs`
- 性能优化 → `perf`
- 测试相关 → `test`
- 构建/依赖 → `build`
- CI 配置 → `ci`
- 其他杂项 → `chore`

scope 通常使用模块名或目录名，例如：`feat(auth):` `fix(blog):` `chore(deps):`

### 步骤 3：撰写描述

- 中文描述，简明扼要
- 描述"做了什么"而非"怎么做的"
- 不使用句号结尾
- 避免泛泛而谈（如"更新代码"、"修改bug"）

**好例子：**
- `feat(blog): 添加文章点赞功能`
- `fix(auth): 修复登录过期后跳转到错误页面`
- `refactor(ui): 提取 Button 组件公共样式`

**坏例子：**
- `feat: 功能更新`（太泛）
- `fix: 修复问题`（太泛）
- `style: 修改样式`（未说明改了什么样式）

### 步骤 4：多分组处理

如果改动涉及多个 type：
1. 优先按最重要/最核心的改动确定一个 type
2. 在 commit message body 中列出其他改动
3. 或分多次 commit（推荐用于不相关的改动）

**多分组示例：**
```
feat(blog): 添加文章评论功能

- style(ui): 优化评论列表样式
- chore(deps): 添加评论表情依赖
```

### 步骤 5：执行提交

1. 运行 `git add <files>` 添加相关文件
2. 运行 `git commit -m "<message>"` 创建提交

**注意：**
- 不要使用 `git add -A` 或 `git add .` 避免意外包含不相关文件
- 只添加与本次 commit 相关的文件

## 特殊情况处理

### 没有改动
如果 `git status` 显示没有改动，告知用户当前没有需要提交的内容。

### 敏感内容
如果发现 .env、credentials、API keys 等敏感信息被改动：
1. 立即提醒用户
2. 不建议提交此类内容
3. 建议将其添加到 .gitignore

### 大型改动
如果改动很大（超过 10 个文件或涉及多个功能模块）：
1. 建议拆分成多个小 commit
2. 每个 commit 保持单一职责
