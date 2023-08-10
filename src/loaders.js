import { RefinerLangchainClient } from "./integrations/refinerLangchain.js";
export class Loaders {
  constructor() {
    this.loader = new RefinerLangchainClient();
  }

  async getDocumentFromUrl(url) {
    let doc = await this.loader.getDocumenFromUrl(url);
    return doc;
  }
}
