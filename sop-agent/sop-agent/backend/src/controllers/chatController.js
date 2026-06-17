import Document from '../models/Document.js';
import { embedText } from '../services/embeddingService.js';
import { findRelevantChunks } from '../services/vectorSearchService.js';
import { askGroq, FALLBACK_ANSWER } from '../services/groqService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function buildSources(results) {
  const seen = new Set();
  const sources = [];

  for (const { chunk } of results) {
    const documentId = String(chunk.document?._id || chunk.document);
    const key = `${documentId}-${chunk.pageNumber}`;
    if (seen.has(key)) continue;
    seen.add(key);

    sources.push({
      documentId,
      documentName: chunk.document?.originalName || 'Unknown document',
      pageNumber: chunk.pageNumber,
    });
  }

  return sources.sort((a, b) => a.documentName.localeCompare(b.documentName) || a.pageNumber - b.pageNumber);
}

export const askQuestion = asyncHandler(async (req, res) => {
  const { question, documentIds } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ message: 'A question is required' });
  }

  const readyDocCount = await Document.countDocuments({ user: req.user.id, status: 'ready' });

  if (readyDocCount === 0) {
    return res.json({ answer: FALLBACK_ANSWER, sources: [] });
  }

  const topK = Number(process.env.TOP_K_CHUNKS) || 5;

  const queryEmbedding = await embedText(question.trim());
  const results = await findRelevantChunks(req.user.id, queryEmbedding, documentIds, topK);

  if (!results.length) {
    return res.json({ answer: FALLBACK_ANSWER, sources: [] });
  }

  const contextChunks = results.map(({ chunk }) => ({
    text: chunk.text,
    pageNumber: chunk.pageNumber,
    documentName: chunk.document?.originalName || 'Unknown document',
  }));

  const answer = await askGroq(question.trim(), contextChunks);

  const isFallback = answer.trim().toLowerCase() === FALLBACK_ANSWER.toLowerCase();
  const sources = isFallback ? [] : buildSources(results);

  res.json({ answer, sources });
});
