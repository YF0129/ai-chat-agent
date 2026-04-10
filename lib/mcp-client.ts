import { tool as aiTool } from "ai";
import { z } from "zod";

let cachedAITools: Record<string, any> | null = null;

// 将 JSON Schema 转换为 Zod 对象的简化函数
function jsonSchemaToZod(schema: any): any {
  if (!schema || schema.type !== 'object') {
    return z.object({});
  }
  const shape: Record<string, any> = {};
  for (const [key, prop] of Object.entries(schema.properties || {})) {
    const p = prop as any;
    if (p.type === 'string') {
      let zodType = z.string();
      if (p.description) zodType = zodType.describe(p.description);
      if (schema.required?.includes(key)) shape[key] = zodType;
      else shape[key] = zodType.optional();
    }
    // 可以根据需要添加其他类型
  }
  return z.object(shape);
}

export async function getMcpManager() {
  if (!cachedAITools) {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://127.0.0.1:3000' 
      : 'https://yf-agent.top';
      
    const listRes = await fetch(`${baseUrl}/api/mcp`, { method: 'GET' });
    const { tools: toolList } = await listRes.json();
    
    const tools: Record<string, any> = {};
    for (const t of toolList) {
      const zodSchema = jsonSchemaToZod(t.inputSchema);
      tools[t.name] = aiTool({
        description: t.description || '',
        inputSchema: zodSchema,
        execute: async (args: any) => {
          const callRes = await fetch(`${baseUrl}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'tools/call',
              params: { name: t.name, arguments: args },
              id: 1
            })
          });
          const data = await callRes.json();
          const textContent = data.result?.content?.find((c: any) => c.type === 'text')?.text;
          return textContent || JSON.stringify(data);
        }
      });
    }
    cachedAITools = tools;
  }
  return { getAISdkTools: () => cachedAITools };
}