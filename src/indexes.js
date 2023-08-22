import * as dotenv from "dotenv";
import { RefinerPineconeClient } from "./integrations/refinerPinecone.js";

export class Indexes {
  // Refiner class for creating indexes and storing embeddings.

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
    //
  }

  async createIndex(indexName, dimension = this.openaiADA200DefaultDimension) {
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
      return { success: true };
    }
    return { error: "Index already exists." };
  }
}
