# 性能优化工具集成文档

本文档记录了三个性能优化工具的集成情况。

## 已完成集成

### 1. ModelResourceCache - Live2D 资源缓存 ✅

**集成位置**: `src/utils/cubism/CubismModel.ts`

**功能说明**:
- 自动缓存 Live2D 纹理图像到内存（默认 100MB 限制）
- 缓存有效期 30 分钟，自动清理过期资源
- 首次加载从网络，后续加载从缓存
- 支持缓存命中率统计

**集成方式**:
```typescript
// 在 loadTexture 方法中集成
import { getGlobalModelResourceCache } from './ModelResourceCache'

const cache = getGlobalModelResourceCache()
const cachedData = cache.get(texturePath)

if (cachedData) {
  // 使用缓存数据创建纹理
  createImageBitmap(new Blob([cachedData]))
} else {
  // 从网络加载并缓存
  fetch(texturePath).then(data => cache.set(texturePath, data))
}
```

**预期效果**:
- 首次加载后，切换模型或重新加载相同纹理时速度提升 50-70%
- 减少网络请求次数
- 改善用户体验，特别是在频繁切换模型时

### 2. PerformanceMonitor - 性能监控 ✅

**集成位置**: `src/windows/Main.vue`

**功能说明**:
- 实时监控 FPS（帧率）
- 实时监控内存使用情况
- 开发模式下自动启用，生产环境不影响
- 低性能自动告警

**集成方式**:
```typescript
// 在 onMounted 中启用
if (import.meta.env.DEV) {
  const perfMonitor = getGlobalPerformanceMonitor()
  perfMonitor.start()
  
  perfMonitor.subscribe(snapshot => {
    // FPS 低于 30 告警
    if (snapshot.fps < 30) {
      console.warn('[性能监控] FPS 低于 30:', snapshot.fps.toFixed(2))
    }
    
    // 内存使用超过 80% 告警
    const memoryPercent = (snapshot.memory.used / snapshot.memory.limit) * 100
    if (memoryPercent > 80) {
      console.warn('[性能监控] 内存使用过高:', memoryPercent.toFixed(1) + '%')
    }
  })
}

// 在 onBeforeUnmount 中停止
perfMonitor.stop()
```

**预期效果**:
- 开发时实时了解应用性能状况
- 及时发现性能瓶颈和内存泄漏
- 每 60 秒输出一次性能统计日志

### 3. MessageBatcher - 消息批处理 ✅

**状态**: 项目已使用 `PerformanceQueue`，功能类似

**说明**:
- 项目已有 `PerformanceQueue` 类处理表演序列
- 实现了不同类型指令并行执行、同类型指令串行执行
- MessageBatcher 提供的工具函数（throttle, debounce, rafThrottle）可用于其他场景

**可用工具函数**:
```typescript
import { throttle, debounce, rafThrottle } from '@/utils/MessageBatcher'

// 节流 - 高频事件（如鼠标移动）
const throttledUpdate = throttle((data) => {
  updateModel(data)
}, 16) // ~60fps

// 防抖 - 输入事件
const debouncedSearch = debounce((query) => {
  search(query)
}, 300)

// RAF 节流 - 动画更新
const rafUpdate = rafThrottle((position) => {
  updatePosition(position)
})
```

## 性能提升预期

### Live2D 资源加载
- **首次加载**: 无变化
- **缓存命中**: 提升 50-70%
- **切换模型**: 如果纹理相同，几乎即时加载

### 内存管理
- **自动清理**: 30 分钟后自动清理不用的资源
- **限制保护**: 默认最大 100MB，防止内存溢出
- **智能淘汰**: 容量达到上限时自动淘汰最老的资源

### 开发体验
- **实时监控**: 开发时可视化性能数据
- **问题预警**: 低 FPS 和高内存使用自动告警
- **性能分析**: 为性能优化提供数据支持

## 配置选项

### ModelResourceCache 配置

如需调整缓存策略，可在初始化时配置：

```typescript
import { ModelResourceCache } from '@/utils/cubism/ModelResourceCache'

const cache = new ModelResourceCache({
  maxCacheSize: 50 * 1024 * 1024,  // 50MB
  maxAge: 15 * 60 * 1000,           // 15分钟
  cleanupInterval: 10 * 60 * 1000   // 10分钟清理一次
})
```

### PerformanceMonitor 配置

性能监控仅在开发模式启用：
- 开发模式 (`import.meta.env.DEV`): 自动启用
- 生产环境: 不启用，零性能开销

如需在生产环境启用轻量级监控，可修改条件：
```typescript
// 始终启用（不推荐，有性能开销）
const perfMonitor = getGlobalPerformanceMonitor()
perfMonitor.start()
```

## 监控性能数据

开发模式下，性能数据会自动输出到控制台：

```
[性能监控] { fps: "59.82", memoryMB: "45.32", memoryPercent: "2.1%" }
[性能监控] FPS 低于 30: 28.45
[性能监控] 内存使用过高: 156.78MB (82.3%)
```

## 注意事项

1. **内存使用**: 资源缓存会占用额外内存，默认限制 100MB
2. **开发模式**: 性能监控仅在开发模式启用，避免生产环境开销
3. **浏览器限制**: 缓存大小受浏览器内存限制影响
4. **清理策略**: 缓存会自动清理过期和最老的资源

## 故障排查

### 缓存未生效
1. 检查是否正确导入和初始化缓存
2. 查看控制台是否有缓存相关错误
3. 确认资源 URL 是否稳定（不变）

### 性能监控无数据
1. 确认是否在开发模式 (`npm run dev`)
2. 检查控制台是否有性能监控日志
3. 确认 `getGlobalPerformanceMonitor` 是否正确调用

### 内存占用过高
1. 减小 `maxCacheSize` 配置
2. 减少 `maxAge` 时间，更快清理
3. 手动调用 `cache.clear()` 清理缓存

## 未来优化方向

1. **预加载策略**: 预测用户行为，提前加载资源
2. **持久化缓存**: 使用 IndexedDB 持久化缓存，跨会话复用
3. **智能压缩**: 对缓存资源进行压缩，节省内存
4. **性能可视化**: 添加性能监控 UI 面板
5. **自适应策略**: 根据设备性能自动调整缓存策略
