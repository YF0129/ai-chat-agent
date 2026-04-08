import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { DeepSeekEmbeddings } from './deepseek-embeddings';
import { readFile } from 'fs/promises';
import path from 'path';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';

let cachedVectorStore: MemoryVectorStore | null = null;
// let cachedVectorStore: PineconeStore | null = null; //使用外部向知识库时候

export async function getVectorStore() {
  if (cachedVectorStore) {
    return cachedVectorStore;
  }

  // 1. 从外部文件读取知识库内容
  const filePath = path.join(process.cwd(), 'knowledge', 'soap_recipt.txt');
  let knowledgeText: string;
  try{
    knowledgeText = await readFile(filePath, 'utf-8');
  } catch(error) {
    // console.error('读取知识库文件失败！', error);
    //如果文件不存在，可以使用默认内容（或者抛出错误）
    knowledgeText = '以下为默认知识库内容。。。。。。';
  }

  // 2. 切分文档（分成多个小块，便于检索）
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 200,     
    chunkOverlap: 50,    // 重叠   连贯性
  });
  //注意 新版本langchain1.x往上的createDocuments接收document对象数组，而不是直接传文本！：
  const docs = [new Document({ pageContent: knowledgeText})];
  //将文本对象切分
  const splitDocs = await splitter.createDocuments([knowledgeText]);

//   //初始化Pinecone客户端
//   const pinecone = new PineconeClient({
//     apiKey: process.env.PINECONE_API_KEY!,
//     environment: process.env.PINECONE_ENVIRONMENT!,
//   })
//   const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

// 硅基流动    嵌入模型
const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.SILICONFLOW_API_KEY,
    model: 'BAAI/bge-large-zh-v1.5',
    configuration: {
        baseURL: 'https://api.siliconflow.cn/v1' //硅基API地址
    }
})

//   // Pinecone的 向量存储
//   cachedVectorStore = await PineconeStore.fromDocuments(docs, embeddings, {
//     pineconeIndex: Index,
//     namespace: 'handmade_sopa'
//   })

  // 创建内存向量存储
  cachedVectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
  console.log(`向量存储初始化完成，共 ${docs.length} 个文档块`);

  return cachedVectorStore;
}