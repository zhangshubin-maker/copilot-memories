# 编码教训

## 文件移动/重命名后的搜索
- 移动文件后，用**仅文件名**（不含路径）做 grep_search，能同时命中 alias 导入、相对路径导入、绝对路径导入。
- 反例：用旧完整路径搜索（如 `AiGenerator/js/opencodeClient`）会漏掉 `./js/opencodeClient.js` 这种相对导入。
- 改完所有引用后，验证旧目录/文件已删除。

## 一次搞定的检查清单
1. 先全局搜索所有引用（用最短唯一关键词）
2. 逐一修改所有引用
3. 删除/移动文件
4. lint 验证所有改动文件
5. 确认没有遗漏（再次搜索旧路径和文件名）

## 自动记录规则
- 对话中每当出现以下情况，自动追加记录到本文件：
  - 踩坑并找到了解法
  - 发现可复用的模式或约定
  - 纠正了一个错误认知
  - 验证了非显而易见的做法
- 不需要用户主动要求，自动判别并写入

## Windows 下生成脚本的踩坑
- create_file 写中文内容时，Windows 上 Node 直接 require 该 JS 文件可能报 `Invalid or unexpected token`（编码异常）。脚本里出现中文注释/字符串时，优先用纯英文 ASCII 编写脚本本身；中文内容只当作字符串读取/处理，不要写在脚本源码里。
- Windows 仓库里 markdown 常是 CRLF。frontmatter 解析正则若只匹配 `\n` 会失败导致 meta 全空。读源文件后先做 `text.replace(/\r\n/g, '\n')` 再解析。

## AI 编程工具多家适配方案
- 主流工具读取入口（2026 现状）：
  - Copilot: `.github/copilot-instructions.md` + `.github/instructions/*.instructions.md`（applyTo）
  - Cursor: `.cursor/rules/*.mdc`（globs）+ 旧版 `.cursorrules`
  - Claude Code: `CLAUDE.md`，也读 `AGENTS.md`
  - OpenCode/Codex/Aider: `AGENTS.md`（OpenCode 还可在 `opencode.json` 显式声明 instructions）
  - Continue.dev: `.continuerules`；Cline/Roo: `.clinerules`；Codeium/Windsurf: `.codeium/instructions.md`
- 推荐做法：以 `AGENTS.md` + `.github/instructions/*.instructions.md` 为单一事实源，写一个 `scripts/sync-ai-docs.js` 同步生成所有适配文件，加 `npm run sync:ai-docs` 和 `--check` 模式给 CI 用。
- Cursor 的 `.mdc` frontmatter 字段是 `globs`（YAML 数组）+ `alwaysApply`，把 Copilot 的 `applyTo`（逗号分隔）一一拆成数组即可。
