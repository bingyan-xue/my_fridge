# My Fridge

My Fridge is a local-first meal planning demo. You record what is in your fridge or pantry, and the app suggests meals for today based on your current inventory, expiry dates, and a few lightweight nutrition rules.

中文：My Fridge 是一个本地优先的餐点规划 Demo。你先记录家里有什么食材，它会根据库存、过期时间和简单营养规则，帮你随机生成今天可以吃什么。

## What it does

This demo focuses on one everyday problem: deciding what to cook from food you already have.

Current features:

- Add, edit, and delete ingredients in Inventory.
- Track quantity, unit, storage location, and expiry status.
- Use default shelf life rules when the user does not enter an expiry date.
- Prioritize ingredients that are expiring soon.
- Browse built-in recipes and create your own recipes.
- Generate breakfast, lunch, or dinner from available inventory.
- Confirm a planned meal only when you actually cook it.
- Deduct inventory after confirmation.
- Cancel a confirmed meal and restore the deducted inventory.
- Export and import local data as JSON.
- Switch the interface between English and Simplified Chinese.

## Current demo scope

My Fridge is not trying to be a full kitchen management system yet. The current version is meant to test whether inventory-driven meal suggestions are useful.

The app stores data in your browser with `localStorage`. There is no account system, cloud sync, shopping list, photo recognition, receipt scanning, or AI recipe generation in this demo.

## Tech stack

- React
- TypeScript
- Vite
- Vitest
- Testing Library
- localStorage
- Web App Manifest

## Run locally

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm.cmd run dev
```

Open:

```text
http://127.0.0.1:5173/
```

Run tests:

```bash
npm.cmd test
```

Build for production:

```bash
npm.cmd run build
```

## Project docs

- Product requirements: `docs/my-fridge-demo-prd.md`
- Product requirements in English: `docs/my-fridge-demo-prd.en.md`
- Architecture: `docs/my-fridge-demo-arch.md`
- Architecture in English: `docs/my-fridge-demo-arch.en.md`
- Current project state: `docs/project_state.md`
- Implementation plan: `docs/superpowers/plans/2026-07-27-my-fridge-demo.md`

## Known limitations

- Data is saved only in the current browser.
- Existing Today meal snapshots may keep older names if they were generated before the built-in recipe data changed.
- Recommendation reasons and some domain error messages are not fully localized yet.
- The planner uses simple rule-based scoring. It does not calculate calories or detailed nutrition.
- Built-in recipes and sample data are still small.

---

# My Fridge 中文说明

My Fridge 是一个“先看家里有什么，再决定吃什么”的小工具。它不是让你从无限菜谱里挑，而是从冰箱和储物柜里已有的食材出发，尽量优先消耗快过期的东西。

## 它能做什么

当前 Demo 已经支持：

- 在库存页添加、修改和删除食材。
- 记录数量、单位、储存位置和过期状态。
- 用户没有填写过期日时，用默认保鲜时长推算。
- 随机生成餐点时，优先考虑快过期食材。
- 查看内置菜谱，也可以创建自己的菜谱。
- 分别生成早餐、午餐或晚餐。
- 生成结果只是计划，不会立刻扣库存。
- 用户确认真的做了这顿饭以后，才扣减库存。
- 取消已确认餐点时，恢复之前扣掉的库存。
- 导出和导入本地 JSON 数据。
- 在英文和简体中文界面之间切换。

## 当前 Demo 范围

这个版本主要验证一个想法：如果软件从已有库存出发推荐餐点，能不能减少每天“不知道吃什么”的时间，同时帮用户少浪费食物。

当前数据只保存在浏览器的 `localStorage` 里。Demo 暂时不做账号、云同步、购物清单、拍照识别、小票识别或 AI 生成菜谱。

## 技术栈

- React
- TypeScript
- Vite
- Vitest
- Testing Library
- localStorage
- Web App Manifest

## 本地运行

安装依赖：

```bash
npm install
```

启动本地开发服务：

```bash
npm.cmd run dev
```

打开：

```text
http://127.0.0.1:5173/
```

运行测试：

```bash
npm.cmd test
```

生产构建：

```bash
npm.cmd run build
```

## 项目文档

- 产品需求：`docs/my-fridge-demo-prd.md`
- 英文产品需求：`docs/my-fridge-demo-prd.en.md`
- 架构文档：`docs/my-fridge-demo-arch.md`
- 英文架构文档：`docs/my-fridge-demo-arch.en.md`
- 当前项目状态：`docs/project_state.md`
- 实施计划：`docs/superpowers/plans/2026-07-27-my-fridge-demo.md`

## 已知限制

- 数据只保存在当前浏览器里。
- 如果 Today 页面里的餐点是在内置菜谱改成英文前生成的，旧餐点快照可能还会保留旧名称。
- 推荐理由和部分领域错误提示还没有完整双语化。
- 生成逻辑目前是简单规则打分，不做卡路里或精确营养计算。
- 内置菜谱和示例数据还比较少。
