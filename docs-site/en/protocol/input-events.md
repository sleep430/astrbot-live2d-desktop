# Input Events

Input events are sent by the desktop client to the adapter. The adapter converts them into AstrBot events for plugins, LLM logic, or message-chain handling.

## `input.message`

| Item | Value |
| --- | --- |
| Direction | desktop -> adapter |
| Trigger | User text input, completed voice transcription, desktop-aware notifications, and similar events |
| Response | Usually no direct response; after AstrBot finishes, the adapter sends `perform.show` |

```json
{
  "op": "input.message",
  "id": "message-id",
  "ts": 1781240000000,
  "payload": {
    "content": [
      { "type": "text", "text": "Hello" },
      { "type": "image", "url": "https://example.com/image.png" },
      { "type": "audio", "rid": "resource-uuid", "mime": "audio/webm" }
    ],
    "metadata": {
      "userId": "desktop-user-id",
      "userName": "Desktop User",
      "sessionId": "desktop-user-id",
      "messageType": "friend"
    }
  }
}
```

### Payload Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `content` | MessageContent[] | yes | Message chain. It can mix text, images, audio, video, and files. |
| `metadata.userId` | string | yes | User ID. The desktop client usually uses the handshake session user ID. |
| `metadata.userName` | string | no | Display name. |
| `metadata.sessionId` | string | yes | Session ID. |
| `metadata.messageType` | string | yes | `friend`, `group`, or `notify`. |

### MessageContent

| Field | Type | Applies to | Description |
| --- | --- | --- | --- |
| `type` | string | all | `text`, `image`, `audio`, `video`, or `file`. |
| `text` | string | `text` | Text content. |
| `url` | string | `image` / `audio` / `video` / `file` | Direct HTTP(S) URL or resource-service URL. |
| `rid` | string | `image` / `audio` / `video` / `file` | Resource ID. Resolve it through the [resource protocol](./resources.md). |
| `inline` | string | `image` / `audio` / `file` | Inline data URL or base64 data. Use only for small files. |
| `name` | string | `file` | File name. |
| `mime` | string | media / file | MIME type. |

::: tip
Prefer `rid` or `url` for large resources. `inline` increases the WebSocket message size and is best for small images, short audio clips, or debugging.
:::

## `input.touch`

| Item | Value |
| --- | --- |
| Direction | desktop -> adapter |
| Trigger | User taps, long-presses, or drags on a model area |

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

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `part` | string | no | Touched area, such as `head` or `body`. Some older implementations also accept `area`. |
| `action` | string | yes | `tap`, `double_tap`, `long_press`, `drag`, and similar actions. |
| `x` / `y` | number | no | Touch coordinates. |
| `duration` | number | no | Duration in milliseconds. |

## `input.shortcut`

| Item | Value |
| --- | --- |
| Direction | desktop -> adapter |
| Trigger | Desktop shortcut or custom command |

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

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | string | yes | Shortcut identifier or command name. |
| `modifiers` | string[] | no | Modifier keys. |

## Desktop Notifications

Desktop-aware behavior can reuse `input.message` to notify the adapter. For example, when the desktop detects that the user opened a new app:

```json
{
  "op": "input.message",
  "id": "desktop-event-id",
  "ts": 1781240000000,
  "payload": {
    "content": [
      {
        "type": "text",
        "text": "[desktop_event] User just opened a new app: Visual Studio Code"
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

The adapter and planner can treat `messageType: "notify"` as an environment event rather than an explicit chat message.
