# 发布兼容性

## 版本矩阵

| 桌面端 | 适配器 | 状态 |
| --- | --- | --- |
| 1.5.0 | `9689fd3` 或更新 | 推荐组合，可完整使用 v2 alias payload。 |
| 1.5.0 | 旧适配器 | 基础 v1 行为可能可用，但别名规划器行为可能不完整。 |
| 1.4.x | 当前适配器 | v1 协议路径仍保持兼容。 |

## 发布检查清单

发布桌面端版本前：

1. Run `pnpm test`.
2. Run `pnpm run typecheck`.
3. Run `pnpm run docs:build`.
4. 确认 GitHub `Cross-Platform Smoke` 在 `master` 上是绿色。
5. 将 `package.json` 升到新版本。
6. 推送匹配的 `vX.Y.Z` tag。

构建 workflow 会校验推送的 tag 是否与 `package.json` 版本一致。
