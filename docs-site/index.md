---
layout: home

hero:
  name: AstrBot Live2D Desktop
  text: 桌面端与桥接协议文档
  tagline: 面向 AstrBot Live2D 桌面端、适配器、模型别名、媒体资源与 L2D 桥接协议的实用参考。
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 协议 v2
      link: /protocol/state-model-v2

features:
  - title: 桌面端
    details: 基于 Electron + Vue，负责模型渲染、气泡、媒体播放、截图、录制和桌面感知行为。
  - title: AstrBot 适配器
    details: 通过 WebSocket 将 AstrBot 消息链与规划器输出转换为 perform.show 序列。
  - title: 别名协议
    details: v2 state.model 上报可读的动作与表情名称，让 LLM 规划器安全触发模型能力。
---

## 当前版本

| 组件 | 版本 | 说明 |
| --- | --- | --- |
| 桌面端 | 1.5.0 | 新增 v2 alias model payload 与模型别名编辑。 |
| 桥接协议 | 1.0.0 + v2 别名扩展 | v1 包仍兼容；v2 扩展 `state.model` 与 `perform.show`。 |
| AstrBot 适配器 | `9689fd3` 之后的 master | 完整使用 v2 alias payload 时需要配套更新。 |

## 文档地图

- [快速开始](./guide/getting-started.md)：安装、连接、导入模型并验证桥接链路。
- [架构](./guide/architecture.md)：桌面端、适配器、AstrBot 与模型运行时如何协作。
- [协议总览](./protocol/overview.md)：包结构、协议分层与兼容性规则。
- [State Model v2](./protocol/state-model-v2.md)：桌面端上报的模型别名能力 payload。
- [Perform Show](./protocol/perform-show.md)：文本、媒体、动作、表情与别名执行。
- [模型别名](./model-config/overview.md)：如何配置动作和表情名称。
