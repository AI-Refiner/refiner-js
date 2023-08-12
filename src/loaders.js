import { RefinerLangchainClient } from "./integrations/refinerLangchain.js";
export class Loaders {
  constructor() {
    this.loader = new RefinerLangchainClient();
  }

  async getDocumentFromURL(url) {
    let doc = await this.loader.getDocumentFromURL(url);
    return doc;
  }

  async getDocumentFromPDF(pathOrBlob) {
    let doc = await this.loader.getDocumentFromPDF(pathOrBlob);
    return doc;
  }
}
