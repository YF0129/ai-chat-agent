import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { tool as aiTool } from 'ai';
import { z } from 'zod';

export interface McpTool {
  name: string;
  description: string;
  inputSchema: any;
}

export class McpClientManager {
  private clients: Map<string, { client: Client; transport: StdioClientTransport; tools: McpTool[] }> = new Map();

  async connect(name: string, command: string, args: string[] = []) {
    const transport = new StdioClientTransport({ command, args });
    const client = new Client(
      { name: `my-ai-agent-${name}`, version: '1.0.0' },
      { capabilities: {} }
    );
    await client.connect(transport);
    const toolsResult = await client.listTools();
    const tools = toolsResult.tools.map((tool: any) => ({
      name: `${name}__${tool.name}`, // 添加前缀避免冲突
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));
    this.clients.set(name, { client, transport, tools });
    // console.log(`MCP client "${name}" connected, found ${tools.length} tools:`, tools.map(t => t.name));
  }

  getAllTools(): McpTool[] {
    const allTools: McpTool[] = [];
    for (const { tools } of this.clients.values()) {
      allTools.push(...tools);
    }
    return allTools;
  }

  getAISdkTools() {
    const aiTools: Record<string, any> = {};

    for (const [serverName, { tools }] of this.clients.entries()) {
      for (const mcpTool of tools) {
        if (serverName === 'fetch' && mcpTool.name.endsWith('__fetch')) {
           // fetch 工具特殊处理
          aiTools[mcpTool.name] = aiTool({
            description: '获取指定 URL 的网页内容',
            inputSchema: z.object({
              url: z.string().url().describe('要获取的网页 URL'),
            }),
            execute: async (args: any) => {
              const serverArgs = { items: [{ url: args.url }] };
              const originalToolName = mcpTool.name.split('__')[1];
              return this.callTool(serverName, originalToolName, serverArgs);
            },
          });
        } else if (serverName === 'weather') {
          // inputSchema 格式有问题， 先硬编码解决 —— inp为 null
          if (mcpTool.name.endsWith('weather_forecast')) {
            aiTools['weather_forecast'] = aiTool({
              description: '获取指定城市的7天天气预报',
              inputSchema: z.object({
                city: z.string().describe('城市名称，如 "Beijing" 或 "Shanghai"'),
              }),
              execute: async (args: any) => {
                // 调用免费天气 API wttr.in
                const response = await fetch(`https://wttr.in/${encodeURIComponent(args.city)}?format=%C+%t+%w&m`);
                const weatherText = await response.text();
                return `${args.city} 的天气：${weatherText}`;
              },
            });
          } else if (mcpTool.name.endsWith('geocoding')) {
            aiTools['geocoding'] = aiTool({
              description: '将城市名转换为经纬度坐标',
              inputSchema: z.object({
                city: z.string().describe('城市名称'),
              }),
              execute: async (args: any) => {
                // 调用 open-meteo
                const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(args.city)}&count=1&language=zh&format=json`;
                const geoResp = await fetch(geoUrl);
                const geoData = await geoResp.json();
                if (geoData.results && geoData.results[0]) {
                  const { latitude, longitude, name } = geoData.results[0];
                  return `坐标：${name} (${latitude}, ${longitude})`;
                }
                return `未找到城市 "${args.city}" 的坐标`;
              },
            });
          }
        } else {
          // 其他服务器通用处理
          let inputSchema = mcpTool.inputSchema;
          if (!inputSchema || typeof inputSchema !== 'object') {
            inputSchema = { type: 'object', properties: {} };
          }
          aiTools[mcpTool.name] = aiTool({
            description: mcpTool.description,
            inputSchema: inputSchema,
            execute: async (args: any) => {
              const originalToolName = mcpTool.name.split('__')[1];
              return this.callTool(serverName, originalToolName, args);
            },
          });
        }
      }
    }
    return aiTools;
  }

  async callTool(serverName: string, toolName: string, args: any) {
    const server = this.clients.get(serverName);
    if (!server) throw new Error(`MCP server "${serverName}" not connected`);

    console.log(`[MCP] Calling ${serverName}.${toolName} with args:`, args);
    const result = await server.client.callTool({ name: toolName, arguments: args });
    console.log('[MCP] Full result:', JSON.stringify(result, null, 2));

    // 提取返回文本
    let fullText = '';
    if (result.content && Array.isArray(result.content)) {
      for (const item of result.content) {
        if (item.type === 'text') fullText += item.text + '\n';
        else if (item.type === 'resource' && item.resource?.text) fullText += item.resource.text + '\n';
        else fullText += JSON.stringify(item) + '\n';
      }
    } else if ( result.body ) { //针对fetch-mcp抓取的 非标准响应（直接返回html格式而非纯文本————提取body字段）
        fullText = typeof result.body === 'string'?result.body : JSON.stringify(result.body);
    } else if (typeof result.content === 'string') {
      fullText = result.content;
    } else {
      fullText = JSON.stringify(result);
    }

    //如果内容是HTML，简单去除标签，提取纯文本：
    if(fullText.trim().startsWith('<')) {
        fullText = fullText.replace(/<[^>]*>/g, '').replace(/\s+/g, '').trim();
    }
    if(!fullText.trim()) {
        fullText = '工具执行成功，但没有返回文本内容。'
    }
    // console.log(`[mcp] returning text (length ${fullText.length}):`, fullText.slice(0, 200));
    return fullText;
  }

  async disconnect() {
    for (const { client, transport } of this.clients.values()) {
      await client.close();
      await transport.close();
    }
    this.clients.clear();
  }
}

let mcpManager: McpClientManager | null = null;

export async function getMcpManager() {
  if (!mcpManager) {
    mcpManager = new McpClientManager();
    // 连接 fetch 服务器（注意：第一个参数是服务器名称——区分不同服务器）
    await mcpManager.connect('fetch', 'npx', ['@sylphlab/tools-fetch-mcp']);
    // 连接天气服务器
    await mcpManager.connect('weather', 'npx', ['open-meteo-mcp-server', 'open-meteo-mcp-server']);
  }
  return mcpManager;
}