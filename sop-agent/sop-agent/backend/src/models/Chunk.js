import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    pageNumber: {
      type: Number,
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    // 384-dimensional vector produced by the all-MiniLM-L6-v2 embedding model
    embedding: {
      type: [Number],
      required: true,
    },
  },
  { timestamps: true }
);

const Chunk = mongoose.model('Chunk', chunkSchema);

export default Chunk;
