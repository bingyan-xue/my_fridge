# My Fridge Project State

> 更新日期：2026-08-12  
> 当前阶段：Demo V1 核心闭环已跑通，并完成一轮本地手动验收。默认界面语言为英文，支持切换简体中文；内置示例数据已改为英文主数据；单位和 Today 推荐理由会按当前语言显示；库存过期日期和菜谱内容现在可编辑；自建菜谱刷新后会保留在列表前面；恢复示例数据和导入数据前都会显示页面内中英文二次确认弹窗；Today 页已支持手动选择菜谱加入某一餐，一餐可以有多道菜，库存不足的菜谱可加入计划但确认时会阻止扣减并提示用户；Today 页完成一轮冰箱线条风 UI 收尾，包括顶部无框排版、底部 Today 主入口样式和三餐时间图标。  
> 后续开发前，先看这里，再看 PRD、ARCH 和实施计划。

## 最新状态快照：2026-08-12 Today 手动选菜与 UI 收尾

本轮新增内容：

- 已先同步更新 PRD 和 ARCH 的中英文版本，确认 Today 页支持“手动选菜加入一餐”，并明确它不替代随机生成，而是补充入口。
- 新增实施设计和计划文件：`docs/superpowers/specs/2026-08-12-today-manual-recipe-picker-design.md`、`docs/superpowers/plans/2026-08-12-today-manual-recipe-picker.md`。
- Today 页每个餐次卡片新增 Add recipe / 添加菜谱入口。
- 新增菜谱选择弹窗，可按餐次和营养标签筛选；营养标签顺序为 Carb / Protein / Fat 优先，其余标签靠后。
- 手动选择菜谱会追加到该餐，不会覆盖已有菜品；因此一顿饭现在可以包含多道菜。
- 库存充足的菜谱正常加入；库存不足、缺少食材或单位需确认的菜谱也允许加入计划，但会显示 warning。
- 点击 Confirm / 确认时会再次检查库存。若库存不足、缺食材或单位需确认，则不扣库存、不写 transaction、不改变 meal item 状态，并在对应菜谱项里显示提示。
- 当前状态为 planned 的菜可以从餐单中删除；当前状态为 completed 的菜不能直接删除，必须先 Cancel 恢复库存，回到 planned 后才能删除。
- 手动选菜弹窗的餐次由入口决定，弹窗内不再重复显示 Meal type 筛选；搜索框已压缩，弹窗把更多空间留给菜谱列表。
- Today 页已按“冰箱层架 / Fridge Shelf”方向做一轮视觉增强：顶部保留无框标题、日期和餐单状态 summary 标签，三餐卡片增加不同色侧边层架线，空餐次显示虚线层架槽位，菜品增加 Planned / Done 状态标签。
- Today 顶部排版已改回和 Inventory / Recipes 一致的无框结构，避免顶部面板遮挡右上角 Settings 按钮。
- 中文界面 Today 页顶部标题改为“今日食谱”，空餐次提示改为“随机生成一餐。”。
- 底部导航里的 Today 现在是主入口视觉：未选中时也保持较深的浅青底和深色文字/图标，选中时为深底浅字；Inventory 和 Recipes 保持原样。
- 三餐卡片图标改为时间感更强的线条组合：早餐 `Sunrise`、午餐 `Sun`、晚餐 `Moon`。
- 手动选菜弹窗和确认失败提示均已进入 `src/i18n/translations.ts`，中英文各自显示对应语言。

本轮验证：

```bash
npm.cmd test
npm.cmd run build
```

结果：

- 17 个测试文件通过。
- 84 个测试通过。
- TypeScript 检查通过。
- Vite 生产构建通过。

当前已知问题和风险：

