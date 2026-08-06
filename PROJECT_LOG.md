# 项目演进日志

## 2026-08-06 — P0：页面整体布局与导航重构 + 视觉升级 + 悬浮指挥中心

### 背景
原有项目为单页面应用（`app/page.tsx`），所有功能（聊天、知识库文件管理、报告列表、清空对话）全部堆砌在一个页面的侧边栏中，缺乏信息层级，无法扩展更多页面。

### 设计调研
**阶段一：布局参考**
- **coleam00/agentic-chat-application-template** — 可折叠侧边栏 + 深蓝主题 + shadcn/ui
- **vercel/ai-chatbot** — 极简侧边导航 + 干净排版
- **Chat_Mate (jaykaynation)** — 多主题变体 + Framer Motion 动画
- **Linear / Vercel / Notion 设计语言** — 低饱和度配色、大留白、微妙阴影

**阶段二：视觉趋势**
- **Dribbble/Behance** 2025 AI Chat 界面 — Glassmorphism（玻璃拟态）为主流
- **TemporalUI / Beautiful UI** — Gradient Orb Mesh 动态轨道球背景
- **v0.app ChatGPT Clone** — 微交互动画（`active:scale-95`）

**阶段三：布局创新**
- 经过侧边栏 → 用户反馈"中规中矩" → 设计四个备选方案 → 选定「悬浮指挥中心」
- 核心理念：去侧边栏化，全屏沉浸式内容 + 底部悬浮玻璃导航

### 演进过程

| 版本 | 布局 | 导航方式 | 状态 |
|------|------|----------|------|
| v0 (原始) | 单页面内嵌侧边栏 | 左侧内容面板 | 已废弃 |
| v1 | Sidebar(56→240px) + Main | 左侧图标栏 hover 展开 | 已废弃 |
| v2 (当前) | TopBar(48px) + Full Content + FloatingDock | 底部悬浮玻璃胶囊 | **当前** |

### 关键决策

1. **不引入新依赖** — 纯 Tailwind CSS 实现所有组件，无 shadcn/ui、Framer Motion
2. **多页面架构** — Next.js App Router 文件路由，每个功能独立目录
3. **悬浮指挥中心布局** — 去侧边栏，48px 极简顶栏 + 全屏内容 + 底部玻璃 Dock
4. **底部 Dock 导航** — 5 个图标胶囊，激活项展开标签 + 指示点，类似 macOS Dock
5. **配色方案** — slate 中性灰 + indigo-500 主色调，低饱和度专业风格
6. **全场景玻璃拟态** — 顶栏 `blur(12px)`、Dock `blur(24px)`、输入框 `blur(20px)`、卡片 `backdrop-blur-sm`
7. **动态轨道球背景** — 3 颗 indigo/violet/sky 大型模糊渐变球体持续浮动 + 径向遮罩点阵
8. **微交互** — `active:scale-95` 按压反馈、`hover:scale-110` 图标放大、神经节点欢迎动画
9. **系统字体** — 因 Google Fonts 不可达，改用 `Inter / -apple-system` 字体栈
10. **功能逻辑零改动** — 所有 API 调用（useChat、上传、删除、下载）保持原样

### 最终改动清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `components/top-bar.tsx` | **新增** | 48px 玻璃顶栏，Logo + 页面标题 + 在线状态 |
| `components/floating-dock.tsx` | **新增** | 底部悬浮玻璃导航胶囊，5 图标 + 激活展开 |
| `components/background-orbs.tsx` | **新增** | 3 颗动态浮动轨道球 + 点阵纹理背景 |
| `components/sidebar.tsx` | **删除** | 被 TopBar + FloatingDock 取代 |
| `app/layout.tsx` | **重写** | BackgroundOrbs + TopBar + Main(pt-12 pb-20) + FloatingDock |
| `app/page.tsx` | **重构** | 全屏沉浸式聊天：移除 Header，玻璃搜索条 Input，神经节点欢迎动画 |
| `app/knowledge/page.tsx` | **重构** | 全宽布局，玻璃卡片网格，移除独立 Header |
| `app/reports/page.tsx` | **重构** | 玻璃左面板 + Markdown 预览，移除独立 Header |
| `app/dashboard/page.tsx` | **重构** | 居中玻璃占位，移除独立 Header |
| `app/settings/page.tsx` | **重构** | 居中玻璃占位，移除独立 Header |
| `app/globals.css` | **重写** | 设计 token（CSS 变量）+ 全局样式 + 滚动条 + 动画 |

### 验证结果
- ✅ `npm run build` 编译成功，8 个路由全部正常
- ✅ 5 个页面路由全部 200 响应
- ✅ Dock 导航 `usePathname()` 路由高亮正确
- ✅ 聊天功能完整保留（useChat + ReactMarkdown + 流式渲染 + 工具调用展示）
- ✅ 上传/删除/下载 API 逻辑不变
- ✅ 0 TypeScript 编译错误

---

## 2026-08-06 — P1：暗黑模式

### 背景
布局和视觉系统就绪后，暗黑模式是投入产出比最高的单项优化。玻璃拟态在深色背景下效果惊艳，且暗色 UI 是 2025 AI 产品的主流选择。

### 实现方案
- **ThemeProvider** (`components/theme-provider.tsx`)：React Context 管理 light/dark 状态
- **持久化**：localStorage 存储用户选择，首次加载跟随 `prefers-color-scheme`
- **切换**：`dark` class on `<html>` + Tailwind `dark:` 变体
- **过渡**：`transition-colors duration-300` 保证全局平滑切换

### 暗黑设计 Token
```
背景:   #0b1120 (bg-primary)
玻璃:   rgba(15,23,42,0.65-0.85) (顶栏/Dock/输入框)
文字:   slate-200 (主) / slate-400 (辅) / slate-500 (弱)
边框:   slate-700/50
主色:   indigo-400 (略亮于亮色模式的 indigo-500)
轨道球: 降低透明度 (0.25/0.2/0.15)，避免过亮
点阵:   略微增强透明度 (0.025 → 0.04)
```

### 改动清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `components/theme-provider.tsx` | **新增** | ThemeProvider context + useTheme hook |
| `app/globals.css` | **修改** | `.dark` 下全部 CSS 变量翻转 + glass token |
| `app/layout.tsx` | **修改** | ThemeProvider 包裹 + body 暗色过渡 |
| `components/top-bar.tsx` | **修改** | 新增 太阳/月亮 切换按钮 |
| `components/floating-dock.tsx` | **修改** | 全元素 `dark:` 变体 |
| `components/background-orbs.tsx` | **修改** | 暗黑轨道球双重渲染（透明度分层） |
| `app/page.tsx` | **修改** | 全量 `dark:` 变体 |
| `app/knowledge/page.tsx` | **修改** | 全量 `dark:` 变体 |
| `app/reports/page.tsx` | **修改** | 全量 `dark:` 变体 |
| `app/dashboard/page.tsx` | **修改** | 占位页暗黑适配 |
| `app/settings/page.tsx` | **修改** | 占位页暗黑适配 |

### 验证结果
- ✅ `npm run build` 编译成功，8 routes 全部正常
- ✅ 亮/暗切换平滑无闪烁
- ✅ localStorage 持久化正常
- ✅ 所有玻璃拟态组件双模式可用
