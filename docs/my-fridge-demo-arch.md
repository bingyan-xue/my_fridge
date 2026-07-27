# My Fridge Demo 架构设计

> 维护规则：本文件是主版本。英文版为同步译文，路径为 `docs/my-fridge-demo-arch.en.md`。以后修改架构时，两个版本必须一起更新；如有差异，以中文版为准。

## 1. 背景和目标

My Fridge Demo 是一个手机优先的本地 PWA，用来验证一个核心判断：用户记录家中食材后，系统能否根据库存、保鲜时间和简单营养规则，生成当天可执行的餐点计划。

Demo 先服务单用户和本地运行。它不追求完整正式版能力，重点跑通这条闭环：

1. 用户通过表单录入家中食材。
2. 系统根据默认保鲜天数推算食材的预计过期时间。
3. 用户可以按早餐、午餐或晚餐随机生成餐点。
4. 生成结果只是计划，不会立即扣减库存。
5. 用户确认做了某个餐项后，系统扣减库存。
6. 用户取消确认后，系统恢复之前扣减的库存。
7. 用户可以导出和导入本地数据，方便备份和换设备。

## 2. 非目标

Demo 不做以下内容：

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
- 精确碳水、脂质、纤维素、蛋白质克数计算
- 调味品库存管理
- 复杂步骤、耗时、难度和厨具体系
- 多人家庭协作

这些能力可以在正式版继续评估。Demo 阶段只保留必要的数据扩展口。

## 3. 技术决策

### 3.1 技术栈

- React：负责页面和交互。
- TypeScript：负责数据模型和核心业务逻辑。
- Vite：负责本地开发和打包。
- localStorage：负责 Demo 数据持久化。

核心逻辑尽量写成纯 TypeScript 模块，不直接绑定 React 组件。这样以后迁移到原生 App 或微信小程序时，可以复用库存、菜谱、生成引擎和数据模型。

### 3.2 PWA 策略

Demo 使用手机优先的 Web App 形态。

- `manifest` 必做，用来定义 App 名称、图标、主题色和主屏幕安装信息。
- `service worker` Demo 可选。先保证本地网页可以稳定运行；离线缓存可以后续补。

### 3.3 迁移策略

当前版本不做 App 和小程序，但架构要避免把核心逻辑写死在浏览器 UI 中。

未来路线：

- 原生 App：优先考虑用 Capacitor 包装 PWA。
- 微信小程序：单独实现小程序 UI，尽量复用纯 TypeScript 业务逻辑。
- 云同步：保持核心对象稳定，未来可以把 localStorage 数据迁移到后端数据库。

## 4. 系统模块

### 4.1 inventory

负责食材库存：

- 食材增删改查
- 默认保鲜天数推算
- 过期状态判断
- 库存扣减
- 库存恢复
- 手动库存修改

它不负责菜谱匹配、推荐理由或营养判断。

### 4.2 recipes

负责菜谱和餐项：

- 内置菜谱
- 用户自建菜谱
- 基础餐项
- 即食餐项
- 早餐组合餐

Demo 中 `Recipe` 是一个宽泛概念，不只表示一道菜。它可以表示：

- `dish`：一道菜，例如西红柿炒蛋
- `staple`：主食，例如米饭
- `readyToEat`：即食食物，例如香蕉、牛奶
- `combo`：组合餐，例如牛奶 + 鸡蛋 + 面包

### 4.3 planner

负责生成餐点：

- 按餐次生成餐点
- 过滤不可行餐项
- 规则打分
- 加权随机
- 同日重复控制
- 基础餐兜底
- 推荐理由
- 轻量营养提示

生成逻辑只产出计划，不直接修改真实库存。

### 4.4 aliases

负责食材别名归一化，提高库存和菜谱的匹配率。

示例：

- 番茄 -> 西红柿
- 马铃薯 -> 土豆
- 青菜 -> 叶菜

### 4.5 storage

负责本地数据：

- localStorage 读写
- `schemaVersion` 管理
- 示例数据初始化
- 数据导出
- 数据导入
- 基础数据校验

### 4.6 settings

Demo 设置保持简单：

- 本地数据提示
- 恢复示例数据
- 导出数据
- 导入数据

耗时、难度、厨具等正式版可能会用到，但 Demo UI 不展示，也不参与生成。

### 4.7 ui

负责页面：

- 今日
- 库存
- 菜谱
- 设置

UI 调用核心模块，不直接实现复杂业务规则。

## 5. 数据模型

### 5.1 AppData

