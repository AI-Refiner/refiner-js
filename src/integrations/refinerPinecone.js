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
    vectors,
    indexId,
    namespace = null,
    poolThreads = null
  ) {
    let index = this.client.Index(indexId, {
      pool_threads: poolThreads,
    });

    const upsertRequest = {
      vectors: vectors,
      namespace: namespace,
    };

    const response = await index.upsert({
      upsertRequest,
    });

    return response;
  }

  async search(vectors, indexId, limit, namespace = null) {
    const index = this.client.Index(indexId);

    const queryRequest = {
      topK: limit,
      vector: [vectors],
      namespace: namespace,
      includeValues: false,
      includeMetadata: true,
    };

    const response = await index.query({ queryRequest });
    return response;
  }
}
