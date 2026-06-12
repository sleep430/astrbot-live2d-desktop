# State Model v2

`state.model` tells the adapter what the current desktop model can do. The v1 shape is runtime-ID oriented; the v2 alias extension is designed for readable names and LLM planners.

| Item | Value |
| --- | --- |
| Operation | `state.model` |
| Direction | desktop -> adapter |
| Trigger | Model load, alias configuration creation/update, or reconnect resync |
| Compatibility | v2 does not replace v1; adapters should still accept v1 payloads |

## Payload Examples

### v2 Alias Payload

```json
{
  "version": "2.0",
  "modelName": "Haru",
  "motions": [
    {
      "id": "TapBody_00",
      "name": "Touch Body 1",
      "category": "action",
      "duration": 2400
    }
  ],
  "expressions": [
    {
      "id": "Smile",
      "name": "Smile"
    }
  ],
  "capabilities": {
    "idleMode": "noise+motion",
    "llmControlled": true
  }
}
```

### v1 Compatibility Payload

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
      "aliases": ["smile", "happy"],
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

## v2 Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `version` | string | yes | Fixed to `2.0` for v2 alias payloads. |
| `modelName` | string | yes | Display name of the loaded model. |
| `motions` | MotionAlias[] | yes | Motions exposed to the planner. Disabled aliases are omitted. |
| `expressions` | ExpressionAlias[] | yes | Expressions exposed to the planner. Disabled aliases are omitted. |
| `capabilities.idleMode` | string | no | Idle strategy hint. The current desktop client commonly uses `noise+motion`. |
| `capabilities.llmControlled` | boolean | no | Whether LLM/planner-driven alias control is allowed. |

### MotionAlias

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | yes | Stable desktop motion ID, usually `{group}_{index}`, such as `TapBody_00`. |
| `name` | string | yes | Human-readable motion alias. `perform.show` can send it back as `motion.name`. |
| `category` | string | yes | `idle` for idle motions, `action` for normal motions. Adapters usually expose only `action` to active planning. |
| `duration` | number | yes | Estimated duration in milliseconds. |

### ExpressionAlias

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | yes | Runtime expression ID. |
| `name` | string | yes | Human-readable expression alias. `perform.show` can send it back as `expression.name`. |

## v1 Compatibility Fields

| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Current model name. |
| `motionGroups` | object | Motion group map. Keys are groups; values are `{ index, file? }[]`. |
| `expressions` | string[] | Runtime expression ID list. |
| `capabilities.expressionCombo` | boolean | Whether `expression.combo` is supported. |
| `capabilities.semanticExpression` | boolean | Whether `expression.semantic` is supported. |
| `capabilities.expressionProfile` | boolean | Whether expression semantic profile data was loaded. |
| `expressionCatalog` | object[] | Expression catalog for alias, tag, and combo-capability resolution. |
| `semanticPresets` | object | Map from semantic tags to recommended expression IDs. |
| `discovery` | object | Model scan/discovery summary. |

### expressionCatalog

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Canonical expression ID. |
| `aliases` | string[] | Matchable aliases, such as `smile` or `happy`. |
| `tags` | string[] | Semantic tags, such as `happy` or `thinking`. |
| `conflictGroups` | string[] | Conflict group declarations. |
| `supportsCombo` | boolean | Whether this expression may be used in `combo`. |

### discovery

| Field | Type | Description |
| --- | --- | --- |
| `mode` | string | `standard`, `hybrid`, or `compatibility`. |
| `sources` | string[] | Data sources used for discovery: `model3`, `companion`, `scan`. |
| `companionFiles` | string[] | Companion files used during discovery. |
| `standardDeclaredExpressions` | number | Expression count declared by the standard model file. |
| `standardDeclaredMotionGroups` | number | Motion group count declared by the standard model file. |
| `discoveredExpressions` | number | Expressions included in the final compatibility catalog. |
| `discoveredMotionGroups` | number | Motion groups included in the final compatibility catalog. |
| `scannedExpressionCount` | number | Expressions found by file scanning. |
| `scannedMotionCount` | number | Motions found by file scanning. |
| `warnings` | string[] | Discovery warnings. |

## Alias Resolution Rules

- The adapter should use `motions[].name` and `expressions[].name` in planner prompts.
- The desktop client resolves `motion.name` and `expression.name` back to local runtime IDs when receiving `perform.show`.
- If `expression.name` is not found as an alias, the current desktop client tries to use `name` as the runtime expression ID.
- If a v2 motion `name` does not match a local alias, the desktop client ignores it and logs a warning. Adapters should avoid unknown motion names.
- `motions[].id` can still be converted back into v1 `{ group, index }` for downgrade paths or diagnostics.

## Adapter Behavior

The adapter should:

- Store the original payload.
- Use `motions[].name` and `expressions[].name` for planner prompts.
- Prefer `perform.show` alias elements when talking to v2-capable desktop clients.
- Keep v1 `motionGroups` and `expressions: string[]` compatibility for older clients.
- Avoid exposing `category: "idle"` motions as active actions unless the user or planner explicitly requests them.
- Only output aliases that exist in the latest `state.model` payload.