- Today 随机生成逻辑仍然比较粗，只是 Demo 规则打分；它还没有做到同日尽量不重复、早餐/午餐/晚餐细分营养结构、完整 FIFO 权重。
- 手动加入库存不足菜谱后，计划中只显示简单 warning；目前不会生成购物清单，也不会自动建议替代食材。
- 中文界面下，内置菜谱和示例库存仍是英文主数据；这是现阶段有意保留的 Demo 数据策略，不等于完整双语业务数据库。
- 导出成功提示、移动端截图验收、单位不一致时更细的引导文案仍待后续补。

下一步建议：

- 继续围绕 Today 页，把“手动选菜 + 随机生成”的餐单体验做完整：同日不重复、餐次规则更细、失败原因更准确。
- 如要进入 UI 验收，应优先检查移动端截图：新增弹窗尺寸和滚动、底部导航遮挡、Today 主入口样式在不同页面下是否足够清楚。

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
- 手动修改过期日期；用户修改后会按用户日期重新计算过期状态。
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
- 编辑已有菜谱，包括内置菜谱和自建菜谱。
- 点击编辑后，编辑表单会在对应菜谱卡片内原地展开，顶部表单只负责新增菜谱。
- 删除已有菜谱，包括内置菜谱和自建菜谱。
- 删除内置菜谱后，普通刷新不会自动恢复；只有 Settings 的恢复示例数据会带回。

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
- 库存、菜谱、今日页里的单位显示会跟随语言切换；内部单位值仍保留中文单位枚举，用于库存扣减和换算。
- Today 页的推荐理由和 warning 会在显示层按当前语言转换。
- 内置业务数据目前采用英文主数据，而不是完整双语数据模型。

核心文件：

- `src/i18n/translations.ts`
- `src/i18n/formatters.ts`
- `src/App.tsx`
- `src/components/BottomNav.tsx`
- `src/pages/SettingsPage.tsx`

#### 设置页

已实现：

- 本地数据提示。
- 语言切换。
- 导出数据。
- 导入数据。
- 导入前页面内覆盖提醒，确认后才覆盖当前本地数据，取消则不导入。
- 恢复示例数据。
- 恢复示例数据前会弹出二次确认，确认后才重置，取消则不改变数据。

核心文件：

- `src/pages/SettingsPage.tsx`

## 2. 当前验证状态

最后一次完整自动验证已通过：

```bash
npm.cmd test
npm.cmd run build
```

结果：

- 17 个测试文件通过。
- 84 个测试通过。
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
- 库存、菜谱、今日页单位显示本地化
- Today 推荐理由和 warning 显示本地化
- 库存过期日期手动修改
- 菜谱编辑和内置菜谱删除持久化
- 自建菜谱刷新后保留在列表前面
- 恢复示例数据前的中英文二次确认
- 导入数据前的页面内确认和取消保护
- Today 顶部无框排版不会遮挡 Settings
- 底部 Today 主入口未选中/选中样式
- 三餐卡片图标分别为 Sunrise / Sun / Moon

## 3. Git 提交节点

当前分支：

```text
master
```

最近实现提交：

- `5231274` feat: improve today planning and fridge UI
- `73b1888` fix: protect settings data actions
- `5e7137a` feat: improve localization and recipe editing
- `16197b9` feat: localize built-in data and add readme
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

- 最后一次已提交版本 `5231274` 已推送到 GitHub。
- 当前待提交内容为 2026-08-12 的 Today UI 收尾：顶部无框排版、中文文案微调、底部 Today 主入口样式、三餐时间图标，以及对应测试和本文件更新。提交并推送后，应以最新 Git commit 为准。

## 3.1 2026-08-10 手动验收结果

已按实施计划中的 Demo 脚本跑过一轮主要路径：

