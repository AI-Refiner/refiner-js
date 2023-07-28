# refiner-js

About The Refiner Javascript package can be used to convert and store text and metadata as vector embeddings. Embeddings are generated using OpenAI and stored as vectors in Pinecone. Stored embeddings can then be "queried" using the search method. Matched embeddings contain contextually relevant metadata.

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

```node
import { Embeddings } from "@ai-refiner/refiner-js";
const embeddings = Embeddings("/path/to/.env");
```

Your .env file should follow key/value format:

```shell
PINECONE_API_KEY="API_KEY"
PINECONE_ENVIRONMENT_NAME="ENV_NAME"
OPENAI_API_KEY="API_KEY"
```

## Create Embeddings

```node
const embeddings = new Embeddings("/path/to/.env");
embeddings.create({ id: "2", text: "hello" }, "test-index");
// {'upserted_count': 1}
```

## Semantic Search

```node
const embeddings = Embeddings("/path/to/.env");
const limit = 10;
embeddings.search("hello", "test-index", limit);
// {'matches': [...]}
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
