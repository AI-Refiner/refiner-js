import * as dotenv from "dotenv";
import { RefinerPineconeClient } from "./integrations/refinerPinecone.js";

export class Indexes {
  private __pineconeApiKey: string | undefined;
  pineconeEnvironmentName: string | undefined;
  openaiADA200DefaultDimension: number;
  // Refiner class for creating indexes and storing embeddings.

  constructor(configFile: string | undefined, pineconeApiKey: string | undefined, pineconeEnvironmentName: string | undefined) {
    dotenv.config({ path: configFile });

    this.__pineconeApiKey = pineconeApiKey ?? process.env.PINECONE_API_KEY;
    this.pineconeEnvironmentName =
      pineconeEnvironmentName ?? process.env.PINECONE_ENVIRONMENT_NAME;

    this.openaiADA200DefaultDimension = 1536;
  }

  __validateEnv() {
    if (this.__pineconeApiKey == undefined) {
      return {
        error: "PINECONE_API_KEY is not set.",
      };
    }

    if (this.pineconeEnvironmentName == undefined) {
      return {
        error: "PINECONE_ENVIRONMENT_NAME is not set.",
      };
    }
  }

  async create(indexName: string, dimension = this.openaiADA200DefaultDimension) {
    const pineconeClient = new RefinerPineconeClient(
      this.__pineconeApiKey as string,
      this.pineconeEnvironmentName as string
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

  async describeIndex(indexName: string) {
    const pineconeClient = new RefinerPineconeClient(
      this.__pineconeApiKey as string,
      this.pineconeEnvironmentName as string
    );

    await pineconeClient.init();

    // check if index exists
    const indexes = await pineconeClient.client.listIndexes();

    if (!indexes.includes(indexName)) {
      return { error: "Index does not exist." };
    }

    const description = await pineconeClient.describeIndex(indexName);
    return description;
  }
}

