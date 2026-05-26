/**
 * WEEK 2 — Retrieval & Context Window Service
 *
 * Two responsibilities:
 *
 *  A) vectorSearch()
 *     Runs the MongoDB Atlas $vectorSearch aggregation pipeline to find the
 *     top-K most semantically similar chunks to a user query.
 *     Returns 3-5 chunks with their source citations and similarity scores.
 *
 *  B) buildContextWindow()
 *     Merges the user's raw query with the retrieved SOP chunks into a
 *     structured prompt string that Claude uses to generate a cited answer.
 *     This is the "Context Window Logic" step from Week 2.
 */

const SOPChunk      = require('../models/SOPChunk');
const { embedText } = require('./embeddingService');

// How many chunks to retrieve — spec says 3-5
const TOP_K = 5;

// Atlas Vector Search index name (must match what you create in Atlas UI)
const VECTOR_INDEX_NAME = 'sop_vector_index';

/**
 * WEEK 2 — Vector Search
 *
 * Embeds the user query, then runs the Atlas $vectorSearch aggregation
 * pipeline to retrieve the TOP_K most relevant SOP chunks.
 *
 * Required Atlas Search Index (create via Atlas UI or API):
 * {
 *   "fields": [{
 *     "type": "vector",
 *     "path": "embedding",
 *     "numDimensions": 1024,
 *     "similarity": "cosine"
 *   }]
 * }
 *
 * @param {string} userQuery
 * @param {number} k  - number of results (default TOP_K = 5)
 * @returns {Promise<Array<{ text, source, score, documentId, chunkIndex }>>}
 */
async function vectorSearch(userQuery, k = TOP_K) {
  // 1. Embed the query using the same model used for documents
  const queryVector = await embedText(userQuery, 'query');

  // 2. Run Atlas $vectorSearch aggregation pipeline
  const results = await SOPChunk.aggregate([
    {
      $vectorSearch: {
        index:       VECTOR_INDEX_NAME,
        path:        'embedding',
        queryVector: queryVector,
        numCandidates: k * 10, // search wider candidate pool for accuracy
        limit:       k,
      },
    },
    {
      // Project only the fields we need; exclude the large embedding array
      $project: {
        _id:         1,
        documentId:  1,
        source:      1,
        text:        1,
        chunkIndex:  1,
        pageNumber:  1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]);

  return results;
}

/**
 * WEEK 2 — Context Window Logic
 *
 * Builds the final prompt by merging:
 *   - The retrieved SOP chunks (each labelled with its source)
 *   - The user's original question
 *
 * The format is designed to:
 *   1. Force Claude to cite sources for every claim
 *   2. Restrict Claude to ONLY information present in the chunks
 *   3. Prevent hallucination by explicit instruction
 *
 * @param {string} userQuery
 * @param {Array<{ text, source, score }>} retrievedChunks
 * @returns {string} full prompt string ready to send to Claude
 */
function buildContextWindow(userQuery, retrievedChunks) {
  if (!retrievedChunks || retrievedChunks.length === 0) {
    return `No relevant SOP sections were found for the query: "${userQuery}"`;
  }

  // Format each chunk with a numbered label and its source citation
  const chunkBlock = retrievedChunks
    .map((chunk, i) =>
      `[CONTEXT ${i + 1}]\nSource: ${chunk.source}\n---\n${chunk.text}`
    )
    .join('\n\n');

  // The full context window prompt
  const prompt = `You are OpsMind AI, an expert assistant for company Standard Operating Procedures (SOPs).

INSTRUCTIONS:
- Answer ONLY based on the SOP context provided below.
- For every claim you make, cite the exact source in parentheses, e.g. (Source: Refund Policy — Chunk 3).
- If the answer is not found in the provided context, say: "This information is not covered in the available SOP documents."
- Do NOT hallucinate, guess, or use any knowledge outside the provided context.
- Be concise, accurate, and professional.

--- SOP CONTEXT START ---
${chunkBlock}
--- SOP CONTEXT END ---

EMPLOYEE QUESTION:
${userQuery}

ANSWER (with source citations):`;

  return prompt;
}

module.exports = { vectorSearch, buildContextWindow, TOP_K, VECTOR_INDEX_NAME };