- 本地服务可启动，地址为 `http://127.0.0.1:5173/`。
- 默认打开为英文界面。
- Inventory 初始库存显示为英文主数据。
- Inventory 可以添加英文食材，例如 `tomatoes`。
- Inventory 可以添加中文食材，例如 `鸡蛋`，并继续归一到英文 canonical name。
- 刷新页面后，新增库存仍可见。
- Recipes 可以创建自建菜谱，例如 `Test Rice`。
- 刷新页面后，自建菜谱仍可见。
- Today 可以生成早餐。
- 确认生成餐点后，库存会扣减。本次验收中 `Noodles` 从 `800g` 扣到 `700g`。
- 取消已确认餐点后，库存会恢复。本次验收中 `Noodles` 从 `700g` 恢复到 `800g`。
- Settings 的 reset sample data 可以恢复示例数据。
- Settings 的 import 可以导入有效 JSON，并用导入数据覆盖当前本地数据。

本轮验收发现：

- 示例库存日期固定在 2026-07-27 附近。到 2026-08-10 打开时，多数短保质期示例食材已经显示为 Expired，影响 Demo 第一眼观感和生成成功率。
- 2026-08-12 已修复：Today 生成的推荐理由和 warning 现在会按当前语言显示。
- Breakfast 可能生成 `Plain Noodles` 这类被标记为 `any` 的餐项，早餐体验不够合理。
- Settings 的 export data 在本轮 in-app browser 验收中没有捕捉到 download 事件，需要在真实浏览器里复查；如果真实浏览器也不下载，应修复导出实现。
- Settings 的 import 覆盖确认弹窗在自动化浏览器里没有可靠捕捉到，需要人工再看一眼。
- 移动端无明显横向溢出，但部分按钮高度为 40px，没有达到计划中的 44px 最小触控高度。

## 3.2 2026-08-12 本地化修复

本次修复内容：

- 英文界面下，Inventory 的单位不再显示中文单位，改为 `pcs`、`stems`、`bunches`、`bags` 等英文标签。
- 英文界面下，Recipes 的食材数量不再显示 `1个` 这类中英混排，改为 `1 pcs` 这类英文格式。
- 英文界面下，Today 的计划消耗数量不再显示中文单位。
- 英文界面下，Today 的推荐理由和 warning 不再显示 `补了蛋白质`、`生成基础餐`、`这餐蔬果偏少` 等中文文案。
- 简体中文界面下继续使用中文单位和中文推荐理由。

实现方式：

- 新增 `src/i18n/formatters.ts`，集中处理数量单位格式和 planner 消息显示。
- 保留内部 `Unit` 值为中文单位枚举，避免影响已有库存扣减、单位换算和历史数据。
- planner 内部暂时仍返回中文 reason key，显示层负责映射成当前语言；这是 Demo 阶段的轻量做法。

验证：

```bash
npm.cmd test -- tests/localizationDisplay.test.tsx
npm.cmd test
npm.cmd run build
```

结果：

- 新增 4 个本地化显示测试。
- 当前完整测试为 10 个测试文件、42 个测试全部通过。
- TypeScript 检查和 Vite 生产构建通过。

## 3.3 2026-08-12 库存和菜谱编辑能力

本次修复内容：

- Inventory 列表里的每个食材都可以直接修改过期日期。
- 用户修改过期日期后，系统会把 `expiryDate` 标记为用户指定值，并把 `expirySource` 改为 `user`。
- Recipes 列表里的每个菜谱都有编辑入口，可以修改菜谱名、类型、餐次、份数、食材比例、单位、必需项和营养标签。
- 内置菜谱和自建菜谱都可以删除。
- 删除内置菜谱后，会在 `settings.deletedBuiltInRecipeIds` 里记录 id；普通刷新不会把它自动补回来。
- 恢复示例数据仍会带回完整内置菜谱。

实现方式：

- `src/domain/inventory.ts` 新增 `updateIngredientExpiryDate()`。
- `src/domain/recipes.ts` 新增 `updateRecipeFromInput()`。
- `src/components/RecipeForm.tsx` 支持新增/编辑两种模式。
- `src/storage/appStorage.ts` 调整内置菜谱刷新策略：未编辑的旧内置菜谱仍可刷新，用户编辑过或删除过的内置菜谱会被保留。

验证：

```bash
npm.cmd test
npm.cmd run build
```

结果：

