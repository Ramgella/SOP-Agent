/**
 * WEEK 1 — Ingestion Pipeline Service
 *
 * Orchestrates the full ingestion flow for a single uploaded PDF:
 *   1. Parse PDF → extract raw text
 *   2. Chunk text (1000 chars, 100 overlap)
 *   3. Batch-embed all chunks via Voyage AI
 *   4. Store chunk documents (text + vector) in MongoDB Atlas
 *   5. Update parent SOPDocument status → "indexed"
 *
 * This is triggered automatically after a successful file upload.
 */

const fs            = require('fs');
const path          = require('path');
const SOPDocument   = require('../models/SOPDocument');
const SOPChunk      = require('../models/SOPChunk');
const { parsePDFAndChunk } = require('./pdfService');
const { embedBatch }       = require('./embeddingService');

/**
 * Run the full ingestion pipeline for a document that has already been
 * saved to disk and has a SOPDocument record in MongoDB.
 *
 * @param {string} documentId   - MongoDB _id of the SOPDocument
 * @param {string} filePath     - absolute path to the PDF on disk
 */
async function ingestDocument(documentId, filePath) {
  const doc = await SOPDocument.findById(documentId);
  if (!doc) throw new Error(`Document ${documentId} not found`);

  // Mark as processing so the client can poll status
  doc.status = 'processing';
  await doc.save();

  try {
    // ── Step 1 & 2: Parse PDF and chunk ──────────────────────────────────
    const fileBuffer = fs.readFileSync(filePath);
    const chunks     = await parsePDFAndChunk(fileBuffer, doc.originalName);

    if (chunks.length === 0) {
      throw new Error('No text chunks extracted — PDF may be image-only.');
    }

    // ── Step 3: Batch embed all chunk texts ───────────────────────────────
    console.log(`🔄 Embedding ${chunks.length} chunks for "${doc.originalName}"...`);
    const texts   = chunks.map((c) => c.text);
    const vectors = await embedBatch(texts, 'document');

    // ── Step 4: Delete any old chunks for this document (re-index case) ───
    await SOPChunk.deleteMany({ documentId });

    // ── Step 5: Build and insert chunk documents ──────────────────────────
    const chunkDocs = chunks.map((chunk, i) => ({
      documentId:  doc._id,
      source:      chunk.source,
      text:        chunk.text,
      chunkIndex:  chunk.chunkIndex,
      pageNumber:  chunk.pageNumber,
      embedding:   vectors[i],
    }));

    await SOPChunk.insertMany(chunkDocs, { ordered: false });

    // ── Step 6: Mark document as indexed ─────────────────────────────────
    doc.status      = 'indexed';
    doc.totalChunks = chunks.length;
    doc.indexedAt   = new Date();
    doc.errorMessage = null;
    await doc.save();

    console.log(`✅ Ingestion complete: "${doc.originalName}" → ${chunks.length} chunks stored`);
    return { success: true, totalChunks: chunks.length };

  } catch (err) {
    // Surface the error in the document record so the admin can see it
    doc.status       = 'failed';
    doc.errorMessage = err.message;
    await doc.save();
    console.error(`❌ Ingestion failed for "${doc.originalName}":`, err.message);
    throw err;
  }
}

module.exports = { ingestDocument };
