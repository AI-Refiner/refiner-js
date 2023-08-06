import { PineconeClient } from "@pinecone-database/pinecone";

function* chunks(iterable, batch_size) {
  // A helper function to break an iterable into chunks of size batch_size.
  let it = iterable[Symbol.iterator]();
  let chunk = Array.from({ length: batch_size }, () => it.next().value);
  // check for array full of undefined

  while (chunk.length > 0 && chunk[0] !== undefined) {
    yield chunk;
    chunk = Array.from({ length: batch_size }, () => it.next().value);
  }
}

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
    batchSize = null,
    poolThreads = null
  ) {
    let index = this.client.Index(indexId, {
      pool_threads: poolThreads,
    });

    if (batchSize) {
      const _chunks = chunks(vectors.values, batchSize);

      // Send requests in parallel
      const async_results = await Promise.all(
        Array.from(_chunks, async (ids_vectors_chunk) => {
          ids_vectors_chunk.forEach(function (value, i) {
            if (value === undefined) {
              ids_vectors_chunk[i] = 0;
            }
          });
          const vector = [
            {
              id: vectors.id,
              values: ids_vectors_chunk,
              metadata: vectors.metadata,
            },
          ];
          const upsertRequest = {
            vectors: vector,
            namespace: namespace,
            async_req: true,
          };
          return await index.upsert({
            upsertRequest,
          });
        })
      );

      return async_results;
    }

    const upsertRequest = {
      vectors: [vectors],
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
      includeValues: true,
      includeMetadata: true,
    };

    const response = await index.query({ queryRequest });
    return response;
  }
}