```ts
type AppData = {
  schemaVersion: 1;
  ingredients: IngredientItem[];
  recipes: Recipe[];
  mealPlans: MealPlan[];
  inventoryTransactions: InventoryTransaction[];
  settings: UserSettings;
};
```

### 5.2 IngredientItem

```ts
type IngredientItem = {
  id: string;
  name: string;
  canonicalName: string;
  category: IngredientCategoryId;
  quantity: number;
  unit: Unit;
  storageLocation: 'fridge' | 'freezer' | 'pantry' | 'other';
  addedAt: string;
  expiryDate?: string;
  estimatedExpiryDate?: string;
  expirySource: 'user' | 'default';
  nutritionTags: NutritionTag[];
  updatedAt: string;
};
```

规则：

- 用户填写 `expiryDate` 时，使用用户日期。
- 用户未填写时，系统用类别默认保鲜天数推算 `estimatedExpiryDate`。
- 有效过期日取 `expiryDate ?? estimatedExpiryDate`。

### 5.3 IngredientCategory

```ts
type IngredientCategory = {
  id: IngredientCategoryId;
  name: string;
  defaultShelfLifeDays: number;
  defaultNutritionTags: NutritionTag[];
};
```

默认保鲜天数用于降低录入成本。例如叶菜可以默认 7 天，米面可以默认 365 天。具体表格在实现阶段用示例数据确定。

### 5.4 Unit

```ts
type Unit =
  | '个'
  | '根'
  | '把'
  | 'g'
  | 'kg'
  | 'ml'
  | 'L'
  | '袋'
  | '盒'
  | '包'
  | '瓶'
  | '斤';
```

用户录入时选择的单位就是该库存项的主单位。展示、扣减和归零判断都使用主单位。

自动换算只做确定性换算：

- `kg <-> g`
- `L <-> ml`
- `斤 <-> g`，按 `1 斤 = 500g`

其他单位不自动估算。单位不一致时，餐项可以进入候选，但需要在确认扣减前提醒用户检查。

### 5.5 Recipe

```ts
type Recipe = {
  id: string;
  name: string;
  recipeType: 'dish' | 'staple' | 'readyToEat' | 'combo';
  source: 'builtIn' | 'userCreated';
  mealTypes: MealType[];
  servings: number;
  ingredients: RecipeIngredient[];
  nutritionTags: NutritionTag[];
  optionalMeta?: {
    difficulty?: 'easy' | 'medium' | 'hard';
    estimatedMinutes?: number;
    cookware?: string[];
    steps?: string[];
  };
  createdAt: string;
  updatedAt: string;
};
```

自建菜谱是 Demo 必做功能。必填字段：

- 菜名
- 类型
- 适用餐次
- 默认份数，默认为 1 人份
- 所需食材列表
- 每个食材的数量
- 每个食材的单位
- 每个食材是否必需，默认必需

选填字段：

- 碳水化合物
- 脂质
- 纤维素
- 蛋白质

步骤、耗时、难度和厨具只作为可选扩展字段保留。Demo UI 不展示这些字段，生成引擎也不依赖它们。

### 5.6 RecipeIngredient

```ts
type RecipeIngredient = {
  name: string;
  canonicalName: string;
  quantity: number;
  unit: Unit;
  required: boolean;
};
```

### 5.7 MealPlan

```ts
type MealPlan = {
  id: string;
  date: string;
  meals: Meal[];
  createdAt: string;
  updatedAt: string;
};
```

日期按用户本地时间计算。用户可以手动查看和修改昨天的菜单，但随机生成只作用于当天。

### 5.8 Meal

```ts
type Meal = {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  items: PlannedMealItem[];
};
```

一顿饭是组合，允许多个餐项。Demo 一次生成一餐，不强制一次生成全天。

### 5.9 PlannedMealItem

```ts
type PlannedMealItem = {
  id: string;
  recipeSnapshot: Recipe;
  plannedServings: number;
  plannedConsumption: ConsumptionItem[];
  status: 'planned' | 'completed';
  reasons: string[];
  warnings: string[];
  locked: boolean;
};
```

生成时保存菜谱快照。已确认餐项 `status = 'completed'` 且 `locked = true`，不会被重新随机覆盖。未确认餐项可以被重新随机替换。

### 5.10 ConsumptionItem

```ts
type ConsumptionItem = {
  ingredientItemId: string;
  ingredientName: string;
  canonicalName: string;
  quantity: number;
  unit: Unit;
  requiresConfirmation: boolean;
};
```

### 5.11 InventoryTransaction

