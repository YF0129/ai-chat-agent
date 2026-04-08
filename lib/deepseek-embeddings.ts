import { Embeddings, EmbeddingsParams } from '@langchain/core/embeddings';

interface DeepSeekEmbeddingsParams extends EmbeddingsParams {
  apiKey: string;
  model?: string;
  baseURL?: string;
}

export class DeepSeekEmbeddings extends Embeddings {
  private apiKey: string;
  private model: string;
  private baseURL: string;

  constructor(params: DeepSeekEmbeddingsParams) {
    super(params);
    this.apiKey = params.apiKey;
    this.model = params.model || 'deepseek-embed'; // DeepSeek 嵌入模型名称
    this.baseURL = params.baseURL || 'https://api.deepseek.com/v1';
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    // 批量获取嵌入向量
    const embeddings = await Promise.all(texts.map(text => this.embedQuery(text)));
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    const url = `${this.baseURL}/embeddings`;
    console.log(`[Deepseek Embedding]请求URL: ${url}`);
    console.log(`使用模型：${this.model}`);
    // 调用 DeepSeek 嵌入 API
    const response = await fetch(`${this.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[deepseek embedding]请求失败(${response.status}):${errorText}`)
      throw new Error(`DeepSeek embedding failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }
}