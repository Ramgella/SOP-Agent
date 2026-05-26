const mongoose = require('mongoose');

// Each document is split into chunks; each chunk stores its embedding vector.
// The Atlas Vector Search index must be created on the "embedding" field.
const sopChunkSchema = new mongoose.Schema({
  // Reference back to parent document
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SOPDocument',
    required: true,
    index: true,
  },

  // Human-readable source citation e.g. "Refund Policy, Page 3, Chunk 2"
  source: {
    type: String,
    required: true,
  },

  // Raw text of this chunk (1000 chars, 100 char overlap with neighbours)
  text: {
    type: String,
    required: true,
  },

  // Chunk position metadata
  chunkIndex: {
    type: Number,
    required: true,
  },

  pageNumber: {
    type: Number,
    default: null,
  },

  // 1024-dim embedding vector from Voyage AI via Anthropic SDK
  embedding: {
    type: [Number],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('SOPChunk', sopChunkSchema);
