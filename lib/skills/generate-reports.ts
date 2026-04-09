// agent-skill 结合多个tools。生成一个报告
import { ragSearchTool } from '@/lib/tools/rag-search';
import { generateDocTool } from '@/lib/tools/generate-doc';
import { z } from 'zod';

export const generateReportSkill = {
  name: 'generate_report',
  description: `生成一份关于特定主题的详细报告，仅基于私有知识库内容。当用户要求“生成报告”、“做一份调研”、“整理资料”时使用。`,
  inputSchema: z.object({
    topic: z.string().describe('报告主题，例如 "手工皂制作方法"'),
  }),
  execute: async ({ topic }: { topic: string }) => {
    console.log(`[Skill] generate_report called with topic: ${topic}`);
    
    // 1. 知识库检索
    console.log('[Skill] 正在检索知识库...');
    const knowledgeResult = await ragSearchTool.execute!({ query: topic });
    const knowledgeSection = knowledgeResult !== '未找到相关文档。' 
      ? `## 知识库信息\n\n${knowledgeResult}` 
      : '## 知识库信息\n\n未找到相关内容。';

    // 2. 组合 Markdown 内容（不再包含联网搜索）
    const date = new Date().toLocaleString();
    const markdownContent = `# ${topic} 报告\n\n> 生成时间：${date}\n\n${knowledgeSection}\n\n---\n*报告由 AI Agent 基于私有知识库自动生成*`;

    // 3. 保存文档
    console.log('[Skill] 正在保存文档...');
    const saveResult = await generateDocTool.execute!({ 
      title: `${topic}_报告`, 
      content: markdownContent 
    });

    return {
      success: true,
      message: `报告已生成并保存。${saveResult}`,
      reportPath: saveResult,
    };
  },
};