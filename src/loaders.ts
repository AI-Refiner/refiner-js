import { RefinerLangchainClient } from "@/integrations/refinerLangchain";
export class Loaders {
  loader: RefinerLangchainClient;
  constructor() {
    this.loader = new RefinerLangchainClient();
  }

  async getDocumentFromURL(url: string) {
    const doc = await this.loader.getDocumentFromURL(url);
    return doc;
  }

  async getDocumentFromPDF(pathOrBlob: string | Blob) {
    const doc = await this.loader.getDocumentFromPDF(pathOrBlob);
    return doc;
  }
}