```ts
type InventoryTransaction = {
  id: string;
  ingredientItemId: string;
  mealPlanId?: string;
  plannedMealItemId?: string;
  quantityDelta: number;
  unit: Unit;
  reason: 'mealCompleted' | 'mealCompletionUndone' | 'manualAdjustment';
  relatedTransactionId?: string;
  createdAt: string;
};
```

确认餐项时写入负数扣减记录。取消确认时写入正数恢复记录。手动修改库存直接修改当前数量，并记录 `manualAdjustment`，不回写历史。

### 5.12 NutritionTag

```ts
type NutritionTag =
  | 'carb'
  | 'fat'
  | 'fiber'
  | 'protein'
  | 'vegetable'
  | 'fruit'
  | 'dairy';
```

Demo 只做轻量判断，例如有没有蛋白质、有没有蔬菜、有没有主食。正式版可以在不破坏现有结构的前提下增加精确营养字段。

## 6. 核心流程

### 6.1 添加食材

1. 用户打开库存页。
2. 用户通过表单添加食材。
3. 用户填写名称、类别、数量、单位和位置。
4. 用户可以填写过期日期。
5. 如果用户未填写过期日期，系统使用类别默认保鲜天数推算。
6. 系统归一化食材别名。
7. 系统保存数据到 localStorage。

Demo 不做 AI 口语录入，也不做复杂快速解析。

### 6.2 自建菜谱

1. 用户打开菜谱页。
2. 用户新建菜谱。
3. 用户填写菜名、类型、适用餐次、默认份数和所需食材。
4. 用户可以选择轻量营养标签。
5. 保存后，该菜谱参与后续生成。

### 6.3 随机生成餐点

1. 用户在今日页选择早餐、午餐或晚餐。
2. 系统读取当天已生成和已确认的餐项。
3. 系统读取当前库存。
4. 系统筛选适合该餐次的候选餐项。
5. 系统排除不可做餐项。
6. 系统对候选餐项打分。
7. 系统从高分候选中随机选择。
8. 系统保存为当天计划，但不扣库存。

早餐、午餐和晚餐使用不同餐次标签。早餐餐项不会默认推荐到午餐，除非它标记为任意餐次或午餐可用。

### 6.4 确认餐项

1. 用户点击某餐项的确认。
2. 系统根据 `plannedConsumption` 扣减库存。
3. 系统写入 `InventoryTransaction`。
4. 餐项状态改为 `completed`。
5. 餐项锁定，不再被随机覆盖。

### 6.5 取消确认

1. 用户点击已确认餐项的取消。
2. 系统确认该餐项已经产生过扣减记录。
3. 系统根据原扣减记录恢复库存。
4. 系统写入反向 `InventoryTransaction`。
5. 餐项状态改回 `planned`。
6. 餐项解除锁定，可以被重新随机替换。

### 6.6 手动修改库存

1. 用户编辑库存数量。
2. 系统直接修改当前数量。
3. 系统记录 `manualAdjustment`。
4. 系统不重算历史扣减。

### 6.7 导出数据

1. 用户进入设置页。
2. 用户点击导出数据。
3. 系统把 `AppData` 序列化为 JSON。
4. 浏览器下载文件，例如 `my-fridge-backup-2026-07-27.json`。

### 6.8 导入数据

1. 用户进入设置页。
2. 用户点击导入数据。
3. 用户选择 JSON 文件。
4. 系统提示：导入会覆盖当前本地数据。
5. 用户确认后，系统解析 JSON。
6. 系统校验 `schemaVersion` 和必要字段。
7. 校验成功后覆盖 localStorage。
8. 校验失败时显示错误，不修改当前数据。

导入不做合并。

## 7. 生成引擎

### 7.1 总体策略

生成引擎使用：

```text
过滤 + 规则打分 + 加权随机
```

生成结果必须能解释，但 UI 不展示复杂分数。

### 7.2 过滤规则

候选餐项必须满足：

- 餐次匹配。
- 必需食材存在。
- 必需食材数量足够，或单位不一致但可提示确认。
- 已过期食材默认不参与。
- 已确认餐项不会被覆盖。

调味品不作为库存约束。

### 7.3 打分规则

打分考虑：

- 未来 2 天内过期的食材高优先级。
- 未填写过期日期的食材使用默认保鲜天数估算。
- 同类食材尽量遵循 FIFO。
- 越接近过期，优先级越高。
- 同日尽量不重复同一道餐项。
- 同日尽量不重复过多同类食材。
- 能补充当前缺少的蛋白质、蔬菜或主食时加分。

### 7.4 加权随机

系统不永远选择最高分餐项，而是在高分候选中随机。这样生成结果有变化，但仍然偏向快过期、可执行和结构更合理的餐项。

