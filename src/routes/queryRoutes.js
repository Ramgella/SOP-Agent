/**
 * Query Routes — Employee SOP Q&A
 *
 * POST /api/query   — Ask a question; get a cited answer from SOP documents
 *
 * Body: { "question": "How do I process a refund?" }
 *
 * Response: {
 *   answer:     "According to the Refund Policy...",
 *   sources:    [{ source, score, preview }],
 *   chunksUsed: 5
 * }
 */

const express      = require('express');
const router       = express.Router();
const { answerQuery } = require('../services/queryService');

router.post('/', async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'Request body must include a non-empty "question" string.' });
  }

  try {
    const result = await answerQuery(question.trim());
    res.json(result);
  } catch (err) {
    console.error('Query error:', err.message);
    res.status(500).json({ error: 'Failed to process query. ' + err.message });
  }
});

module.exports = router;
