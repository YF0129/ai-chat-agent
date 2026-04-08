// lib/tools/generate-doc.ts
import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

export const generateDocTool = tool({
  description:
    '将用户要求的对话内容或信息整理成 Markdown 格式的文档，并保存到服务器的本地目录。当用户要求“保存为文档”、“生成笔记”、“导出对话”时使用。',
  inputSchema: z.object({
    title: z.string().describe('文档标题，应简洁明了'),
    content: z.string().describe('Markdown 格式的文档正文内容'),
  }),
  execute: async ({ title, content }) => {
    console.log(`[Tool] generateDoc called with title: ${title}`);
    try {
      // 定义文档存储目录（项目根目录下的 generated-docs）
      const docsDir = path.join(process.cwd(), 'generated-docs');
      await fs.mkdir(docsDir, { recursive: true }); // 确保目录存在

      // 生成安全的文件名：去除特殊字符，限制长度，添加时间戳前缀
      const safeTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').slice(0, 50);
      const timestamp = Date.now();
      const filename = `${timestamp}_${safeTitle}.md`;
      const filePath = path.join(docsDir, filename);

      // 构建完整的 Markdown 内容——添加元信息
      const fullContent = `# ${title}\n\n> 生成时间：${new Date().toLocaleString()}\n\n${content}\n\n---\n*由 AI Agent 自动生成*`;

      await fs.writeFile(filePath, fullContent, 'utf-8');
      console.log(`[Tool] Document saved: ${filePath}`);

      // 返回给模型的友好信息——模型会据此告知用户
      return `文档已成功保存为 Markdown 文件，文件路径：${filePath}`;
    } catch (error) {
      console.error('[Tool] generateDoc error:', error);
      return '保存文档时出错，请稍后再试。';
    }
  },
});