const mongoose = require('mongoose');

const sopDocumentSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  filename:     { type: String, required: true },  // stored filename on disk
  fileSize:     { type: Number, required: true },   // bytes
  category:     { type: String, default: 'General' },
  totalChunks:  { type: Number, default: 0 },

  // Tracks pipeline state
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'indexed', 'failed'],
    default: 'uploaded',
  },
  errorMessage: { type: String, default: null },
  indexedAt:    { type: Date,   default: null },
}, { timestamps: true });

module.exports = mongoose.model('SOPDocument', sopDocumentSchema);
