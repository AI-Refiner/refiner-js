import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export class RefinerLangchainClient {
  constructor() {}

  async getDocumentFromURL(url: string) {
    const loader = new CheerioWebBaseLoader(url);
    const doc = await loader.load();
    return doc;
  }

  async getDocumentFromPDF(pathOrBlob: string | Blob) {
    const loader = new PDFLoader(pathOrBlob);
    const splitDocs = await loader.loadAndSplit();
    return splitDocs;
  }

  async splitText(data: [], chunkSize = 500, chunkOverlap = 0) {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunkSize,
      chunkOverlap: chunkOverlap,
    });

    const splitDocs = await textSplitter.splitDocuments(data);
    return splitDocs;
  }
}
