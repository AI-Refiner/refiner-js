import { RefinerLangchainClient } from "./integrations/refinerLangchain.js";
export class Transformers {
  loader: RefinerLangchainClient;
  constructor() {
    this.loader = new RefinerLangchainClient();
  }

  async splitText(data: object, chunkSize = 500, chunkOverlap = 0) {
    const doc = await this.loader.splitText(data, chunkSize, chunkOverlap);
    return doc;
  }
}