- 新增库存和菜谱编辑相关测试。
- 当前完整测试为 11 个测试文件、49 个测试全部通过。
- TypeScript 检查和 Vite 生产构建通过。

补充交互调整：

- 点击菜谱的 Edit 后，不再需要回到页面顶部修改。
- 该菜谱卡片内部会直接展开编辑表单。
- 顶部菜谱表单只用于新增菜谱。
- 已用页面级测试覆盖“编辑表单必须出现在被编辑菜谱卡片内部”。

补充 bug 修复：

- 问题：用户新增菜谱后，刷新 Recipes 页面会看起来像不存在了。
- 根因：`loadAppData()` 会刷新内置菜谱并重组 `recipes` 列表，之前的顺序是内置菜谱在前、自建菜谱在后。新建菜谱原本在顶部，刷新后被挪到列表底部，造成“丢失”的体验。
- 修复：刷新本地数据时改为自建菜谱在前，内置菜谱在后。
- 测试：新增 storage 测试覆盖“新建自建菜谱保存并重载后仍在列表顶部”；新增 App 级测试覆盖“从页面新增菜谱后重新打开 App 仍可看到”。
- 当前完整测试为 11 个测试文件、51 个测试全部通过。

补充设置页保护：

- 点击 Settings 的 Reset sample data / 恢复示例数据后，会先显示页面内确认弹窗。
- 英文界面提示：`Resetting sample data will erase all current local data. Continue?`
- 中文界面提示：`恢复示例数据会清除当前所有本地数据。是否继续？`
- 用户确认后才执行 `resetToSampleData()`；用户取消则不改变当前数据。
- 新增 Settings 页测试覆盖英文确认、英文取消、中文提示文案。
- 新增 App 级测试覆盖确认 reset 后仍可切换语言，以及中文界面 reset 后切回英文。
- 导入数据也改为页面内确认弹窗，不再使用浏览器原生确认框；确认后才解析并覆盖数据，取消则不改变当前数据。
- 新增 Settings 页测试覆盖英文导入确认、英文导入取消。
- 当前完整测试为 12 个测试文件、58 个测试全部通过。

## 3.4 2026-08-12 手动验收结果

用户已完成一轮当前版本手动测试，反馈“看起来没有什么大问题”。

本轮手动验收覆盖的重点可以视为：

- Inventory 刷新后数据仍保留。
- Recipes 新增菜谱刷新后仍保留。
- Reset sample data / 恢复示例数据会先显示页面内确认弹窗。
- Import data / 导入数据会先显示页面内确认弹窗。
- 执行 Reset 或 Import 并确认后，语言仍可以继续切换。
- 当前没有发现阻塞 Demo V1 继续推进的高优先级问题。

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

#### 双语化还没有完整覆盖底层业务文案

已完成主要界面文案切换、英文内置业务数据、单位显示本地化、Today 推荐理由显示本地化，但还没有完整覆盖：

- storage/domain 抛出的错误文案。
- 中文界面下，内置菜谱和示例食材仍显示英文主数据。

planner 内部目前仍使用中文 reason key，由显示层映射成当前语言。如果要做完整双语业务数据，后续应改为 `nameByLanguage` 或类似结构，并把 planner reason 改成稳定枚举 key，而不是继续复制两套数组或依赖中文字符串。

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

## 5. 下一步建议

### 5.1 第一优先级：提交并保留当前稳定点

当前 Demo V1 已经过一轮自动测试和用户手动验收。建议先提交并推送当前版本，把这个可运行状态固定下来。

### 5.2 第二优先级：补 UI 验收和修小体验

建议检查并改进：

- 小屏幕表单布局。
- 菜谱食材行是否太挤。
- 今日页生成失败时提示是否清楚。
- 单位不一致时的提示。
- 导入成功后显示页面内提示。
- storage/domain 错误提示的双语资源。
- planner reason 改成稳定枚举 key，替代当前显示层映射中文字符串的轻量方案。

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
