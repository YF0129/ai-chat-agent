//RAG检索工具
import { tool } from 'ai';
import { z } from 'zod';
import { getVectorStore } from '@/lib/vector-store';

export const ragSearchTool = tool({
  description: '从私有知识库中检索与查询相关的内容。当需要回答关于知识库内容的问题时，可以使用此工具。',

  inputSchema: z.object({
    query: z.string().describe('用户问题或需要检索的关键词'),
  }),

  execute: async ({ query }) => {
    console.log(`[Tool] ragSearch called with query: ${query}`);
    try {
      const vectorStore = await getVectorStore();
      const results = await vectorStore.similaritySearch(query, 3);
      console.log(`[Tool] ragSearch retrieved ${results.length} results!!!`);
      if (!results.length) {
        console.log('未找到文档');
        return '未找到相关文档。';
      }

      //加上检索数
      const referenceItems = results.map((doc, idx) => `[${idx + 1}] ${doc.pageContent}`).join('\n\n');
      return referenceItems;
    } catch (error) {
      console.error('ragSearch error:', error);
      return '检索知识库时出错，请稍后再试。';
    }
  },
});
