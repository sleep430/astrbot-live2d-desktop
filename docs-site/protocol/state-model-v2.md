# State Model v2

`state.model` 用来告诉适配器当前桌面端模型具备哪些能力。v1 结构面向运行时 ID，v2 别名扩展面向 LLM 规划器和可读名称。

| 项目 | 值 |
| --- | --- |
| 操作码 | `state.model` |
| 方向 | 桌面端 -> 适配器 |
| 触发时机 | 模型加载完成、别名配置生成或更新、重连后同步 |
| 兼容策略 | v2 不替代 v1；适配器仍应接受 v1 payload |

## Payload 示例

### v2 别名 payload

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

### v1 兼容 payload

```json
{
  "name": "Haru",
  "motionGroups": {
    "Idle": [{ "index": 0, "file": "motions/idle.motion3.json" }],
    "TapBody": [{ "index": 0, "file": "motions/tap_body.motion3.json" }]
  },
  "expressions": ["Smile", "Sad"],
  "capabilities": {
    "expressionCombo": true,
    "semanticExpression": true,
    "expressionProfile": true
  },
  "expressionCatalog": [
    {
      "id": "Smile",
      "aliases": ["smile", "开心"],
      "tags": ["happy"],
      "conflictGroups": ["emotion"],
      "supportsCombo": true
    }
  ],
  "semanticPresets": {
    "happy": ["Smile"]
  },
  "discovery": {
    "mode": "hybrid",
    "sources": ["model3", "companion", "scan"],
    "companionFiles": ["Haru.vtube.json"],
    "standardDeclaredExpressions": 8,
    "standardDeclaredMotionGroups": 6,
    "discoveredExpressions": 10,
    "discoveredMotionGroups": 7,
    "scannedExpressionCount": 10,
    "scannedMotionCount": 24,
    "warnings": []
  }
}
```

## v2 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `version` | string | 是 | v2 别名 payload 固定为 `2.0`。 |
| `modelName` | string | 是 | 当前加载模型的显示名称。 |
| `motions` | MotionAlias[] | 是 | 可暴露给规划器的动作列表。只包含启用项。 |
| `expressions` | ExpressionAlias[] | 是 | 可暴露给规划器的表情列表。只包含启用项。 |
| `capabilities.idleMode` | string | 否 | 待机策略提示，当前桌面端常用 `noise+motion`。 |
| `capabilities.llmControlled` | boolean | 否 | 是否允许 LLM/规划器按别名控制动作与表情。 |

### MotionAlias

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 桌面端稳定动作 ID，通常为 `{group}_{index}`，如 `TapBody_00`。 |
| `name` | string | 是 | 可读动作别名。`perform.show` 可用 `motion.name` 传回。 |
| `category` | string | 是 | `idle` 表示待机动作，`action` 表示普通动作。适配器通常只把 `action` 暴露给主动规划。 |
| `duration` | number | 是 | 预估动作时长，单位毫秒。 |

### ExpressionAlias

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 运行时表情 ID。 |
| `name` | string | 是 | 可读表情别名。`perform.show` 可用 `expression.name` 传回。 |

## v1 兼容字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | string | 当前模型名称。 |
| `motionGroups` | object | 动作组映射。键为 group，值为 `{ index, file? }[]`。 |
| `expressions` | string[] | 运行时表情 ID 列表。 |
| `capabilities.expressionCombo` | boolean | 是否支持 `expression.combo`。 |
| `capabilities.semanticExpression` | boolean | 是否支持 `expression.semantic`。 |
| `capabilities.expressionProfile` | boolean | 是否已加载表情语义 profile。 |
| `expressionCatalog` | object[] | 表情目录，供适配器做别名、标签和组合能力解析。 |
| `semanticPresets` | object | 语义标签到推荐表情 ID 数组的映射。 |
| `discovery` | object | 模型扫描与发现摘要。 |

### expressionCatalog

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 规范表情 ID。 |
| `aliases` | string[] | 可匹配别名，如 `smile`、`开心`。 |
| `tags` | string[] | 语义标签，如 `happy`、`thinking`。 |
| `conflictGroups` | string[] | 冲突组声明。 |
| `supportsCombo` | boolean | 该表情是否允许进入 `combo`。 |

### discovery

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `mode` | string | `standard`、`hybrid` 或 `compatibility`。 |
| `sources` | string[] | 本次发现依赖的数据源：`model3`、`companion`、`scan`。 |
| `companionFiles` | string[] | 参与发现的 companion 文件。 |
| `standardDeclaredExpressions` | number | 标准模型声明表情数量。 |
| `standardDeclaredMotionGroups` | number | 标准模型声明动作组数量。 |
| `discoveredExpressions` | number | 最终纳入兼容清单的表情数量。 |
| `discoveredMotionGroups` | number | 最终纳入兼容清单的动作组数量。 |
| `scannedExpressionCount` | number | 文件扫描得到的表情数量。 |
| `scannedMotionCount` | number | 文件扫描得到的动作数量。 |
| `warnings` | string[] | 发现过程警告。 |

## 别名解析规则

- 适配器生成规划器 prompt 时优先使用 `motions[].name` 和 `expressions[].name`。
- 桌面端收到 `perform.show` 后，把 `motion.name` 和 `expression.name` 解析回本地运行时 ID。
- 如果 `expression.name` 找不到本地别名，当前桌面端会尝试把 `name` 当作运行时 ID 使用。
- v2 动作没有命中别名时会被忽略并写入日志；适配器应避免输出未上报的动作名。
- `motions[].id` 仍可被适配器解析回 v1 `{ group, index }`，用于降级或诊断。

## 适配器行为

适配器应该：

- 保存原始 payload。
- 在规划器 prompt 中使用 `motions[].name` 和 `expressions[].name`。
- 面向支持 v2 的桌面端时，优先输出 `perform.show` 别名元素。
- 保持 v1 `motionGroups` 和 `expressions: string[]` 兼容，以支持旧客户端。
- 不要把 `category: "idle"` 的动作当作主动动作随意下发，除非用户或规划器明确要求。
- 只输出当前 `state.model` 中存在的别名，避免桌面端忽略未知动作。
