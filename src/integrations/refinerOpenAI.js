import { Configuration, OpenAIApi } from "openai";

export class RefinerOpenAIClient {
  constructor(apiKey) {
    const configuration = new Configuration({ apiKey });
    this.openai = new OpenAIApi(configuration);
  }

  async createEmbeddings(payload) {
    const response = await this.openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: payload,
    });

    return response.data.data[0].embedding;
  }
}
