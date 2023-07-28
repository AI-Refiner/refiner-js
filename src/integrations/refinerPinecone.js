import { PineconeClient } from "@pinecone-database/pinecone";

export class RefinerPineconeClient {
  constructor(apiKey, environment) {
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

  async storeEmbeddings(
    payload,
    indexId,
    dimension,
    namespace = null,
    batchSize = null,
    poolThreads = null
  ) {
    const index = this.client.Index(indexId);
    const response = await index.upsert({
      upsertRequest: {
        vectors: [payload],
        namespace: namespace,
        dimension: dimension,
        batchSize: batchSize,
        poolThreads: poolThreads,
      },
    });
    return response;
  }

  async search(payload, indexId, limit, namespace = null) {
    const index = this.client.Index(indexId);

    const queryRequest = {
      topK: limit,
      vector: [payload],
      includeValues: true,
      includeMetadata: true,
    };

    const response = await index.query({ queryRequest });
    return response;
  }
}
