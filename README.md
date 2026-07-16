一个基于 多 Agent 协作 的智能调研与知识库助手。用户只需输入一个调研主题或上传私有文档，系统自动调度多个 AI Agent 完成：任务拆解 → 知识库检索 → 联网搜索 → 数据分析 → 报告撰写 → 邮件发送。支持私有知识库（PDF/文档上传并持久化到向量数据库），全程流式输出，各 Agent 的工作过程透明可见。

技术栈： Next.js 16 + FastAPI + LangChain + Chroma + DeepSeek + Railway + Vercel

核心亮点：

· 多 Agent 角色分工与协作编排
· 私有知识库 RAG（文档上传 → 向量化 → 持久化检索）
· 自动调研 → 生成 Markdown 报告 → 邮件发送
· 流式输出，Agent 思考过程实时展示
· 前后端分离，Python 处理全部 AI 逻辑