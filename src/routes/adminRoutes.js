/**
 * Admin Routes — Knowledge Base Management
 *
 * POST   /api/admin/documents         — Upload a PDF → triggers ingestion pipeline
 * GET    /api/admin/documents         — List all uploaded documents + status
 * DELETE /api/admin/documents/:id     — Delete document and all its chunks
 *
 * All routes require: Authorization: Bearer <ADMIN_SECRET>
 */

const express        = require('express');
const path           = require('path');
const fs             = require('fs');
const router         = express.Router();
const adminAuth      = require('../middleware/adminAuth');
const { upload, UPLOAD_DIR } = require('../middleware/uploadMiddleware');
const SOPDocument    = require('../models/SOPDocument');
const SOPChunk       = require('../models/SOPChunk');
const { ingestDocument } = require('../services/ingestionService');

// ── POST /api/admin/documents ──────────────────────────────────────────────
// Upload a PDF and immediately kick off the ingestion pipeline (async).
router.post('/documents', adminAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded. Send a PDF as form-data field "file".' });
  }

  try {
    // Save document record
    const doc = await SOPDocument.create({
      originalName: req.file.originalname,
      filename:     req.file.filename,
      fileSize:     req.file.size,
      category:     req.body.category || 'General',
      status:       'uploaded',
    });

    // Fire-and-forget ingestion — client can poll GET /documents for status
    const filePath = path.join(UPLOAD_DIR, req.file.filename);
    ingestDocument(doc._id.toString(), filePath).catch((err) => {
      console.error('Background ingestion error:', err.message);
    });

    res.status(201).json({
      message:    'File uploaded. Ingestion pipeline started.',
      documentId: doc._id,
      status:     doc.status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/documents ───────────────────────────────────────────────
// List all documents with indexing status.
router.get('/documents', adminAuth, async (_req, res) => {
  try {
    const docs = await SOPDocument.find({}).sort({ createdAt: -1 }).lean();
    res.json({ total: docs.length, documents: docs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/admin/documents/:id ───────────────────────────────────────
// Delete a document and all its stored chunks.
router.delete('/documents/:id', adminAuth, async (req, res) => {
  try {
    const doc = await SOPDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });

    // Delete all chunks from Atlas
    const { deletedCount } = await SOPChunk.deleteMany({ documentId: doc._id });

    // Delete file from disk
    const filePath = path.join(UPLOAD_DIR, doc.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Delete document record
    await doc.deleteOne();

    res.json({
      message:       `Document "${doc.originalName}" and ${deletedCount} chunks deleted.`,
      chunksDeleted: deletedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/documents/:id/status ───────────────────────────────────
// Poll indexing status for a specific document.
router.get('/documents/:id/status', adminAuth, async (req, res) => {
  try {
    const doc = await SOPDocument.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    res.json({
      documentId:   doc._id,
      originalName: doc.originalName,
      status:       doc.status,
      totalChunks:  doc.totalChunks,
      indexedAt:    doc.indexedAt,
      errorMessage: doc.errorMessage,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
