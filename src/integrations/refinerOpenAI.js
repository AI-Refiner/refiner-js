import { Configuration, OpenAIApi } from "openai";

export class RefinerOpenAIClient {
  constructor(apiKey) {
    const configuration = new Configuration({ apiKey });
    this.openai = new OpenAIApi(configuration);
  }

  async createEmbeddings(text) {
    const response = await this.openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text,
    });

    return response;
  }
}
