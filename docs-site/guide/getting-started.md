# 快速开始

## 安装组件

1. 安装 AstrBot，并启用 `astrbot_plugin_live2d_adapter`。
2. 启动 AstrBot，确认适配器已加载。
3. 打开 AstrBot Live2D Desktop。
4. 在桌面端设置中，将桥接地址设为 `ws://127.0.0.1:9090/astrbot/live2d`。
5. 确保桌面端和适配器使用同一个认证 token。

## 导入模型

桌面端支持 Cubism 3/4 的 `.model3.json` 入口。你可以从模型库导入一个模型目录。导入后，桌面端会从这些来源扫描动作和表情：

1. `.model3.json` 标准声明。
2. `.vtube.json` 伴随声明。
3. 目录扫描兜底，查找 `.motion3.json` 和 `.exp3.json`。

## 验证连接

连接成功后，桌面端会发送：

- `sys.handshake`
- `state.ready`
- `state.model`

从 v1.5.0 开始，`state.model` 默认使用 v2 别名扩展。适配器会保存这份 payload，并在转换 AstrBot 回复或规划器后续序列时使用它。

## 推荐冒烟测试

发送一条普通 AstrBot 消息，并确认：

- 桌面端出现文本气泡。
- 如果消息包含音频或媒体资源，能正常播放。
- 适配器日志出现 `perform.show` 序列。
- 如果模型存在别名，模型信息日志包含 v2 motions 与 expressions。
