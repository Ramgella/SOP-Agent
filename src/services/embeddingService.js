/**
 * WEEK 1 — Embedding Service
 *
 * Uses Anthropic's Voyage AI embeddings (voyage-3) to convert text → vectors.
 * voyage-3 produces 1024-dimensional float vectors, ideal for semantic search.
 *
 * MongoDB Atlas Vector Search index must be configured for:
 *   field:      "embedding"
 *   dimensions: 1024
 *   similarity: "cosine"
 */

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Voyage AI model — best balance of quality and speed for RAG
const EMBEDDING_MODEL = 'voyage-3';

// Atlas Vector Search expects this exact dimension count
const EMBEDDING_DIM = 1024;

/**
 * Generate an embedding vector for a single text string.
 *
 * @param {string} text
 * @param {'document'|'query'} inputType
 * @returns {Promise<number[]>} 1024-dim float array
 */
async function embedText(text, inputType = 'document') {
  const response = await client.post('/v1/embeddings', {
    model: EMBEDDING_MODEL,
    input: text,
    input_type: inputType,
  });

  const vector = response.data?.[0]?.embedding;
  if (!vector || vector.length !== EMBEDDING_DIM) {
    throw new Error(`Unexpected embedding shape: got ${vector?.length}, expected ${EMBEDDING_DIM}`);
  }

  return vector;
}

/**
 * Batch-embed multiple texts.
 * Voyager supports up to 128 inputs per request; we chunk in batches of 96
 * to stay well within limits.
 *
 * @param {string[]} texts
 * @param {'document'|'query'} inputType
 * @returns {Promise<number[][]>} array of vectors, same order as input
 */
async function embedBatch(texts, inputType = 'document') {
  const BATCH_SIZE = 96;
  const allVectors = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const response = await client.post('/v1/embeddings', {
      model: EMBEDDING_MODEL,
      input: batch,
      input_type: inputType,
    });

    const vectors = response.data.map((item) => item.embedding);
    allVectors.push(...vectors);

    console.log(`  🔢 Embedded batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)} (${batch.length} chunks)`);
  }

  return allVectors;
}

module.exports = { embedText, embedBatch, EMBEDDING_DIM, EMBEDDING_MODEL };
