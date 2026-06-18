#!/usr/bin/env node
/* eslint-disable */
/**
 * sync.js
 *
 * 把 VS Code Copilot Chat 的用户级记忆同步到本仓库，并 git commit + push。
 *
 * 单向同步：globalStorage/memory-tool/memories/  →  本仓库根目录
 *
 * 仅同步用户级记忆（跨工作区共享），不同步 workspaceStorage 下的工作区记忆。
 *
 * 用法：
 *   node sync.js              # 拉取 + commit + push
 *   node sync.js --no-push    # 仅拉取 + commit（不 push）
 *   node sync.js --dry        # 仅预览差异，不写文件、不 commit
 *
 * 跨平台：Windows / macOS / Linux
 */

const fs = require('fs')
const path = require('path')
const os = require('os')
const { execSync } = require('child_process')

const REPO_DIR = __dirname

const args = process.argv.slice(2)
const NO_PUSH = args.includes('--no-push')
const DRY = args.includes('--dry')

/**
 * 解析 VS Code Copilot Chat 用户级记忆目录。
 * Windows : %APPDATA%\Code\User\globalStorage\github.copilot-chat\memory-tool\memories
 * macOS   : ~/Library/Application Support/Code/User/globalStorage/github.copilot-chat/memory-tool/memories
 * Linux   : ~/.config/Code/User/globalStorage/github.copilot-chat/memory-tool/memories
 *
 * 也尝试 Code - Insiders 目录（按版本回退）。
 */
function resolveMemoryDirs() {
  const platform = process.platform
  const home = os.homedir()
  const candidates = []

  const userDirs = []
  if (platform === 'win32') {
    const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming')
    userDirs.push(path.join(appData, 'Code', 'User'))
    userDirs.push(path.join(appData, 'Code - Insiders', 'User'))
  } else if (platform === 'darwin') {
    userDirs.push(path.join(home, 'Library', 'Application Support', 'Code', 'User'))
    userDirs.push(path.join(home, 'Library', 'Application Support', 'Code - Insiders', 'User'))
  } else {
    userDirs.push(path.join(home, '.config', 'Code', 'User'))
    userDirs.push(path.join(home, '.config', 'Code - Insiders', 'User'))
  }

  for (const u of userDirs) {
    candidates.push(
      path.join(u, 'globalStorage', 'github.copilot-chat', 'memory-tool', 'memories')
    )
  }

  return candidates.filter((p) => {
    try {
      return fs.statSync(p).isDirectory()
    } catch {
      return false
    }
  })
}

function listFiles(dir) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith('.md'))
      .map((d) => d.name)
  } catch {
    return []
  }
}

function readSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8')
  } catch {
    return null
  }
}

// 仓库里手写、不属于「记忆文件」的 markdown，不会被同步覆盖/删除
const PROTECTED_FILES = new Set(['README.md'])

function syncOne(srcDir) {
  const srcFiles = listFiles(srcDir)
  const srcSet = new Set(srcFiles)
  const dstFiles = listFiles(REPO_DIR)

  const changes = { added: [], updated: [], removed: [], skipped: [] }

  // 拉取 / 更新
  for (const name of srcFiles) {
    const srcPath = path.join(srcDir, name)
    const dstPath = path.join(REPO_DIR, name)
    const srcText = readSafe(srcPath)
    const dstText = readSafe(dstPath)

    if (dstText === null) {
      changes.added.push(name)
      if (!DRY) fs.writeFileSync(dstPath, srcText, 'utf8')
    } else if (srcText !== dstText) {
      changes.updated.push(name)
      if (!DRY) fs.writeFileSync(dstPath, srcText, 'utf8')
    } else {
      changes.skipped.push(name)
    }
  }

  // 在仓库存在、但源端已删除的，做删除（保留 PROTECTED_FILES）
  for (const name of dstFiles) {
    if (PROTECTED_FILES.has(name)) continue
    if (!srcSet.has(name)) {
      changes.removed.push(name)
      if (!DRY) fs.unlinkSync(path.join(REPO_DIR, name))
    }
  }

  return changes
}

function fmtList(label, arr) {
  if (!arr.length) return null
  return `  ${label}:\n${arr.map((n) => '    - ' + n).join('\n')}`
}

function summarize(changes) {
  const lines = []
  for (const [k, v] of Object.entries({
    added: changes.added,
    updated: changes.updated,
    removed: changes.removed,
    skipped: changes.skipped
  })) {
    const s = fmtList(k, v)
    if (s) lines.push(s)
  }
  return lines.join('\n') || '  (no changes)'
}

function hasGitChanges() {
  const out = execSync('git status --short', { cwd: REPO_DIR, encoding: 'utf8' })
  return out.trim().length > 0
}

function gitCommitAndPush(changes) {
  if (!hasGitChanges()) {
    console.log('[sync] git 工作区干净，无需 commit。')
    return
  }
  execSync('git add -A', { cwd: REPO_DIR, stdio: 'inherit' })
  const parts = []
  if (changes.added.length) parts.push(`+${changes.added.length}`)
  if (changes.updated.length) parts.push(`~${changes.updated.length}`)
  if (changes.removed.length) parts.push(`-${changes.removed.length}`)
  const ts = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const msg = `chore(memory): sync ${parts.join(' ') || 'no-op'} (${ts})`
  execSync(`git commit -m "${msg}"`, { cwd: REPO_DIR, stdio: 'inherit' })
  console.log('[sync] commit 完成。')
  if (NO_PUSH) {
    console.log('[sync] --no-push 已设置，跳过 push。')
    return
  }
  try {
    execSync('git push', { cwd: REPO_DIR, stdio: 'inherit' })
    console.log('[sync] push 完成。')
  } catch (err) {
    console.error('[sync] push 失败，可手动重试：cd ' + REPO_DIR + ' && git push')
  }
}

function main() {
  const memoryDirs = resolveMemoryDirs()
  if (!memoryDirs.length) {
    console.error('[sync] 未找到 VS Code Copilot Chat 用户级记忆目录，已停止。')
    console.error(
      '[sync] 期望路径示例：%APPDATA%/Code/User/globalStorage/github.copilot-chat/memory-tool/memories'
    )
    process.exit(1)
  }

  // 一般只会有一个；如果同时装了 Stable 和 Insiders，全部依次合并（Stable 优先级高）
  let agg = { added: [], updated: [], removed: [], skipped: [] }
  for (const dir of memoryDirs) {
    console.log('[sync] 源目录：' + dir)
    const c = syncOne(dir)
    for (const k of Object.keys(agg)) agg[k].push(...c[k])
  }

  console.log('[sync] 同步结果：')
  console.log(summarize(agg))

  if (DRY) {
    console.log('[sync] --dry 已设置，未写入文件、未 commit。')
    return
  }

  gitCommitAndPush(agg)
}

main()
