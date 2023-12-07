import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { initPineconeClient } from './pinecone';
import ChainAudit from './models/ChainAuditsModel';
import mongoose from 'mongoose';

const CHUNK_OVERLAP = 100;
const CHUNK_SIZE = 2000;

async function updatePinecone() {
  const chainData = {
    id: '123',
    PINECONE_ENV: 'gcp-starter',
    PINECONE_API_KEY: 'a466a132-c382-4544-9b9d-5ba261b70f4c',
  };

  const pinecone = await initPineconeClient(chainData);
  const index = pinecone.Index('article');
  const directoryPath = 'CookBook'; // replace this with your path
  const loader = new DirectoryLoader(directoryPath, {
    '.sol': (path) => new TextLoader(path),
  });
  const docs = await loader.load();

  for (const doc of docs) {
    const txtPath = doc.metadata.source;
    const projectRoot =
      '/Users/urataps/Projects/forgenie/AI-smartcontract-generator/genezio-deploy/CookBook/';

    // Make the path relative
    const relativePath = txtPath.slice(projectRoot.length);

    console.log(`Processing document: ${relativePath}`);
    const text = doc.pageContent;
    console.log(`Text length: ${text.length}`);
    const textSplitter = RecursiveCharacterTextSplitter.fromLanguage('sol', {
      chunkOverlap: CHUNK_OVERLAP,
      chunkSize: CHUNK_SIZE,
    });

    const chunks = await textSplitter.createDocuments([text]);
    console.log(`Text split into ${chunks.length} chunks`);

    const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
      chunks.map((chunk) => chunk.pageContent.replace(/\n/g, ' '))
    );

    // Create and upsert vectors in batches of 100
    const batchSize = 100;
    let batch: any[] = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunkg nr ${i}...`);
      const chunk = chunks[i];
      const vector = {
        id: `${relativePath}-${i}`,
        values: embeddingsArrays[i],
        metadata: {
          ...chunk.metadata,
          loc: JSON.stringify(chunk.metadata.loc),
          content: chunk.pageContent,
        },
      };
      batch = [...batch, vector];
      if (batch.length === batchSize || i === chunks.length - 1) {
        console.log(`Upserting batch of ${batch.length} vectors...`);
        await index.upsert(batch);
        batch = [];
      }
    }
  }
}

(async () => {
  await mongoose.connect(process.env.MONGO_DB_URI || '').catch((error) => {
    console.log('Error connecting to the DB', error);
  });
  console.log('Creating LanceDB vector table..');
  await updatePinecone();
  console.log('Successfully created LanceDB vector table.');
})();
