# refiner-js

The [Refiner](https://www.npmjs.com/package/@ai-refiner/refiner-js) Javascript package can be used to convert and store text and metadata as vector embeddings. Embeddings are generated using OpenAI and stored as vectors in Pinecone. Stored embeddings can then be "queried" using the search method. Matched embeddings contain contextually relevant metadata.

## Installation

```shell
npm install @ai-refiner/refiner-js
```

## OpenAI and Pinecone API Keys.

You'll need API keys for OpenAI and Pinecone.

Once you have your API keys, you can either set local ENV variables in a shell:

```shell
export PINECONE_API_KEY="API_KEY"
export PINECONE_ENVIRONMENT_NAME="ENV_NAME"
export OPENAI_API_KEY="API_KEY"
```

or you can create a `.env` (dotenv) config file and pass in the file path when initializing the Embeddings class:

```typescript
import { Embeddings } from "@ai-refiner/refiner-js";
const embeddings = new Embeddings("/path/to/.env");
```

Your .env file should follow key/value format:

```shell
PINECONE_API_KEY="API_KEY"
PINECONE_ENVIRONMENT_NAME="ENV_NAME"
OPENAI_API_KEY="API_KEY"
```

## Create Index

```typescript
const indexes = new Indexes("./.env");
const index = await indexes.createIndex("new-index");
// creating index: new-index

// Index is being created... Please wait 30 seconds before trying to store embeddings.
// { success: true }
```

## Create Embeddings

```typescript
const embeddings = new Embeddings("/path/to/.env");
const payload: PayloadItem[] = [
  { id: "1", text: "hello world", metadata: { key: "value" } },
];
embeddings.create(payload, "test-index");
// {'upserted_count': 1}
```

## Semantic Search

```typescript
const embeddings = new Embeddings("/path/to/.env");
const limit = 10;
embeddings.search("hello", "test-index", limit);
// {'matches': [...]}
```

## Loaders - getDocumentFromURL

```typescript
// Get web page content from a URL and create a document.
let loaders = new Loaders();
let data = await loaders.getDocumentFromURL("https://news.yahoo.com/");
// [
//  Document {
//    pageContent:
```

## Loaders - getDocumentFromPDF

```typescript
// Get web page content from a PDF filepath or blob and create a document.
let path = "/path/to/PDF/example.pdf";
let data = await loader.getDocumentFromPDF(path);
//  Document {
//    pageContent:
```

## Transformers

```typescript
// Split the document text and create embeddings
const embeddings = new Embeddings("/path/to/.env");
let transformers = new Transformers();
let texts = await transformers.splitText(data);
let vectors = [] as any;
texts.map(async (item, index) => {
    // remove loc from metadata. It's not needed and throws a PineconeError when used.
    if ("loc" in item.metadata) delete item.metadata.loc;

    let vector = {
        id: `id-${index}`,
        text: item.pageContent,
        metadata: { ...item.metadata, pageContent: item.pageContent },
    };

    vectors.push(vector);
});
const created = await embeddings.create(vectors, "test-index");
// { upsertedCount: 251 }
...
```

## Document Chatbot Example

```typescript
// Ask the document questions. Format a Q/A style prompt.
// Stream the completion results
const question = "What are the headlines of todays news?";

let results = await embeddings.search(question, "test-index", 10);
const openaiClient = new RefinerOpenAIClient("OPENAI_API_KEY");

const document = results.matches.map((m) => m.metadata?.pageContent).join("\n");

const prompt = `
  Q: ${question}\n
  Using this document answer the question as a friendly chatbot that knows about the details in the document.
  You can answer questions only with the information in the documents you've been trained on.
  ${document}\n
  A:
  `;

const payload = {
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "user",
      content: prompt,
    },
  ],
  stream: true,
};

const stream = await openaiClient.createCompletion(payload);

stream.on("data", (chunk) => {
  const payloads = chunk.toString().split("\n\n");
  for (const payload of payloads) {
    if (payload.includes("[DONE]")) return;
    if (payload.startsWith("data:")) {
      const data = JSON.parse(payload.replace("data: ", ""));
      try {
        const chunk = data.choices[0].delta?.content;
        if (chunk) {
          console.log(chunk);
        }
      } catch (error) {
        console.log(`Error with JSON.parse and ${payload}.\n${error}`);
      }
    }
  }
});

stream.on("end", () => {
  setTimeout(() => {
    console.log("\n");
  }, 10);
});

stream.on("error", (err) => {
  console.log(err);
});
```

## CLI

You can install the [CLI](https://pypi.org/project/refiner-cli/) to `create` and `search` your vectors.

```shell
pip install refiner-cli
```

The --help option can be used to learn about the create and search commands.

```shell
refiner --help
refiner create --help
refiner search --help
```
