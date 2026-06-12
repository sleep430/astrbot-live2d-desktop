# Perform Show

`perform.show` 用来请求桌面端执行一段展示序列。

```json
{
  "op": "perform.show",
  "payload": {
    "interrupt": true,
    "sequence": [
      { "type": "text", "content": "你好！", "position": "center" },
      { "type": "motion", "name": "开心动作" },
      { "type": "expression", "name": "微笑", "holdMs": 1800, "resetPolicy": "previous" }
    ]
  }
}
```

## 元素类型

| 类型 | 关键字段 |
| --- | --- |
| `text` | `content`, `position` |
| `tts` / `audio` | `text`, `url`, `rid`, `inline`, `volume` |
| `image` / `video` | `url`, `rid`, `inline`, `autoplay` |
| `motion` | v2 `name`，或 v1 `group` + `index` |
| `expression` | v2 `name`、v1 `id`、`combo`、`semantic`、`holdMs`、`resetPolicy` |
| `wait` / `delay` | `duration` |

## 打断规则

- `interrupt: true`：清除当前表演，除非桌面端将其视为 follow-up。
- `interrupt: false`：不清除当前气泡，追加或排队执行。
- `interruptible: true`：允许后续序列安全替换这段 follow-up。

## 表情重置

桌面端运行时目前支持这些常用重置策略：

- `previous`：回到之前的表情状态。
- `neutral`：淡出并回到中性状态。
- `keep`：保持当前表情。
- `fadeOut` / `default` / `hold`：v2 适配器路径会接受这些值，以兼容规划器 prompt。
