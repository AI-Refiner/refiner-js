import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export class RefinerLangchainClient {
  constructor() {}

  async getDocumenFromUrl(url) {
    const loader = new CheerioWebBaseLoader(url);
    const doc = await loader.load();
    return doc;
  }

  async splitText(data, chunkSize = 500, chunkOverlap = 0) {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunkSize,
      chunkOverlap: chunkOverlap,
    });

    const splitDocs = await textSplitter.splitDocuments(data);
    return splitDocs;
  }
}
