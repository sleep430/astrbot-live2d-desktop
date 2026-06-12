# State Model v2

`state.model` 用来告诉适配器当前桌面端模型具备哪些能力。

## Payload 示例

```json
{
  "version": "2.0",
  "modelName": "Haru",
  "motions": [
    {
      "id": "TapBody_00",
      "name": "触摸身体1",
      "category": "action",
      "duration": 2400
    }
  ],
  "expressions": [
    {
      "id": "Smile",
      "name": "微笑"
    }
  ],
  "capabilities": {
    "idleMode": "noise+motion",
    "llmControlled": true
  }
}
```

## 字段

| 字段 | 含义 |
| --- | --- |
| `version` | 别名模型 payload 使用 `2.0`。 |
| `modelName` | 当前加载模型的显示名称。 |
| `motions[].id` | 桌面端稳定动作 ID，通常为 `{group}_{index}`。 |
| `motions[].name` | 可读动作别名，可在 `perform.show` 中传回桌面端。 |
| `motions[].category` | `idle` 表示待机动作，`action` 表示普通动作。 |
| `motions[].duration` | 预估动作时长，单位为毫秒。 |
| `expressions[].id` | 运行时表情 ID。 |
| `expressions[].name` | 可读表情别名。 |

## 适配器行为

适配器应该：

- 保存原始 payload。
- 在规划器 prompt 中使用 `motions[].name` 和 `expressions[].name`。
- 面向支持 v2 的桌面端时，优先输出 `perform.show` 别名元素。
- 保持 v1 `motionGroups` 和 `expressions: string[]` 兼容，以支持旧客户端。
