// 后端
import { streamText, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { NextRequest } from 'next/server';
import { generateDocTool, ragSearchTool } from '@/lib/tools';
import { getMcpManager } from '@/lib/mcp-client';
import { generateReportSkill } from '@/lib/skills/generate-reports';
import { tool } from 'ai';

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: 'https://api.deepseek.com/v1',
  compatibility: 'strict',
});

//这里放本地工具：
const localTools = {
  ragSearch: ragSearchTool,
  generateDoc: generateDocTool,
  generate_report: tool(generateReportSkill) //注册skill
};

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // 转换前端消息格式
    const modelMessages = [
      {
        role: 'system',
        content: `你是智能助手，拥有以下工具：
          1. ragSearch：检索私有知识库中的信息（如肥皂制作步骤）。参数：query（字符串）。
          2. generateDoc：将对话内容保存为 Markdown 文档。参数：title（文档标题），content（Markdown 正文）。
          3. fetch__fetch：获取指定 URL 的网页内容。参数：url（字符串，以 http:// 或 https:// 开头）。
          4. weather_forecast：获取指定城市的未来天气预报（7天）。参数：city（字符串，例如 "Beijing" 或 "上海"）。
          5. geocoding：将城市名转换为经纬度坐标（辅助工具，一般不需要单独调用）。参数：city（字符串）。
          6. generate_report： 生成包含知识库和实时信息的报告（参数： topic, includeWebSearch）。
          使用规则：
            - 当用户要求“生成报告”或“做调研”时，请优先使用此技能。
            - 当用户询问私有知识库内容时，优先使用 ragSearch。
            - 当用户要求保存内容为文档时，使用 generateDoc。
            - 当用户需要获取实时网页信息（如新闻、特定页面内容）时，使用 fetch__fetch。
            - 当用户询问天气时，直接使用 weather_forecast 并传入城市名（无需先调用 geocoding）。
            - 对于普通常识、数学计算、翻译等问题，请直接利用你自己的知识回答，无需调用工具。

          回答要自然、有帮助。`,
      },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: typeof msg.content === 'string'
          ? msg.content
          : msg.parts?.find((p: any) => p.type === 'text')?.text || '',
      })),
    ];

    //获取MCP 客户端， 并提取成AI SDK工具
    const mcpManager = await getMcpManager();
    const mcpTools = mcpManager.getAISdkTools();
    const allTools = {...localTools, ...mcpTools};
    

    const stream = createUIMessageStream({
      async execute({ writer }) {
        let currentMessages = [...modelMessages];
        let round = 0;
        const MAX_ROUNDS = 5;

        while (true && round < MAX_ROUNDS) {
          round++;
          console.log(`\n=== Agent Round ${round} ===`);

          // 调用模型，允许使用工具
          const result = await streamText({
            model: deepseek('deepseek-chat'),
            messages: currentMessages,
            tools: allTools, //合并后的工作tools
            temperature: 0.7,
          });

          // 将本次调用的所有流式事件合并到最终的 UI 流中
          // AI SDK 会自动生成符合规范的
          writer.merge(result.toUIMessageStream());

          // 获取本次调用产生的完整消息（包含 assistant 和 tool 消息）
          const responseMessages = (await result.response).messages;

          // 检查是否有工具调用
          const hasToolCalls = responseMessages.some((msg: any) => {
            if(msg.role !== 'assistant') return false;
            return msg.content.some((part: any) => part.type === 'tool-call');
          });
          
          if (!hasToolCalls) {
            // 没有工具调用，说明模型已给出最终答案，结束循环
            break;
          }

          // 有工具调用：将本次产生的消息追加到历史，然后继续循环让模型基于工具结果生成回答！
          currentMessages = [...currentMessages, ...responseMessages];
        }
        if(round >= MAX_ROUNDS) {
          console.log('max rounds reached, breaking loop to avoid infinite calls');
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    // console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}