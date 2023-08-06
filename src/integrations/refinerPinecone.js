import { PineconeClient } from "@pinecone-database/pinecone";

// function* chunks(iterable, batch_size = 100) {
//   // A helper function to break an iterable into chunks of size batch_size.
//   let it = iterable[Symbol.iterator]();
//   let chunk = Array.from({ length: batch_size }, () => it.next().value);
//   // check for array full of undefined

//   while (chunk.length > 0 && chunk[0] !== undefined) {
//     yield chunk;
//     chunk = Array.from({ length: batch_size }, () => it.next().value);
//   }
// }

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
    let index = this.client.Index(indexId);

    // if poolThreads is set, then include in index instantiation
    if (vectors.values.length && poolThreads) {
      index = this.client.Index(indexId, {
        pool_threads: poolThreads,
      });

      // TODO: this uses the default dimension size of 1536, the index is created with 1536. the batch size will be what ever the
      // the user passes in but we are seeing an error stating the embeddings size needs to match the index dimension size.

      // const minDimension = 1536; // todo: make this configurable, needs to match pinecone index dimension size(?)
      // const _chunks = chunks(vectors.values, minDimension);

      // // Send requests in parallel
      // const async_results = await Promise.all(
      //   Array.from(_chunks, async (ids_vectors_chunk) => {
      //     let vector = {
      //       id: vectors.id || uuidv4(),
      //       values: ids_vectors_chunk,
      //       metadata: vectors.metadata || null,
      //     };
      //     let upsertRequest = {
      //       vectors: [vector],
      //       namespace: namespace,
      //     };
      //     console.log(upsertRequest);
      //     return await index.upsert({
      //       upsertRequest,
      //     });
      //   })
      // );

      //   // Wait for and retrieve responses (this raises in case of error)
      // const responses = await Promise.allSettled(
      //   async_results.map((asyncResult) => asyncResult?.get?.())
      // );
      // const validResponses = responses
      //   .filter((response) => response.status === "fulfilled")
      //   .map((response) => response.value);
      // return validResponses[0];
    }

    // // if bartchSize is set, then chunk the vectors into batches
    // if (vectors.values.length && batchSize) {
    //   const _chunks = chunks(payload, batchSize);

    //   // Send requests in parallel
    //   const async_results = await Promise.all(
    //     Array.from(_chunks, async (ids_vectors_chunk) => {
    //       return await index.upsert({
    //         upsertRequest: {
    //           vectors: ids_vectors_chunk,
    //           namespace: namespace,
    //           async_req: true,
    //         },
    //       });
    //     })
    //   );

    //   // Wait for and retrieve responses (this raises in case of error)
    //   const responses = await Promise.allSettled(
    //     async_results.map((asyncResult) => asyncResult?.get?.())
    //   );
    //   const validResponses = responses
    //     .filter((response) => response.status === "fulfilled")
    //     .map((response) => response.value);
    //   return validResponses[0];
    // }

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
