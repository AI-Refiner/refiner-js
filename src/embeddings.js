import * as dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
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

  __validatePayload(payload) {
    // Validate the payload.
    if (!payload.text) {
      return {
        error: "Payload must contain a text attribute",
      };
    }
    if (!Array.isArray(payload.text) && typeof payload.text !== "string") {
      return {
        error: "Text must be a string or an array of strings.",
      };
    }

    // check is metadata is an object
    if (payload.metadata && typeof payload.metadata !== "object") {
      return {
        error: "Payload metadata must be an object.",
      };
    }
  }

  async create(
    payload,
    indexName,
    dimension = this.openaiADA200DefaultDimension,
    namespace = null,
    batchSize = null,
    poolThreads = null
  ) {
    const validatedEnv = this.__validateEnv();
    if (validatedEnv && "error" in validatedEnv) {
      return validatedEnv;
    }

    const validatedPayload = this.__validatePayload(payload);
    if (validatedPayload && "error" in validatedPayload) {
      return validatedPayload;
    }

    const openaiClient = new RefinerOpenAIClient(this.__openaiApiKey);

    const embeddings = await openaiClient.createEmbeddings(payload.text);

    const pineconeClient = new RefinerPineconeClient(
      this.__pineconeApiKey,
      this.pineconeEnvironmentName
    );

    await pineconeClient.init();

    // only create index if it doesn't exist
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
      return;
    }

    const vector = {
      id: payload.id || uuidv4(),
      values: embeddings,
      metadata: payload.metadata || null,
    };

    const stored = await pineconeClient.storeEmbeddings(
      vector,
      indexName,
      namespace,
      batchSize,
      poolThreads
    );
    console.log(vector.id, stored);

    return vector.id, stored;
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

    console.log(results);
    return results;
  }
}
