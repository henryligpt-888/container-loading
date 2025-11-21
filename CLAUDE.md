# Claude AI 协作指南

## 📌 项目简介

这是一个 **3D 智能装箱模拟器**，用于可视化和优化货柜装载方案。项目使用 React + Three.js + TypeScript 技术栈，提供交互式的 3D 装箱模拟体验。

---

## 🎯 项目背景与目标

### 业务场景
物流行业货柜装载优化问题：
- 如何最大化货柜空间利用率？
- 如何保护易碎品不被压坏？
- 如何直观展示装载方案？

### 解决方案
通过 3D 可视化 + 智能算法，提供：
1. 实时装箱模拟
2. 空间利用率统计
3. 易碎品保护约束
4. 多种集装箱规格支持

---

## 🧠 核心技术决策

### 1. 为什么选择 React Three Fiber？
**决策理由：**
- ✅ 声明式 3D 开发（React 风格）
- ✅ 自动内存管理（避免 Three.js 原生内存泄漏）
- ✅ 丰富的生态系统（@react-three/drei 提供现成组件）
- ✅ 更好的性能优化（React 并发特性）

**替代方案：**
- ❌ 原生 Three.js：需要手动管理生命周期，代码冗长
- ❌ Unity WebGL：打包体积过大，不适合 Web 应用

### 2. 装箱算法选择

**当前方案：贪心式空间填充算法**

**优点：**
- 实现简单，易于理解和维护
- 计算速度快（O(n²)复杂度）
- 支持自定义约束（易碎品保护）

**缺点：**
- 不保证全局最优解
- 不支持货物旋转

**未来可替代方案：**
| 算法 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| **遗传算法** | 全局优化能力强 | 计算耗时长 | 离线优化 |
| **模拟退火** | 跳出局部最优 | 参数调优复杂 | 高精度要求 |
| **深度强化学习** | 自适应能力强 | 需大量训练数据 | 长期研究方向 |

---

## 🗂️ 代码架构解析

### 目录结构设计哲学

```
src/
├── components/          # 视图层（UI组件）
│   ├── BoxMesh.tsx     # 单一职责：渲染单个货物
│   ├── Scene.tsx       # 场景编排：组合3D元素
│   └── ControlPanel.tsx # 用户交互：表单与列表
├── services/           # 业务逻辑层
│   └── packingAlgorithm.ts # 纯函数：无副作用计算
├── App.tsx             # 状态管理中枢
├── types.ts            # 类型定义：单一数据源
└── constants.ts        # 配置常量：易于修改
```

**关键原则：**
1. **分层解耦**：视图层不包含业务逻辑
2. **单一职责**：每个文件职责明确
3. **类型安全**：TypeScript 严格模式

### 状态管理策略

**为什么不用 Redux/Zustand？**
- 状态简单，仅需管理货物列表和集装箱类型
- React 内置 `useState` 足够高效
- 避免过度工程化

**状态流向：**
```
用户操作 → ControlPanel 触发回调
         ↓
      App.tsx 更新状态
         ↓
    Scene/ControlPanel 重新渲染
```

---

## 🔍 关键代码解析

### 1. 装箱算法核心逻辑

#### 位置验证函数 (isValidPosition)
```typescript
// services/packingAlgorithm.ts:28-71
const isValidPosition = (
  pos: Point,
  box: BoxItem,
  placedBoxes: BoxItem[],
  container: Dimensions
): boolean => {
  // 1. 边界检查（防止货物超出集装箱）
  if (x + box.width > container.width) return false;

  // 2. 碰撞检测（遍历所有已放置货物）
  for (const other of placedBoxes) {
    if (checkOverlap(...)) return false;

    // 3. 易碎品约束（禁止上方堆叠）
    if (other.cantStackTop) {
      // 检测水平面重叠 + 垂直位置关系
      if (overlapX && overlapZ && y >= other.position[1]) {
        return false;
      }
    }
  }
  return true;
};
```

**关键设计点：**
- **提前返回**：一旦发现冲突立即返回，避免无效计算
- **约束分离**：将易碎品逻辑独立处理，易于扩展
- **AABB算法**：轴对齐包围盒，计算效率高

#### 动态放置点生成
```typescript
// services/packingAlgorithm.ts:120-126
// 每次成功放置后生成3个新候选点
potentialPoints.push([point[0], point[1] + box.height, point[2]]); // 顶部
potentialPoints.push([point[0] + box.width, point[1], point[2]]);  // 右侧
potentialPoints.push([point[0], point[1], point[2] + box.depth]);  // 前方
```

