import { pipeline } from '@huggingface/transformers';

// NOTE: Groq only serves chat/completion models, it does not offer an
// embeddings endpoint. To keep this project free and self-contained we
// generate embeddings locally with Transformers.js (runs on CPU, no API
// key, no network calls after the model is downloaded once).
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2'; // 384-dimensional sentence embeddings

let extractorPromise = null;

function getExtractor() {
  if (!extractorPromise) {
    console.log(`Loading embedding model "${MODEL_NAME}" (first time only)...`);
    extractorPromise = pipeline('feature-extraction', MODEL_NAME);
  }
  return extractorPromise;
}

/**
 * Generates one embedding per input string.
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export async function embedTexts(texts) {
  if (!texts.length) return [];
  const extractor = await getExtractor();
  const output = await extractor(texts, { pooling: 'mean', normalize: true });
  return output.tolist();
}

/**
 * Convenience helper for embedding a single piece of text (e.g. a user question).
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function embedText(text) {
  const [embedding] = await embedTexts([text]);
  return embedding;
}

/** Pre-loads the model so the first real request isn't slowed down by the download. */
export async function warmUpEmbeddingModel() {
  await getExtractor();
  console.log('Embedding model ready.');
}
