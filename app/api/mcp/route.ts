import { NextRequest, NextResponse } from 'next/server';

const tools = [
  {
    name: "fetch",
    description: "获取指定 URL 的网页内容",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", format: "uri", description: "要获取的网页 URL" }
      },
      required: ["url"]
    }
  },
  {
    name: "weather_forecast",
    description: "获取指定城市的天气预报",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string", description: "城市名称，如 'Beijing' 或 'Shanghai'" }
      },
      required: ["city"]
    }
  }
];

async function handleToolCall(name: string, args: any) {
  if (name === "fetch") {
    const { url } = args;
    const res = await fetch(url);
    const html = await res.text();
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 3000);
    return { content: [{ type: "text", text: `网页内容摘要：${text}\n\n来源：${url}` }] };
  }
  if (name === "weather_forecast") {
    const { city } = args;
    const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=%C+%t+%w&m`);
    const weatherText = await res.text();
    return { content: [{ type: "text", text: `${city} 的天气：${weatherText}` }] };
  }
  throw new Error(`Unknown tool: ${name}`);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { method, params, id } = body;

  if (method === "tools/list") {
    return NextResponse.json({ tools, id });
  }
  if (method === "tools/call") {
    const { name, arguments: args } = params;
    const result = await handleToolCall(name, args);
    return NextResponse.json({ result, id });
  }
  return NextResponse.json({ error: { code: -32601, message: "Method not found" }, id }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({ tools: tools.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) });
}