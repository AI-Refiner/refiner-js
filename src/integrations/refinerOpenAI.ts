import { Configuration, OpenAIApi } from "openai";

export class RefinerOpenAIClient {
  openai: OpenAIApi;
  constructor(apiKey: string | undefined) {
    const configuration = new Configuration({ apiKey });
    this.openai = new OpenAIApi(configuration);
  }

  async createEmbeddings(payload: string) {
    const response = await this.openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: payload,
    });

    return response.data.data[0].embedding;
  }

  async createCompletion(payload) {
    const completion = await this.openai.createChatCompletion(payload, {
      responseType: "stream",
    });

    const stream = completion.data;

    return stream;
  }
}
