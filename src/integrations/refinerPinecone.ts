import { PineconeClient, Vector } from "@pinecone-database/pinecone";

export class RefinerPineconeClient {
  private __apiKey: string;
  environment: string;
  client: PineconeClient;
  constructor(apiKey: string, environment: string) {
    this.__apiKey = apiKey;
    this.environment = environment;

    this.init();
  }

  async init() {
    this.client = new PineconeClient();

    await this.client.init({
      apiKey: this.__apiKey,
      environment: this.environment,
    });
  }

  async describeIndex(indexId) {
    const description = await this.client.describeIndex({ indexName: indexId });
    return description;
  }

  async createIndex(indexId, dimension = 1536) {
    const index = await this.client.createIndex({
      createRequest: {
        name: indexId,
        dimension: dimension,
      },
    });
    return index;
  }

  async storeEmbeddings(
    vectors: Vector[],
    indexId: string,
    namespace: string | undefined
  ) {
    const index = this.client.Index(indexId);

    const upsertRequest = {
      vectors: vectors,
      namespace: namespace,
    };

    const response = await index.upsert({
      upsertRequest,
    });

    return response;
  }

  async search(vectors: [], indexId: string, limit: number, namespace: string | undefined) {
    const index = this.client.Index(indexId);

    const queryRequest = {
      topK: limit,
      vector: vectors,
      namespace: namespace,
      includeValues: false,
      includeMetadata: true,
    };

    const response = await index.query({ queryRequest });
    return response;
  }
}
