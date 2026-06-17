import fs from 'fs';
import Document from '../models/Document.js';
import Chunk from '../models/Chunk.js';
import { extractTextByPage } from '../services/pdfService.js';
import { chunkPages } from '../services/chunkService.js';
import { embedTexts } from '../services/embeddingService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const EMBEDDING_BATCH_SIZE = 16;

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No PDF file was uploaded' });
  }

  const document = await Document.create({
    user: req.user.id,
    originalName: req.file.originalname,
    storedFileName: req.file.filename,
    filePath: req.file.path,
    fileSize: req.file.size,
    status: 'processing',
  });

  try {
    const { totalPages, pages } = await extractTextByPage(req.file.path);
    const rawChunks = chunkPages(pages);

    if (!rawChunks.length) {
      document.status = 'failed';
      document.errorMessage =
        'No extractable text was found. The PDF may be scanned images without a text layer.';
      await document.save();
      return res.status(201).json({ document });
    }

    // Generate embeddings in batches so we don't hand the model
    // hundreds of strings at once.
    const embeddings = [];
    for (let i = 0; i < rawChunks.length; i += EMBEDDING_BATCH_SIZE) {
      const batch = rawChunks.slice(i, i + EMBEDDING_BATCH_SIZE).map((c) => c.text);
      const batchEmbeddings = await embedTexts(batch);
      embeddings.push(...batchEmbeddings);
    }

    const chunkDocs = rawChunks.map((c, i) => ({
      document: document._id,
      user: req.user.id,
      text: c.text,
      pageNumber: c.pageNumber,
      chunkIndex: c.chunkIndex,
      embedding: embeddings[i],
    }));

    await Chunk.insertMany(chunkDocs);

    document.totalPages = totalPages;
    document.totalChunks = chunkDocs.length;
    document.status = 'ready';
    await document.save();

    res.status(201).json({ document });
  } catch (err) {
    document.status = 'failed';
    document.errorMessage = err.message || 'Failed to process PDF';
    await document.save();
    res.status(201).json({ document });
  }
});

export const listDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ documents });
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, user: req.user.id });

  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  await Chunk.deleteMany({ document: document._id });

  fs.unlink(document.filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Failed to delete file from disk:', err.message);
    }
  });

  await document.deleteOne();

  res.json({ message: 'Document deleted' });
});
