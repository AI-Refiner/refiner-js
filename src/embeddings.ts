import * as dotenv from "dotenv";
import { RefinerOpenAIClient } from "./integrations/refinerOpenAI.js";
import { RefinerPineconeClient } from "./integrations/refinerPinecone.js";

interface PayloadItem {
  id: string;
  text: string;
  metadata: object;
}

export class Embeddings {
  private __openaiApiKey: string | undefined;
  private __pineconeApiKey: string | undefined;
  pineconeEnvironmentName: string | undefined;
  openaiADA200DefaultDimension: number;
  // Refiner class for creating, searching, updating, and deleting AI embeddings.
  // Embeddings are created using OpenAI. Uses Pinecone for storing and searching embeddings.

  constructor(
    configFile?: string | undefined,
    openAiApiKey?: string | undefined,
    pineconeApiKey?: string | undefined,
    pineconeEnvironmentName?: string | undefined
  ) {
    dotenv.config({ path: configFile });

    this.__openaiApiKey = openAiApiKey ?? process.env.OPENAI_API_KEY;
    this.__pineconeApiKey = pineconeApiKey ?? process.env.PINECONE_API_KEY;
    this.pineconeEnvironmentName =
      pineconeEnvironmentName ?? process.env.PINECONE_ENVIRONMENT_NAME;

    this.openaiADA200DefaultDimension = 1536;
  }

  __validateEnv() {
    // Validate that the environment variables are set.
    if (this.__openaiApiKey == undefined) {
      return {
        error: "OPENAI_API_KEY is not set.",
      };
    }

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

  async __validatePayload(payload: PayloadItem[]) {
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

  async create(payload: PayloadItem[], indexName: string, namespace?: string | undefined) {
    const validatedEnv = this.__validateEnv();
    if (validatedEnv && "error" in validatedEnv) {
      return validatedEnv;
    }

    const validatedPayload = await this.__validatePayload(payload);
    if (validatedPayload && "error" in validatedPayload) {
      return validatedPayload;
    }

    const pineconeClient = new RefinerPineconeClient(
      this.__pineconeApiKey as string,
      this.pineconeEnvironmentName as string
    );

    await pineconeClient.init();

    const openaiClient = new RefinerOpenAIClient(this.__openaiApiKey);

    let embeddings: number[];

    const vectors:{ id: string, values: number[], metadata: object }[] = [];

    const promises = payload.map(async (item:{id: string, text: string, metadata:object}) => {
      embeddings = await openaiClient.createEmbeddings(item.text);
      vectors.push({
        id: item.id ?? uuidv4(),
        values: embeddings,
        metadata: item.metadata,
      });
    });

    await Promise.all(promises);

    const stored = await pineconeClient.storeEmbeddings(
      vectors as [],
      indexName,
      namespace,
    );

    return stored;
  }

  async search(query: string, indexId: string, limit: string | number, namespace?: string | undefined) {
    const validatedEnv = this.__validateEnv();
    if (validatedEnv && "error" in validatedEnv) {
      return validatedEnv;
    }

    const pineconeClient = new RefinerPineconeClient(
      this.__pineconeApiKey as string,
      this.pineconeEnvironmentName as string
    );

    await pineconeClient.init();

    const openaiClient = new RefinerOpenAIClient(this.__openaiApiKey);
    const embeddings = await openaiClient.createEmbeddings(query);
    const results = await pineconeClient.search(
      embeddings as [],
      indexId,
      limit as number,
      namespace
    );

    return results;
  }
}
function uuidv4(): undefined {
  throw new Error("Function not implemented.");
}
