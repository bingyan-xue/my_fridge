# My Fridge Project State

> 更新日期：2026-07-28  
> 当前阶段：Demo V1 核心闭环已跑通。默认界面语言为英文，支持切换简体中文；内置示例数据已改为英文主数据。  
> 后续开发前，先看这里，再看 PRD、ARCH 和实施计划。

## 1. 当前已完成

### 1.1 文档和计划

- 中文 PRD：`docs/my-fridge-demo-prd.md`
- 英文 PRD：`docs/my-fridge-demo-prd.en.md`
- 中文 ARCH：`docs/my-fridge-demo-arch.md`
- 英文 ARCH：`docs/my-fridge-demo-arch.en.md`
- 实施计划：`docs/superpowers/plans/2026-07-27-my-fridge-demo.md`

维护规则：

- 中文 ARCH 是主版本。
- 如果以后改架构，`docs/my-fridge-demo-arch.md` 和 `docs/my-fridge-demo-arch.en.md` 必须一起改。

### 1.2 技术栈和运行方式

- React
- TypeScript
- Vite
- Vitest
- Testing Library
- localStorage
- Web App Manifest

本地运行：

```bash
npm.cmd run dev
```

当前本地地址：

```text
http://127.0.0.1:5173/
```

### 1.3 已实现功能

#### App 壳

- 手机优先页面壳。
- 底部导航：Today、Inventory、Recipes、Settings。
- 已接入 PWA manifest。

#### 领域模型

已实现：

- `IngredientItem`
- `IngredientCategory`
- `Recipe`
- `RecipeIngredient`
- `MealPlan`
- `Meal`
- `PlannedMealItem`
- `ConsumptionItem`
- `InventoryTransaction`
- `AppData`

核心文件：

- `src/domain/types.ts`
- `src/domain/units.ts`
- `src/domain/expiry.ts`
- `src/domain/aliases.ts`
- `src/domain/sampleData.ts`

#### 单位和过期规则

已实现确定性单位换算：

- `kg <-> g`
- `L <-> ml`
- `斤 <-> g`

不做自动估算：

- `个 -> g`
- `根 -> g`
- `把 -> g`
- `包 -> g`
- 其他非确定性换算

已实现过期状态：

- 已过期：过期日早于今天。
- 快过期：今天、明天、后天。
- 正常：超过未来 2 天。
- 未知：没有有效过期日期。

#### 示例数据和内置数据库

已实现：

- 18 个英文内置菜谱或基础餐项。
- 24 个英文示例库存食材。
- 英文食材分类名称。
- 1 套默认设置。
- 常见中文和英文食材别名会统一归一到英文 canonical name。
  - 例如：`番茄 / 西红柿 / tomato / tomatoes -> Tomato`
  - 例如：`鸡蛋 / egg / eggs -> Egg`
- 加载旧 localStorage 数据时，会刷新内置菜谱和示例库存食材名称到当前英文版本。
- 用户自建菜谱不会被内置数据刷新覆盖。
- 示例库存刷新只改示例食材的 `name` 和 `canonicalName`，不改用户已经调整过的数量。

示例数据工厂：

- `createSampleAppData()`

#### 本地存储

已实现：

- localStorage key：`my-fridge-app-data`
- `schemaVersion: 1`
- 空数据时自动初始化示例数据。
- 保存和读取 `AppData`。
- 导出 JSON。
- 导入 JSON 前解析和校验。
- 导入无效 JSON 不覆盖当前数据。
- 恢复示例数据。
- 加载时刷新内置业务数据，避免旧中文示例数据长期留在本地浏览器里。

核心文件：

- `src/storage/appStorage.ts`

#### 库存页

已实现：

- 表单添加食材。
- 自动归一化常见别名。
- 未填写过期日期时，用类别默认保鲜期推算。
- 展示库存列表。
- 展示储存位置、有效过期日、过期状态。
- 手动修改当前数量。
- 删除库存食材。

核心文件：

- `src/domain/inventory.ts`
- `src/components/IngredientForm.tsx`
- `src/components/IngredientList.tsx`
- `src/pages/InventoryPage.tsx`

#### 菜谱页

已实现：

