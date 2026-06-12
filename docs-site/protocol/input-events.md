# 输入事件

输入事件由桌面端发送给适配器。适配器会把它们转换为 AstrBot 事件，交给 AstrBot 插件、LLM 或消息链处理。

## `input.message`

| 项目 | 值 |
| --- | --- |
| 方向 | 桌面端 -> 适配器 |
| 触发时机 | 用户在桌面端输入文本、录音转写完成、桌面主动感知通知等 |
| 响应 | 通常无直接响应；AstrBot 处理完成后由适配器发送 `perform.show` |

```json
{
  "op": "input.message",
  "id": "message-id",
  "ts": 1781240000000,
  "payload": {
    "content": [
      { "type": "text", "text": "你好" },
      { "type": "image", "url": "https://example.com/image.png" },
      { "type": "audio", "rid": "resource-uuid", "mime": "audio/webm" }
    ],
    "metadata": {
      "userId": "desktop-user-id",
      "userName": "桌面用户",
      "sessionId": "desktop-user-id",
      "messageType": "friend"
    }
  }
}
```

### Payload 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `content` | MessageContent[] | 是 | 消息内容链。可以混合文本、图片、音频、视频和文件。 |
| `metadata.userId` | string | 是 | 用户 ID。桌面端通常使用握手会话用户 ID。 |
| `metadata.userName` | string | 否 | 展示用用户名。 |
| `metadata.sessionId` | string | 是 | 会话 ID。 |
| `metadata.messageType` | string | 是 | `friend`、`group` 或 `notify`。 |

### MessageContent

| 字段 | 类型 | 适用类型 | 说明 |
| --- | --- | --- | --- |
| `type` | string | 全部 | `text`、`image`、`audio`、`video`、`file`。 |
| `text` | string | `text` | 文本内容。 |
| `url` | string | `image` / `audio` / `video` / `file` | 可直接访问的 HTTP(S) URL 或资源服务 URL。 |
| `rid` | string | `image` / `audio` / `video` / `file` | 资源 ID。需要通过 [资源协议](./resources.md) 获取真实 URL。 |
| `inline` | string | `image` / `audio` / `file` | 内联 data URL 或 base64 数据。仅推荐小文件使用。 |
| `name` | string | `file` | 文件名。 |
| `mime` | string | 媒体 / 文件 | MIME 类型。 |

::: tip
大资源优先使用 `rid` 或 `url`。`inline` 会增大 WebSocket 消息体，只适合小图片、小音频或调试数据。
:::

## `input.touch`

| 项目 | 值 |
| --- | --- |
| 方向 | 桌面端 -> 适配器 |
| 触发时机 | 用户点击、长按或拖动模型区域 |

```json
{
  "op": "input.touch",
  "id": "touch-id",
  "ts": 1781240000000,
  "payload": {
    "part": "head",
    "action": "tap",
    "x": 100,
    "y": 200,
    "duration": 500
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `part` | string | 否 | 触摸区域，如 `head`、`body`。部分旧实现也接受 `area`。 |
| `action` | string | 是 | `tap`、`double_tap`、`long_press`、`drag` 等。 |
| `x` / `y` | number | 否 | 触摸坐标。 |
| `duration` | number | 否 | 持续时间，单位毫秒。 |

## `input.shortcut`

| 项目 | 值 |
| --- | --- |
| 方向 | 桌面端 -> 适配器 |
| 触发时机 | 桌面端快捷键或自定义命令 |

```json
{
  "op": "input.shortcut",
  "id": "shortcut-id",
  "ts": 1781240000000,
  "payload": {
    "key": "Ctrl+S",
    "modifiers": ["Ctrl"]
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `key` | string | 是 | 快捷键标识或命令名。 |
| `modifiers` | string[] | 否 | 修饰键列表。 |

## 桌面主动通知

桌面感知功能可以复用 `input.message` 主动通知适配器。例如检测到用户打开新应用时：

```json
{
  "op": "input.message",
  "id": "desktop-event-id",
  "ts": 1781240000000,
  "payload": {
    "content": [
      {
        "type": "text",
        "text": "[desktop_event] 用户刚刚打开了新应用: Visual Studio Code"
      }
    ],
    "metadata": {
      "userId": "desktop-user-id",
      "sessionId": "desktop-user-id",
      "messageType": "notify"
    }
  }
}
```

适配器和规划器可以把 `messageType: "notify"` 当作环境事件，而不是用户主动聊天。
