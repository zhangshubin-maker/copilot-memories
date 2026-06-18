# Copilot 记忆备份仓库

## 位置

- 路径：`C:\Users\shubin\copilot-memories\`
- GitHub：`https://github.com/zhangshubin-maker/copilot-memories.git`
- 它是 VS Code 用户级记忆目录的**备份镜像**，不是 Copilot 实际读写的运行时位置。

## 同步流程

- 用户级记忆实际在：`%APPDATA%\Code\User\globalStorage\github.copilot-chat\memory-tool\memories\`
- 备份方向：**单向**（实际目录 → 备份仓库），从不反向。
- 用户更新记忆后，需要手动跑：
  - `cd C:\Users\shubin\copilot-memories ; node sync.js` （拉取 + commit + push）
  - 或 `npm run sync` / `sync:dry` / `sync:local`
- `sync.js` 会镜像源端：源端删除 → 仓库这边也删（`README.md` 受保护）。

## 触发时机

- 当我刚通过 `memory` 工具创建/修改了用户级记忆，且用户问起备份/同步时，可以主动提醒「需要跑 sync.js 才会进 GitHub 备份」。
- 不要每次写记忆都自动跑 sync —— 这会污染对话流；只在用户问到或明确希望同步时跑。

## 工作区记忆不在备份范围

- 工作区记忆（`/memories/repo/`、`/memories/session/`）落在 `workspaceStorage/<id>/...`，是项目相关的，应该和项目本身一起治理（如本项目 uniapp-homepage 已写入 `/memories/repo/ai-docs-layout.md`）。
- `sync.js` 只镜像 `globalStorage` 下的用户级记忆。
