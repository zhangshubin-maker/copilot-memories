# Copilot Memories

跨项目、跨机器的 VS Code Copilot Chat 用户记忆备份仓库。

## 文件说明

| 文件 | 用途 |
|------|------|
| `coding-lessons.md` | 编码教训、踩坑记录、自动记录规则 |
| `coding-preferences.md` | 编码偏好、工具使用习惯 |
| `sync.js` | 一键同步脚本 |

## 在新电脑上恢复

```bash
git clone https://github.com/YOUR_USERNAME/copilot-memories.git
# 将文件复制到 VS Code 记忆目录
```

## 自动更新

本仓库的记忆文件由 Copilot Chat 对话中自动识别并追加。更新后运行 `node sync.js` 推送。
