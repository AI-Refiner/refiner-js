import * as dotenv from "dotenv";
import { RefinerOpenAIClient } from "./integrations/refinerOpenAI.js";
import { RefinerPineconeClient } from "./integrations/refinerPinecone.js";

export class Embeddings {
  // Refiner class for creating, searching, updating, and deleting AI embeddings.
  // Embeddings are created using OpenAI. Uses Pinecone for storing and searching embeddings.

  constructor(
    configFile,
    openAiApiKey,
    pineconeApiKey,
    pineconeEnvironmentName
  ) {
    dotenv.config({ path: configFile });

    this.__openaiApiKey = openAiApiKey || process.env.OPENAI_API_KEY;
    this.__pineconeApiKey = pineconeApiKey || process.env.PINECONE_API_KEY;
    this.pineconeEnvironmentName =
      pineconeEnvironmentName || process.env.PINECONE_ENVIRONMENT_NAME;

    this.openaiADA200DefaultDimension = 1536;
  }

  __validateEnv() {
    // Validate that the environment variables are set.
    if (!this.__openaiApiKey) {
      return {
        error: "OPENAI_API_KEY is not set.",
      };
    }

    if (!this.__pineconeApiKey) {
      return {
        error: "PINECONE_API_KEY is not set.",
      };
    }

    if (!this.pineconeEnvironmentName) {
      return {
        error: "PINECONE_ENVIRONMENT_NAME is not set.",
      };
    }
  }

  async __validatePayload(payload) {
    // Validate the payload is an array of objects with text
    if (!Array.isArray(payload)) {
      return {
        error: "Payload must be an array.",
      };
    }

    if (payload.length === 0) {
      return {
        error: "Payload must contain at least one item.",
      };
    }
  }

  async create(
    payload,
    indexName,
    dimension = this.openaiADA200DefaultDimension,
    namespace = null,
    poolThreads = null
  ) {
    const validatedEnv = this.__validateEnv();
    if (validatedEnv && "error" in validatedEnv) {
      return validatedEnv;
    }

    const validatedPayload = await this.__validatePayload(payload);
    if (validatedPayload && "error" in validatedPayload) {
      return validatedPayload;
    }

    const pineconeClient = new RefinerPineconeClient(
      this.__pineconeApiKey,
      this.pineconeEnvironmentName
    );

    await pineconeClient.init();

    // check if index exists and create if it doesn't
    const indexes = await pineconeClient.client.listIndexes();

    if (!indexes.includes(indexName)) {
      console.log(`creating index: ${indexName}`);
      const createRequest = {
        name: indexName,
        dimension: dimension,
        metric: "cosine",
      };
      const createResponse = await pineconeClient.client.createIndex({
        createRequest,
      });
      console.log(createResponse);
      console.log(
        "Index is being created... Please wait 30 seconds before trying to store embeddings."
      );
      return true;
    }

    const openaiClient = new RefinerOpenAIClient(this.__openaiApiKey);

    let embeddings;

    let vectors = [];

    const promises = payload.map(async (item) => {
      embeddings = await openaiClient.createEmbeddings(item.text);
      vectors.push({
        id: item.id || uuidv4(),
        values: embeddings,
        metadata: item.metadata,
      });
    });

    await Promise.all(promises);

    const stored = await pineconeClient.storeEmbeddings(
      vectors,
      indexName,
      namespace,
      poolThreads
    );

    return vectors, stored;
  }

  async search(query, indexId, limit, namespace = null) {
    const validatedEnv = this.__validateEnv();
    if (validatedEnv && "error" in validatedEnv) {
      return validatedEnv;
    }

    const pineconeClient = new RefinerPineconeClient(
      this.__pineconeApiKey,
      this.pineconeEnvironmentName
    );

    await pineconeClient.init();

    const openaiClient = new RefinerOpenAIClient(this.__openaiApiKey);
    const embeddings = await openaiClient.createEmbeddings(query);
    const results = await pineconeClient.search(
      embeddings,
      indexId,
      limit,
      namespace
    );

    return results;
  }
}
