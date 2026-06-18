# Copilot Memories

跨项目、跨机器的 VS Code Copilot Chat **用户级**记忆备份仓库。

## 工作机制

- VS Code Copilot Chat 的用户级记忆实际存放在：
  - Windows: `%APPDATA%\Code\User\globalStorage\github.copilot-chat\memory-tool\memories\`
  - macOS: `~/Library/Application Support/Code/User/globalStorage/github.copilot-chat/memory-tool/memories/`
  - Linux: `~/.config/Code/User/globalStorage/github.copilot-chat/memory-tool/memories/`
- 本仓库根目录是上面那个目录的**备份镜像**，由 `sync.js` 维护。
- 工作区级记忆（`workspaceStorage/<id>/...`）**不在备份范围**，因为它们是项目相关的，应该和项目一起治理。

## 目录约定

| 文件 | 用途 |
|------|------|
| `sync.js` | 同步脚本：把 VS Code 实际目录拉到本仓库 + git commit + push |
| `package.json` | 提供 `npm run sync` / `npm run sync:dry` / `npm run sync:local` 三个入口 |
| `*.md`（根目录其它 `.md`） | 由 `sync.js` 自动维护的记忆镜像。**不要手改这些文件**——改了会被下一次 sync 覆盖；要更新内容，请在 VS Code 里通过 Copilot Chat 修改记忆。 |
| `README.md` | 受保护，不会被 sync 删除/覆盖 |

## 日常使用

```bash
# 完整同步：拉取 + commit + push
node sync.js
# 或
npm run sync

# 只看会改什么，不写文件、不 commit
npm run sync:dry

# 同步并 commit，但不 push
npm run sync:local
```

## 在新电脑上恢复记忆

```bash
git clone https://github.com/zhangshubin-maker/copilot-memories.git
cd copilot-memories

# 把 *.md（README.md 除外）复制到 VS Code 的实际目录
# Windows PowerShell 示例：
$dst = "$env:APPDATA\Code\User\globalStorage\github.copilot-chat\memory-tool\memories"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Get-ChildItem -Filter "*.md" | Where-Object { $_.Name -ne "README.md" } |
  Copy-Item -Destination $dst
```

之后启动 VS Code，Copilot Chat 即可加载这些记忆。

## 注意

- **不要在本仓库手动新建/编辑记忆 `.md` 文件**，应该在 VS Code 里通过 Copilot Chat 让它写入记忆，再跑 `sync.js`。
- `sync.js` 会镜像源端：源端删除的记忆，仓库这边也会删（`README.md` 受保护除外）。
- 提交前可用 `npm run sync:dry` 预览。
