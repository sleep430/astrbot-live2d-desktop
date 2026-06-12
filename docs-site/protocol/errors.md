# 错误码

协议错误使用 `sys.error` 表示。请求-响应型操作失败时，`id` 应复用原请求 ID，便于调用方把错误对应到请求。

```json
{
  "op": "sys.error",
  "id": "request-id",
  "ts": 1781240000000,
  "error": {
    "code": 4001,
    "message": "认证失败"
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `error.code` | number | 机器可读错误码。 |
| `error.message` | string | 人类可读错误信息。 |

## 系统错误

| 错误码 | 名称 | 含义 | 常见处理 |
| --- | --- | --- | --- |
| `4001` | `AUTH_FAILED` | 认证失败 | 检查适配器 `auth_token` 和桌面端 token。 |
| `4002` | `VERSION_MISMATCH` | 协议版本不匹配 | 确认客户端发送 `version: "1.0.0"` 或 `1.x`。 |
| `4003` | `INVALID_PAYLOAD` | payload 无效 | 对照对应接口字段表检查必填字段和类型。 |
| `4004` | `CONNECTION_FULL` | 连接已满 | 关闭旧客户端或调整适配器连接限制。 |
| `4005` | `SESSION_NOT_EXIST` | 会话不存在 | 重新握手连接。 |
| `4006` | `RESOURCE_NOT_FOUND` | 资源不存在 | 检查 `rid` 是否已上传、未过期、未释放。 |

## 业务错误

| 错误码 | 名称 | 含义 | 常见处理 |
| --- | --- | --- | --- |
| `5001` | `TTS_FAILED` | TTS 失败 | 检查 TTS 服务、音频 URL 或资源引用。 |
| `5002` | `STT_FAILED` | STT 失败 | 检查音频格式、采样数据或 STT 服务。 |
| `5003` | `PERFORM_FAILED` | 表演执行失败 | 检查 `perform.show.sequence` 元素格式。 |
| `5004` | `UNSUPPORTED_TYPE` | 不支持的类型 | 检查操作码、资源类型或表演元素类型。 |
| `5005` | `FILE_UPLOAD_FAILED` | 文件上传失败 | 检查资源大小、配额、HTTP PUT 和文件权限。 |
| `5006` | `RESOURCE_IO` | 资源 I/O 错误 | 检查资源目录权限、磁盘空间和资源服务日志。 |

## 实现提示

- 握手阶段出现 `4001` 或 `4002` 时，桌面端会把连接标记为协议错误并断开。
- 未知操作码通常不会产生业务响应；开发时应先检查适配器日志。
- 资源类错误通常与 `resource.prepare`、`resource.commit`、`resource.get` 或 `resource.release` 的 `rid` 状态有关。
