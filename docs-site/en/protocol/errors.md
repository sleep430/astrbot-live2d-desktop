# Errors

Protocol errors use `sys.error`. When a request-response operation fails, the `id` should reuse the original request ID so the caller can match the failure to the request.

```json
{
  "op": "sys.error",
  "id": "request-id",
  "ts": 1781240000000,
  "error": {
    "code": 4001,
    "message": "Authentication failed"
  }
}
```

| Field | Type | Description |
| --- | --- | --- |
| `error.code` | number | Machine-readable error code. |
| `error.message` | string | Human-readable error message. |

## System Errors

| Code | Name | Meaning | Common handling |
| --- | --- | --- | --- |
| `4001` | `AUTH_FAILED` | Authentication failed | Check adapter `auth_token` and desktop token. |
| `4002` | `VERSION_MISMATCH` | Protocol version mismatch | Ensure the client sends `version: "1.0.0"` or `1.x`. |
| `4003` | `INVALID_PAYLOAD` | Invalid payload | Check required fields and types in the relevant interface reference. |
| `4004` | `CONNECTION_FULL` | Connection limit reached | Close old clients or adjust adapter connection limits. |
| `4005` | `SESSION_NOT_EXIST` | Session does not exist | Reconnect and handshake again. |
| `4006` | `RESOURCE_NOT_FOUND` | Resource not found | Check whether the `rid` was uploaded, expired, or released. |

## Business Errors

| Code | Name | Meaning | Common handling |
| --- | --- | --- | --- |
| `5001` | `TTS_FAILED` | TTS failed | Check TTS service, audio URL, or resource reference. |
| `5002` | `STT_FAILED` | STT failed | Check audio format, sample data, or STT service. |
| `5003` | `PERFORM_FAILED` | Performance execution failed | Check `perform.show.sequence` element shapes. |
| `5004` | `UNSUPPORTED_TYPE` | Unsupported type | Check operation code, resource kind, or performance element type. |
| `5005` | `FILE_UPLOAD_FAILED` | File upload failed | Check resource size, quota, HTTP PUT, and file permissions. |
| `5006` | `RESOURCE_IO` | Resource I/O error | Check resource directory permissions, disk space, and resource-service logs. |

## Implementation Notes

- During handshake, `4001` or `4002` causes the desktop client to mark the connection as a protocol error and disconnect.
- Unknown operation codes usually do not produce a business response; check adapter logs during development.
- Resource errors are usually tied to `rid` state in `resource.prepare`, `resource.commit`, `resource.get`, or `resource.release`.