- 展示内置菜谱。
- 创建自建菜谱。
- 自建菜谱可填写：名称、类型、餐次、份数、食材行、食材数量和单位、是否必需、轻量营养标签。
- 删除自建菜谱。
- 内置菜谱不能删除。

核心文件：

- `src/domain/recipes.ts`
- `src/components/RecipeForm.tsx`
- `src/components/RecipeList.tsx`
- `src/pages/RecipesPage.tsx`

#### 今日页

已实现：

- 可分别生成早餐、午餐、晚餐。
- 生成结果只是计划，不立即扣库存。
- 点击确认后扣减库存。
- 点击取消后恢复库存。
- 已确认餐项会锁定，不被重新随机覆盖。
- 每个餐项最多显示 1-2 条短理由或提示。

核心文件：

- `src/domain/planner.ts`
- `src/components/MealCard.tsx`
- `src/pages/TodayPage.tsx`

#### 语言和翻译

已实现：

- 默认界面语言是英文，符合 PRD 的“先制作英文界面”要求。
- 设置页可以切换 English / 简体中文。
- 用户语言选择会保存到 localStorage。
- 主要界面文案集中在 `src/i18n/translations.ts`。
- 主导航、页面标题、按钮、表单字段、空状态、状态标签、设置页提示会跟随语言切换。
- 内置业务数据目前采用英文主数据，而不是完整双语数据模型。

核心文件：

- `src/i18n/translations.ts`
- `src/App.tsx`
- `src/components/BottomNav.tsx`
- `src/pages/SettingsPage.tsx`

#### 设置页

已实现：

- 本地数据提示。
- 语言切换。
- 导出数据。
- 导入数据。
- 导入前覆盖提醒。
- 恢复示例数据。

核心文件：

- `src/pages/SettingsPage.tsx`

## 2. 当前验证状态

最后一次完整验证已通过：

```bash
npm.cmd test
npm.cmd run build
```

结果：

- 9 个测试文件通过。
- 38 个测试通过。
- TypeScript 检查通过。
- Vite 生产构建通过。

测试覆盖范围：

- 单位换算
- 过期规则
- 食材别名
- 内置英文示例数据
- localStorage 存储和内置数据刷新
- 库存 helper
- 菜谱 helper
- 餐点生成引擎
- App 基础导航 smoke test
- 默认英文界面
- 设置页语言切换和本地保存

## 3. Git 提交节点

当前分支：

```text
master
```

最近实现提交：

- `97c9452` feat: add default English UI language
- `a0b7858` feat: add settings data actions
- `9f9d6de` feat: add today meal planning flow
- `298fcc3` feat: add meal planner engine
- `7b46b45` feat: add user-created recipes
- `e114cda` feat: add inventory management
- `335d911` feat: add local app storage
- `76d8446` feat: add fridge domain foundation
- `793236f` feat: scaffold my fridge demo app
- `8858116` docs: add product architecture and implementation plan

当前工作区状态：

- 本轮正在修改内置数据库英文主数据、别名归一、存储刷新和项目状态文档。

## 4. 已知 BUG 和风险

### 4.1 高优先级

暂无已确认的高优先级功能 bug。

### 4.2 中优先级

#### 生成逻辑还比较粗糙

当前 planner 只是 Demo 级规则：

- 根据餐次过滤。
- 根据必需食材是否存在过滤。
- 排除已过期食材。
- 数量足够才生成。
- 快过期食材加分。
- 蛋白质、蔬果不足时给提示。

还没做到：

- 同日尽量不重复同一道菜。
- 同日尽量不重复过多同类食材。
- 更完整的早餐、午餐、晚餐结构差异。
- 更细的 FIFO 排序。
- 更稳定的加权随机测试。

#### 失败原因不够细

`generateMeal` 已有失败原因类型：

- 缺食材
- 数量不足
- 单位需要确认
- 餐次不匹配
- 菜谱不足

但当前实现多数不可行情况会返回 `缺食材`，还没有细分到 `数量不足` 或 `单位需要确认`。

#### 单位不一致确认还没完整 UI

planner 会把非确定性单位换算标记为 `requiresConfirmation`，但确认扣减页面还没有专门提示用户“这个单位需要你检查”。

#### 双语化还没有完整覆盖业务生成文案

已完成主要界面文案切换和英文内置业务数据，但还没有完整覆盖：

