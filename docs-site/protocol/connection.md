# 连接与握手

桌面端作为 WebSocket 客户端连接适配器。默认地址通常是：

```text
ws://127.0.0.1:9090/astrbot/live2d
```

适配器会要求 token 认证。桌面端设置中的 token 必须与适配器配置里的 `auth_token` 一致。

## `sys.handshake`

| 项目 | 值 |
| --- | --- |
| 方向 | 桌面端 -> 适配器 |
| 触发时机 | WebSocket 打开后立即发送 |
| 响应 | `sys.handshake_ack` 或 `sys.error` |

```json
{
  "op": "sys.handshake",
  "id": "8e6f7a2a-6b8f-4e45-85f2-b2f9b2f0a4f0",
  "ts": 1781240000000,
  "payload": {
    "version": "1.0.0",
    "clientId": "desktop-user-id",
    "token": "auth-token",
    "tools": [
      {
        "name": "capture_screenshot",
        "description": "Capture desktop or window screenshot.",
        "parameters": [
          {
            "name": "target",
            "type": "string",
            "description": "desktop, active, or window"
          }
        ]
      }
    ]
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `version` | string | 是 | 桥接协议版本。当前为 `1.0.0`，适配器接受 `1.x`。 |
| `clientId` | string | 是 | 客户端标识。适配器会用它生成 `sessionId` 和 `userId`。 |
| `token` | string | 是 | 认证 token。适配器未配置 token、客户端缺 token 或 token 不匹配都会拒绝连接。 |
| `tools` | array | 否 | 桌面端声明的工具能力，供适配器或规划器使用。 |
| `model` | object | 否 | 可选的初始模型信息；当前桌面端主要在握手后通过 `state.model` 同步。 |

## `sys.handshake_ack`

| 项目 | 值 |
| --- | --- |
| 方向 | 适配器 -> 桌面端 |
| 触发时机 | `sys.handshake` 验证通过 |
| `id` | 必须与握手请求相同 |

```json
{
  "op": "sys.handshake_ack",
  "id": "8e6f7a2a-6b8f-4e45-85f2-b2f9b2f0a4f0",
  "ts": 1781240000100,
  "payload": {
    "version": "1.0.0",
    "serverTime": 1781240000100,
    "features": ["message_chain", "tts_url", "multi_modal", "voice_input"],
    "capabilities": [
      "input.message",
      "input.touch",
      "input.shortcut",
      "perform.show",
      "perform.interrupt",
      "state.ready",
      "state.playing",
      "state.config",
      "state.model",
      "resource.prepare",
      "resource.commit",
      "resource.get",
      "resource.release",
      "resource.progress"
    ],
    "config": {
      "maxMessageLength": 5000,
      "supportedImageFormats": ["jpg", "png", "gif", "webp"],
      "supportedAudioFormats": ["mp3", "wav", "ogg"],
      "maxInlineBytes": 262144,
      "resourceBaseUrl": "http://127.0.0.1:9090",
      "resourcePath": "/resources"
    },
    "session": {
      "sessionId": "desktop-user-id",
      "userId": "desktop-user-id"
    }
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `version` | string | 适配器协议版本。 |
| `serverTime` | number | 适配器当前 Unix 毫秒时间戳。 |
| `features` | string[] | 适配器功能提示。 |
| `capabilities` | string[] | 当前连接可用操作码。资源服务未启用时不会声明 `resource.*`。 |
| `config.maxMessageLength` | number | 适配器建议的消息长度上限。 |
| `config.maxInlineBytes` | number | 建议内联资源上限。超过后优先使用资源服务。 |
| `config.resourceBaseUrl` | string | HTTP 资源服务根地址。 |
| `config.resourcePath` | string | HTTP 资源路径，默认 `/resources`。 |
| `session.sessionId` | string | 适配器分配的会话 ID。 |
| `session.userId` | string | 适配器分配的用户 ID。 |

## 心跳

桌面端握手成功后会定时发送 `sys.ping`，适配器以相同 `id` 返回 `sys.pong`。

```json
{
  "op": "sys.ping",
  "id": "ping-id",
  "ts": 1781240030000
}
```

```json
{
  "op": "sys.pong",
  "id": "ping-id",
  "ts": 1781240030010
}
```

## 握手失败

握手失败时适配器返回 `sys.error`，常见错误码：

| 错误码 | 含义 | 常见原因 |
| --- | --- | --- |
| `4001` | 认证失败 | 适配器未配置 `auth_token`、客户端未提供 token、token 不匹配。 |
| `4002` | 版本不匹配 | `payload.version` 不是 `1.x`。 |

更多错误见 [错误码](./errors.md)。
