import OpenAI from 'openai';
import { ChatCompletionCreateParams, EmbeddingCreateParams } from 'openai/resources';

export class RefinerOpenAIClient {
  openai: OpenAI;
  constructor(apiKey: string | undefined) {
    this.openai = new OpenAI({ apiKey });
  }

  async createEmbeddings(payload: EmbeddingCreateParams) {
    const response = await this.openai.embeddings.create(payload as EmbeddingCreateParams);

    return response.data[0].embedding;
  }

  async createCompletion(payload: ChatCompletionCreateParams) {
    const completion = await this.openai.chat.completions.create(payload as ChatCompletionCreateParams);
    return completion;
  }
}
