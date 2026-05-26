/**
 * WEEK 2 — Query Service
 *
 * End-to-end flow for answering an employee SOP question:
 *   1. Vector search → retrieve 3-5 relevant chunks
 *   2. Build context window (user query + chunks)
 *   3. Send to Claude claude-sonnet-4-20250514 → get cited answer
 *   4. Return answer + source citations to caller
 */

const Anthropic = require('@anthropic-ai/sdk');
const { vectorSearch, buildContextWindow } = require('./retrievalService');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Answer an employee query using the RAG pipeline.
 *
 * @param {string} userQuery
 * @returns {Promise<{
 *   answer: string,
 *   sources: Array<{ source: string, score: number, preview: string }>,
 *   chunksUsed: number
 * }>}
 */
async function answerQuery(userQuery) {
  if (!userQuery || userQuery.trim().length === 0) {
    throw new Error('Query cannot be empty.');
  }

  // ── Step 1: Retrieve relevant SOP chunks via vector search ──────────────
  const retrievedChunks = await vectorSearch(userQuery);

  if (retrievedChunks.length === 0) {
    return {
      answer: 'No relevant SOP documents were found for your question. Please contact your administrator to ensure the relevant policies have been uploaded.',
      sources: [],
      chunksUsed: 0,
    };
  }

  // ── Step 2: Build the context window prompt ──────────────────────────────
  const prompt = buildContextWindow(userQuery, retrievedChunks);

  // ── Step 3: Send to Claude for answer generation ─────────────────────────
  const response = await client.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages:   [{ role: 'user', content: prompt }],
  });

  const answer = response.content?.[0]?.text?.trim() || 'No answer generated.';

  // ── Step 4: Package source citations for the response ────────────────────
  const sources = retrievedChunks.map((chunk) => ({
    source:  chunk.source,
    score:   parseFloat((chunk.score || 0).toFixed(4)),
    preview: chunk.text.slice(0, 150) + (chunk.text.length > 150 ? '...' : ''),
  }));

  return {
    answer,
    sources,
    chunksUsed: retrievedChunks.length,
  };
}

module.exports = { answerQuery };
