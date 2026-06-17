import mongoose from 'mongoose';
import Chunk from '../models/Chunk.js';

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Default retrieval strategy: pull the candidate chunks for this user
 * (optionally narrowed to specific documents) and rank them by cosine
 * similarity in Node. Works out of the box on any MongoDB Atlas free
 * tier cluster with no extra index configuration.
 */
async function retrieveByCosineSimilarity(userId, queryEmbedding, documentIds, topK) {
  const filter = { user: userId };
  if (documentIds?.length) {
    filter.document = { $in: documentIds };
  }

  const candidates = await Chunk.find(filter)
    .select('text pageNumber document embedding')
    .populate('document', 'originalName')
    .lean();

  const scored = candidates.map((chunk) => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}

/**
 * Optional retrieval strategy using MongoDB Atlas's native $vectorSearch
 * aggregation stage. Requires the vector index described in
 * atlas-vector-index.json to already exist on the chunks collection.
 */
async function retrieveByAtlasVectorSearch(userId, queryEmbedding, documentIds, topK) {
  const pipeline = [
    {
      $vectorSearch: {
        index: process.env.ATLAS_VECTOR_INDEX_NAME || 'vector_index',
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: Math.max(topK * 20, 100),
        limit: topK,
        filter: { user: new mongoose.Types.ObjectId(userId) },
      },
    },
    {
      $project: {
        text: 1,
        pageNumber: 1,
        document: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ];

  const results = await Chunk.aggregate(pipeline);

  // Hydrate document names for the citation list
  const withDocs = await Chunk.populate(results, { path: 'document', select: 'originalName' });

  let filtered = withDocs;
  if (documentIds?.length) {
    const allowed = new Set(documentIds.map(String));
    filtered = withDocs.filter((r) => allowed.has(String(r.document?._id)));
  }

  return filtered.map((r) => ({ chunk: r, score: r.score }));
}

/**
 * Finds the top-K most relevant chunks for a question.
 * @param {string} userId
 * @param {number[]} queryEmbedding
 * @param {string[]} documentIds - optional filter to only search specific documents
 * @param {number} topK
 */
export async function findRelevantChunks(userId, queryEmbedding, documentIds = [], topK = 5) {
  const useAtlasVectorSearch = process.env.USE_ATLAS_VECTOR_SEARCH === 'true';

  if (useAtlasVectorSearch) {
    try {
      return await retrieveByAtlasVectorSearch(userId, queryEmbedding, documentIds, topK);
    } catch (err) {
      console.error('Atlas $vectorSearch failed, falling back to cosine similarity:', err.message);
    }
  }

  return retrieveByCosineSimilarity(userId, queryEmbedding, documentIds, topK);
}