- planner 生成的推荐理由，例如“用了快过期的...”。
- storage/domain 抛出的错误文案。
- 中文界面下，内置菜谱和示例食材仍显示英文主数据。

如果要做完整双语业务数据，后续应改为 `nameByLanguage` 或类似结构，而不是继续复制两套数组。

### 4.3 低优先级

#### npm audit 提示依赖漏洞

`npm install` 后 npm audit 提示：

- 3 moderate
- 1 high
- 1 critical

目前没有执行 `npm audit fix --force`，因为它可能升级依赖并引入破坏性变化。Demo 功能和构建当前是通过的。

#### 测试需要提升权限运行

在当前 Codex 沙箱里，Vite/Vitest 读取配置时可能出现：

```text
Cannot read directory "../..": Access is denied.
```

因此 `npm.cmd test` 和 `npm.cmd run build` 之前是用提升权限确认通过的。这看起来是当前沙箱边界问题，不是应用代码问题。

#### UI 还没有浏览器截图验收

当前已经构建通过，但还没有用浏览器自动截图逐页检查：

- 移动端是否拥挤。
- 表单长内容是否换行合理。
- 按钮是否遮挡底部导航。
- 小屏幕下菜谱食材行是否足够好用。

#### 设置页导入成功没有非阻塞提示

导入失败会 `alert`。导入成功目前直接更新数据，没有显示“导入成功”的页面内提示。

#### 恢复示例数据没有二次确认

设置页“恢复示例数据”现在会直接覆盖当前数据。正式一点的体验应该加确认。

## 5. 下一步建议

### 5.1 第一优先级：手动验收

建议先按真实使用路径手动试一遍：

1. 打开 `http://127.0.0.1:5173/`。
2. 确认初始库存和内置菜谱显示英文。
3. 在库存页添加 `tomatoes 4 pcs`，确认 canonical 匹配到 `Tomato`。
4. 在库存页添加 `鸡蛋 6 个`，确认仍可识别为 `Egg`。
5. 刷新页面，确认库存仍在。
6. 在菜谱页添加一个自建菜谱。
7. 刷新页面，确认菜谱仍在。
8. 在今日页生成早餐。
9. 点击确认，去库存页看数量是否减少。
10. 回今日页点击取消，去库存页看数量是否恢复。
11. 设置页导出 JSON。
12. 恢复示例数据。
13. 导入刚才导出的 JSON。
14. 确认之前的数据回来了。

### 5.2 第二优先级：补 UI 验收和修小体验

建议检查并改进：

- 小屏幕表单布局。
- 菜谱食材行是否太挤。
- 今日页生成失败时提示是否清楚。
- 单位不一致时的提示。
- 恢复示例数据前加确认。
- 导入成功后显示页面内提示。
- planner 推荐理由和 storage/domain 错误提示的双语资源。

### 5.3 第三优先级：加强生成引擎

建议下一轮做：

- 同日不重复同一道菜。
- 不覆盖已确认内容。
- 区分 `缺食材`、`数量不足`、`单位需要确认`。
- 更明确地优先使用快过期食材。
- 基础餐兜底更稳定。
- 早餐、午餐、晚餐规则分层。

### 5.4 第四优先级：补更多测试

建议补：

- 今日页确认/取消的组件级测试。
- 设置页导入导出测试。
- planner 对 `数量不足`、`单位需要确认` 的测试。
- localStorage 迁移测试继续扩充到历史 meal plan snapshot。

### 5.5 第五优先级：准备 Demo 演示

可以准备一份固定 Demo 脚本：

- 初始库存里有哪些快过期食材。
- 生成早餐时应该看到什么。
- 生成午餐时如何体现“优先消耗快过期”。
- 确认/取消如何展示库存变化。
- 导出/导入如何演示换设备备份。

## 6. 当前范围外

这些没有做，是刻意不做：

- 账号系统
- 云同步
- 微信小程序
- 原生手机 App
- AI 口语录入
- AI 生成菜谱
- 拍照识别食材
- 小票识别
- 购物清单
- 精确卡路里计算
- 精确营养克数计算
- 调味品库存
- 多人协作

这些如果以后要做，应先更新 ARCH，再进入实施计划。
