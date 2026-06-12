# Connection

The desktop client connects to the adapter as a WebSocket client. The default URL is usually:

```text
ws://127.0.0.1:9090/astrbot/live2d
```

The adapter requires token authentication. The token in the desktop settings must match the adapter `auth_token`.

## `sys.handshake`

| Item | Value |
| --- | --- |
| Direction | desktop -> adapter |
| Trigger | Sent immediately after WebSocket open |
| Response | `sys.handshake_ack` or `sys.error` |

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

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `version` | string | yes | Bridge protocol version. Current value is `1.0.0`; the adapter accepts `1.x`. |
| `clientId` | string | yes | Client identifier. The adapter uses it to build `sessionId` and `userId`. |
| `token` | string | yes | Authentication token. Missing or mismatched tokens reject the connection. |
| `tools` | array | no | Desktop tool declarations for the adapter or planner. |
| `model` | object | no | Optional initial model info. The current desktop client mainly syncs this later via `state.model`. |

## `sys.handshake_ack`

| Item | Value |
| --- | --- |
| Direction | adapter -> desktop |
| Trigger | Successful `sys.handshake` validation |
| `id` | Must match the handshake request |

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

| Field | Type | Description |
| --- | --- | --- |
| `version` | string | Adapter protocol version. |
| `serverTime` | number | Adapter Unix timestamp in milliseconds. |
| `features` | string[] | Adapter feature hints. |
| `capabilities` | string[] | Operation codes available on this connection. `resource.*` is omitted when the resource service is disabled. |
| `config.maxMessageLength` | number | Suggested message length limit. |
| `config.maxInlineBytes` | number | Suggested inline resource limit. Larger resources should use the resource service. |
| `config.resourceBaseUrl` | string | HTTP resource service base URL. |
| `config.resourcePath` | string | HTTP resource path, default `/resources`. |
| `session.sessionId` | string | Adapter-assigned session ID. |
| `session.userId` | string | Adapter-assigned user ID. |

## Heartbeat

After a successful handshake, the desktop client periodically sends `sys.ping`; the adapter replies with `sys.pong` using the same `id`.

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

## Handshake Failures

On failure, the adapter returns `sys.error`. Common codes:

| Code | Meaning | Common cause |
| --- | --- | --- |
| `4001` | Authentication failed | Missing adapter `auth_token`, missing client token, or token mismatch. |
| `4002` | Version mismatch | `payload.version` is not `1.x`. |

See [Errors](./errors.md) for the full list.
