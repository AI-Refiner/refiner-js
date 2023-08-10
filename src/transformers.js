import { RefinerLangchainClient } from "./integrations/refinerLangchain.js";
export class Transformers {
  constructor() {
    this.loader = new RefinerLangchainClient();
  }

  async splitText(data, chunkSize = 500, chunkOverlap = 0) {
    let doc = await this.loader.splitText(data, chunkSize, chunkOverlap);
    return doc;
  }
}
