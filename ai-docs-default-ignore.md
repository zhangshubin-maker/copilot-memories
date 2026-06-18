# AI 项目文档默认本地化（跨仓库通用偏好）

## 默认规则

- **任何 AI 相关项目文档默认本地化**，不入库、不提交、不进 PR。
- 涵盖范围（不限于）：
  - `AGENTS.md`（根 + 嵌套）
  - `.ai-docs/`、`.copilot-docs/`、`docs/ai/` 等 AI 上下文目录
  - `CLAUDE.md`、`.cursorrules`、`.cursor/`、`.clinerules`、`.continuerules`、`.aider.conf.yml`
  - `.github/copilot-instructions.md`、`.github/instructions/`、`.github/prompts/`
  - 任何为 AI 工具适配的同步/镜像脚本（如 `scripts/sync-ai-rules.js`）
- 若仓库的 `.gitignore` 已经忽略了上述路径，**沿用现状**，不要把它们改成入库。
- 若仓库 `.gitignore` 没忽略，新增 AI 文档时**优先**追加到 `.git/info/exclude`（仅本人本地，不污染仓库），其次才考虑 `.gitignore`（团队共享时）。

## 优先选 .git/info/exclude 而不是 .gitignore

- `.gitignore` 改动会进 PR，影响团队；多数情况下 AI 文档只是个人工作流。
- `.git/info/exclude` 仅本人本地生效，零侵入，最适合「私人 AI 上下文包」。

## 例外情况

- 用户明确说「团队共享」「入库」「让别人 clone 也能看到」时，才走 `.gitignore` 解除 + 入库流程。
- 默认即使是模板/范例项目，也先按本地化处理，再问用户。

## 操作清单（新增 AI 文档时）

1. 先查 `.gitignore` 和 `.git/info/exclude`，确认现状策略。
2. 新建文件后，立刻把路径追加到 `.git/info/exclude`。
3. 跑一次 `git status --short --untracked-files=all`，确认 git 看不到新增文件。
4. 仓库已有 `AGENTS.md` 时，单一事实源是 `AGENTS.md`，其它工具用薄壳指向它，详见仓库级 `/memories/repo/ai-docs-layout.md`（如存在）。