**为什么是这3个点？**
- **贪心策略**：新货物紧贴已放置货物，减少空隙
- **覆盖率**：三个方向保证空间充分利用
- **排序优化**：后续按 Y→Z→X 排序，优先填充底部

### 2. 3D 坐标系统设计

#### 坐标转换逻辑
```typescript
// components/BoxMesh.tsx:18-21
// 算法输出：左下前角坐标 (x, y, z)
// Three.js 需要：中心点坐标
const centerX = x + data.width / 2;
const centerY = y + data.height / 2;
const centerZ = z + data.depth / 2;
```

**为什么不直接用中心点？**
- ✅ 算法计算更简单（边界检查直接加法）
- ✅ 符合建筑/物流行业习惯（基准点在底部）
- ✅ 易碎品约束计算更直观（Y轴比较）

#### 集装箱居中渲染
```typescript
// components/Scene.tsx:69
<group position={[-container.width / 2, 0, -container.depth / 2]}>
```
**目的：** 将集装箱中心对齐到世界坐标原点，方便相机环绕

### 3. 性能优化技巧

#### 统计数据缓存
```typescript
// App.tsx:47-71
const stats = useMemo(() => {
  // 计算体积、重量等统计数据
}, [boxes, currentContainer]);
```
**优化效果：**
- 避免每次渲染都重新计算
- 依赖项变化时才更新
- 减少无效的 DOM 更新

#### 异步计算
```typescript
// App.tsx:34-44
setTimeout(() => {
  const packedBoxes = calculatePacking(boxes, containerDims);
  setBoxes(packedBoxes);
}, 100);
```
**设计考量：**
- 避免阻塞主线程（100ms 后执行）
- 允许 UI 先显示"计算中"状态
- 大量货物时提升用户体验

---

## 🐛 常见问题与解决方案

### 问题 1: 货物显示不正确或穿模

**可能原因：**
1. 坐标转换错误（角点 vs 中心点）
2. 碰撞检测遗漏
3. 浮点数精度问题

**排查步骤：**
```javascript
// 在 Scene.tsx 中添加调试辅助
<axesHelper args={[100]} /> // 显示坐标轴
<gridHelper args={[1000, 20]} /> // 显示网格
```

**解决方案：**
- 检查 `BoxMesh.tsx:18-21` 坐标计算
- 验证 `checkOverlap` 函数边界条件
- 使用 `Number.EPSILON` 处理浮点数比较

### 问题 2: 易碎品仍然被压

**根本原因：**
`cantStackTop` 约束只检测"上方"，不限制"下方"

**当前逻辑：**
```typescript
// 只阻止新货物放在易碎品上方
if (y >= other.position[1]) return false;
```

**改进方案：**
```typescript
// 双向约束：易碎品不能被压，也不能压别的货物
if (box.cantStackTop) {
  // 检测是否会压在其他货物上
  if (y > 0 && 下方有货物) return false;
}
```

### 问题 3: 大量货物时性能下降

**性能瓶颈分析：**
| 操作 | 复杂度 | 优化方向 |
|------|--------|---------|
| 碰撞检测 | O(n²) | 使用空间分区（八叉树） |
| 候选点遍历 | O(n×m) | 定期清理无效点 |
| 3D 渲染 | O(n) | 合并网格（InstancedMesh） |

**优化代码示例：**
```typescript
// 使用 InstancedMesh 批量渲染相同尺寸货物
<instancedMesh args={[geometry, material, count]}>
  {boxes.map((box, i) => (
    <Instance key={box.id} position={box.position} />
  ))}
</instancedMesh>
```

---

## 🛠️ 开发工作流建议

### 修改装箱算法
1. **文件位置**: `services/packingAlgorithm.ts`
2. **测试方法**:
   ```bash
   # 添加单元测试
   npm install --save-dev vitest
   # 创建 packingAlgorithm.test.ts
   ```
3. **调试技巧**:
   ```typescript
   // 添加日志输出
   console.log('尝试位置:', pos, '货物:', box);
   ```

### 添加新的集装箱规格
1. **编辑文件**: `constants.ts`
2. **添加配置**:
   ```typescript
   {
     name: 'CUSTOM',
     width: 1000,
     height: 300,
     depth: 250,
     maxLoad: 30000,
     label: '自定义货柜'
   }
   ```
3. **验证**:  重启开发服务器，检查下拉菜单

### 修改 3D 视觉效果
1. **光照调整**: `Scene.tsx:51-62`
   ```typescript
   <ambientLight intensity={0.7} /> // 调整环境光强度
   ```
2. **相机位置**: `Scene.tsx:20`
   ```typescript
   camera.position.set(x * 1.5, y * 2, z * 2); // 调整系数
   ```