### 7.5 基础餐兜底

如果完整菜品不足，系统可以生成基础餐项：

- 米饭
- 粥
- 面条
- 水煮蛋
- 牛奶
- 面包
- 香蕉
- 苹果
- 酸奶

基础餐项也使用 `Recipe` 建模。

### 7.6 不足判断

Demo 不用卡路里判断不足。

不足分两类：

- 可做性不足：没有任何可行候选餐项。
- 结构不足：生成了餐项，但缺少蛋白质、蔬菜或主食。

结构不足不阻止生成，只显示提示。

如果某餐没有可行候选，系统可以保留当天已有计划，只说明该餐无法生成。Demo 不要求一次生成完整的一日三餐。

示例提示：

- 库存有限，这餐缺少蛋白质。
- 这餐蔬菜偏少。
- 只有基础餐项可用。

### 7.7 推荐理由

每个餐项最多显示 1-2 条短理由。

示例：

- 用了快过期的豆腐。
- 补了蛋白质。
- 库存有限，生成基础餐。

不展示复杂分数。

## 8. 本地存储和数据迁移

Demo 使用 localStorage。

数据 key：

```text
my-fridge-app-data
```

数据结构必须包含：

```ts
schemaVersion: 1
```

未来 schema 变化时，通过迁移函数升级数据。

Demo 必做 JSON 导出和导入。导入采用覆盖策略，不做合并。导入前必须提示用户覆盖风险。

导入必须先完成解析和校验，再覆盖 localStorage。任何解析失败、版本不支持或必要字段缺失都不能修改当前数据。

导出内容包括：

```ts
type ExportedAppData = AppData & {
  exportedAt: string;
};
```

## 9. 错误和空状态

### 9.1 库存为空

提示用户先添加食材。

### 9.2 菜谱为空

提示用户使用示例菜谱或创建自建菜谱。

### 9.3 某餐无法生成

显示固定失败原因之一：

- 缺食材
- 数量不足
- 单位需要确认
- 餐次不匹配
- 菜谱不足

### 9.4 导入失败

错误类型：

- 文件不是 JSON
- `schemaVersion` 不支持
- 缺少必要字段
- 用户取消导入

导入失败时不能覆盖当前数据。

### 9.5 导入覆盖确认

导入前必须提示：

```text
导入会覆盖当前本地数据。是否继续？
```

### 9.6 即将过期边界

即将过期按用户本地日期计算。有效过期日落在今天、明天或后天的食材，都视为未来 2 天内过期，并进入高优先级。

## 10. 示例数据

Demo 必须包含：

- 15-20 个内置菜谱或基础餐项
- 20-30 个示例库存食材
- 1 套默认设置

示例菜谱应覆盖：

- 早餐组合
- 基础主食
- 即食食物
- 快手午餐
- 家常晚餐
- 清库存菜

示例库存应覆盖：

- 快过期食材
- 短保鲜食材
- 长保鲜食材
- 不同单位
- 不同营养标签

设置页提供恢复示例数据入口。

## 11. 测试策略

优先测试纯 TypeScript 核心逻辑。

必须测试：

- 默认保鲜天数推算
- 已过期食材默认排除
- 未来 2 天内食材优先
- 别名匹配
- 主单位扣减
- `kg/g`、`L/ml`、`斤/g` 换算
- 单位不一致时标记需要确认
- 已确认餐项不会被随机覆盖
- 取消确认能恢复库存
- 同日尽量避免重复
- 导出 JSON 包含完整 `AppData`
- 导入无效 JSON 不覆盖现有数据

UI 以人工验证为主。

## 12. Demo 难度评估

对第一次开发软件的人来说，这个 Demo 属于中等偏上的项目，但可以拆成小阶段完成。

难点不在页面，而在规则和状态：

- 食材数据要保存正确。
- 菜谱和库存要匹配。
- 随机生成不能乱来。
- 确认和取消要正确扣减、恢复库存。
- 导入不能误覆盖坏数据。

建议按阶段推进：

1. 静态页面和示例数据
2. 库存表单和 localStorage
3. 菜谱表单
4. 最简单的随机生成
5. 打分、过期优先和重复控制
6. 确认扣减和取消恢复
7. 导入导出和 PWA manifest

每一步都可以单独验证，不需要一次做完。

## 13. 实现前仍需准备

主要架构决策已经确认。实现前还需要准备这些内容：

- 内置示例菜谱清单
- 默认保鲜天数表
- 食材别名表
- 默认营养标签
- UI 视觉风格
