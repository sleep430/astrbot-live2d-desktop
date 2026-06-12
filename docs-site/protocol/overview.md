# 协议总览

桥接协议以数据包为单位。每个包包含：

```json
{
  "op": "perform.show",
  "id": "uuid",
  "ts": 1781240000000,
  "payload": {}
}
```

## 分层

| 分层 | 示例 | 方向 |
| --- | --- | --- |
| System | `sys.handshake`, `sys.ping` | 双向 |
| Input | `input.message`, `input.touch` | 桌面端到适配器 |
| Perform | `perform.show`, `perform.interrupt` | 适配器到桌面端 |
| State | `state.ready`, `state.model` | 桌面端到适配器 |
| Resource | `resource.prepare`, `resource.get` | 双向 |
| Desktop tools | 截图、活动窗口、窗口列表 | 适配器到桌面端 RPC |

## 兼容性

v2 别名扩展不会替代 v1 包。它会为 `state.model` 增加更丰富的字段，并允许 `perform.show` 使用可读的 `name` 值：

- v1 动作：`{ "type": "motion", "group": "TapBody", "index": 0 }`
- v2 动作：`{ "type": "motion", "name": "触摸身体1" }`
- v1 表情：`{ "type": "expression", "id": "Smile" }`
- v2 表情：`{ "type": "expression", "name": "微笑" }`
