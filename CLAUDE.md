# CLAUDE.md - 前端 (Next.js + TypeScript)

## 1. 项目身份
你是前端开发专家，正在协助开发 "Multi-Agent 智能调研与知识库助手" 的前端界面。

## 2. 技术栈
- **框架**: Next.js 16 (App Router) + TypeScript
- **样式**: Tailwind CSS 4（纯 Tailwind，无额外 UI 库依赖）
- **字体**: 系统字体栈 `Inter, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui`
- **AI 交互**: Vercel AI SDK v6 (useChat + DefaultChatTransport)
- **渲染**: ReactMarkdown + remarkGfm + rehypeHighlight
- **部署**: Vercel (自动部署)

## 3. 项目结构
```
app/
├── layout.tsx                # 根布局（BackgroundOrbs + TopBar + Main + FloatingDock）
├── globals.css               # 设计 token（CSS 变量）+ 全局样式 + 动画
├── page.tsx                  # AI 对话页（全屏沉浸，玻璃输入框，神经节点欢迎动画）
├── knowledge/
│   └── page.tsx              # 知识库管理（全宽玻璃卡片网格 + 上传/删除）
├── reports/
│   └── page.tsx              # 报告中心（玻璃左面板 + 右侧 Markdown 预览）
├── dashboard/
│   └── page.tsx              # 数据中心（玻璃占位）
├── settings/
│   └── page.tsx              # 系统设置（玻璃占位）
└── chat-bubble.tsx           # 浮动 Dify 聊天窗口
components/
├── theme-provider.tsx        # ThemeProvider context（light/dark 切换 + localStorage 持久化）
├── top-bar.tsx               # 48px 全局玻璃顶栏（Logo + 页面标题 + 在线状态 + 主题切换）
├── floating-dock.tsx         # 底部悬浮玻璃导航胶囊（5 图标，激活展开标签）
└── background-orbs.tsx       # 动态轨道球背景（3 颗浮动渐变球 + 点阵纹理）
```

## 4. 核心功能
- **悬浮指挥中心布局**: 48px 顶栏 + 全屏内容 + 底部悬浮玻璃 Dock，无传统侧边栏
- **底部 Dock 导航**: 5 个图标胶囊，激活项白色高亮 + 展开文字标签 + 顶部指示点
- **AI 对话页（/）**: 全屏沉浸式，流式 Markdown + 代码高亮 + 工具调用展示 + 玻璃搜索条输入框
- **动态背景**: 3 颗 indigo/violet/sky 大型模糊渐变球体浮动 + 径向遮罩点阵纹理
- **全局玻璃拟态**: 顶栏 `blur(12px)`、Dock `blur(24px)`、输入框 `blur(20px)`、页面卡片 `backdrop-blur-sm`
- **暗黑模式**: `components/theme-provider.tsx` 管理，`dark` class + Tailwind `dark:` 变体，CSS 变量双套 token，localStorage 持久化
- **知识库管理（/knowledge）**: 全宽响应式卡片网格、文件类型图标、hover 操作按钮
- **报告中心（/reports）**: 左侧玻璃列表面板 + 右侧 Markdown 实时预览
- **通信方式**: fetch 调用后端 API (http://localhost:8000 或 fly.io 线上地址)

## 5. 设计规范
- **配色**: slate 中性灰 + indigo-500 主色调（亮），slate-900 深底 + indigo-400（暗）
- **暗黑 Token**: 背景 `#0b1120`、玻璃 `rgba(15,23,42,0.65-0.85)`、边框 `slate-700/50`
- **玻璃拟态**: `backdrop-filter: blur(12-24px)` + CSS 变量 `--glass-*`（双模式 token）
- **圆角**: sm(6px) / md(8px) / lg(12px) / xl(16px) / 2xl(20px)
- **阴影**: 三层梯度（sm/md/lg），带 indigo 色调
- **微交互**: `active:scale-95` 按压反馈、`hover:scale-110` 图标放大、`group-hover` 显示操作按钮
- **动画**: `animate-fade-in` 页面淡入、`animate-spin` 轨道环旋转、`animate-ping` 脉冲、`animate-bounce` 思考点
- **欢迎图标**: 神经节点 — 外层脉冲 (3s) + 双轨道环 (8s/12s 正反转) + 3 光点 + indigo→violet 渐变核心星形
- **布局间距**: 顶栏 48px → `pt-12`，底部 Dock → `pb-20`

## 6. 关键配置
- **环境变量**: NEXT_PUBLIC_API_URL（本地 .env.local，生产 Vercel 控制台）
- **跨域**: 后端 FastAPI 已配置 CORS，前端无需处理
- **流式协议**: AI SDK v6 的 UI Message Stream (text-start → text-delta → text-end)

## 7. 开发原则
- 代码风格: TypeScript 最佳实践，Tailwind 原子化样式
- 状态管理: useChat 管理对话状态，useState 管理 UI 状态
- 组件组织: `components/` 目录存放全局共享组件（TopBar、FloatingDock、BackgroundOrbs）
- 页面路由: Next.js App Router 文件路由，每个功能独立目录
- 页面无独立 Header: 所有页面标题由全局 TopBar 统一管理，页面只渲染内容区
- 样式复用: CSS 自定义属性（`globals.css` 中的设计 token）
- 不引入额外依赖: 纯 Tailwind + 原生 SVG 图标，不依赖 shadcn/ui、Framer Motion
- 功能逻辑零改动: 布局和样式变更不影响任何现有 API 调用逻辑

## 8. 当前状态
P0 布局重构 + 视觉升级 + 悬浮指挥中心 + 暗黑模式已完成（2026-08-06）。
- 悬浮指挥中心布局就绪（TopBar + Full Content + FloatingDock）
- 5 个路由全部可用（`/` `/knowledge` `/reports` `/dashboard` `/settings`）
- 全局玻璃拟态 + 动态轨道球背景 + 微交互
- 暗黑模式：ThemeProvider + CSS 变量双套 token + localStorage 持久化
- AI 对话、知识库管理、报告中心三大核心页面可用
- 数据中心、系统设置页面待开发
- 构建通过（0 TypeScript 错误）