3. **材质效果**: `BoxMesh.tsx:31-37`
   ```typescript
   <meshStandardMaterial
     roughness={0.5} // 0=光滑, 1=粗糙
     metalness={0.2} // 0=非金属, 1=金属
   />
   ```

---

## 🤖 AI 协作最佳实践

### 向 Claude 提问的技巧

#### ❌ 不好的问题
> "帮我优化代码"
> "为什么不工作？"

#### ✅ 好的问题
> "如何将 `calculatePacking` 函数的时间复杂度从 O(n²) 降低到 O(n log n)？"
> "货物 ID=abc123 显示在集装箱外部，检查 `BoxMesh.tsx:18-21` 的坐标计算逻辑是否正确"

**关键要素：**
1. **具体文件和行号**
2. **明确的目标或现象**
3. **相关的上下文信息**

### 代码审查清单

在提交 PR 或请求 AI 审查时，确保：

- [ ] TypeScript 无类型错误 (`npm run build`)
- [ ] 控制台无警告信息
- [ ] 添加了必要的注释（复杂算法）
- [ ] 遵循现有代码风格（Prettier 格式化）
- [ ] 性能敏感代码添加了 `useMemo`/`useCallback`
- [ ] 新增功能更新了 `BLUEPRINT.md`

### 请求 AI 帮助的场景

**适合求助：**
- 🟢 算法优化建议
- 🟢 性能瓶颈分析
- 🟢 代码重构方案
- 🟢 类型定义优化

**不适合求助：**
- 🔴 业务逻辑决策（如货柜规格标准）
- 🔴 UI/UX 设计选择（如颜色方案）
- 🔴 项目战略方向

---

## 📚 扩展阅读

### 装箱算法深入
- [3D Bin Packing Problem - Wikipedia](https://en.wikipedia.org/wiki/Bin_packing_problem)
- 论文: *A Genetic Algorithm for the 3D Bin Packing Problem* (2008)

### Three.js 进阶
- [Three.js Journey 课程](https://threejs-journey.com/)
- [React Three Fiber 官方文档](https://docs.pmnd.rs/react-three-fiber/)

### TypeScript 最佳实践
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

## 🔄 版本迭代建议

### v0.1.0 → v0.2.0
**重点功能：**
- [ ] 货物旋转（实现6种朝向）
- [ ] 撤销/重做功能
- [ ] 装箱方案导出（JSON格式）

**技术债务清理：**
- [ ] 添加单元测试（Vitest）
- [ ] 提取通用 Hooks（useBoxManager）
- [ ] 优化候选点管理（避免重复点）

### v0.2.0 → v1.0.0
**核心增强：**
- [ ] 多货柜优化算法
- [ ] 重心计算与可视化
- [ ] 装载顺序动画

**工程化：**
- [ ] CI/CD 自动部署
- [ ] Storybook 组件文档
- [ ] E2E 测试（Playwright）

---

## 💬 沟通协议

### 与项目维护者沟通

**Bug 报告模板：**
```markdown
### 问题描述
[简要描述问题]

### 复现步骤
1. 添加货物: 100×50×50cm, 10kg
2. 选择集装箱: 20GP
3. 点击"开始装箱计算"

### 预期结果
货物应该显示在集装箱内部

### 实际结果
货物显示在集装箱外部（坐标: [300, 0, 0]）

### 环境信息
- 浏览器: Chrome 120
- 操作系统: Windows 11
```

**功能请求模板：**
```markdown
### 功能描述
支持自定义货柜尺寸输入

### 使用场景
客户需要非标准尺寸的仓储货架模拟

### 建议实现方式
在 ControlPanel 添加"自定义模式"开关
```

---

## 🎓 学习路径

### 新手入门（0-2周）
1. 理解 React 基础（组件、状态、Props）
2. 学习 TypeScript 类型系统
3. 阅读 `types.ts` 和 `constants.ts`
4. 运行项目并测试所有功能

### 中级开发（2-4周）
1. 深入研究装箱算法（`packingAlgorithm.ts`）
2. 学习 Three.js 基础概念（网格、材质、光照）
3. 尝试修改 UI 样式和布局
4. 实现小型功能（如货物排序）

### 高级贡献（1-3月）
1. 优化算法性能（空间分区、并行计算）
2. 实现复杂功能（货物旋转、多货柜）
3. 添加测试覆盖
4. 贡献开源文档和示例

---

**文档维护者**: Claude AI
**最后更新**: 2025-01-21
**适用版本**: v0.0.0+

---

> 💡 **提示**: 本文档会随项目演进持续更新。如有疑问，请参考 `BLUEPRINT.md` 或提交 Issue。
