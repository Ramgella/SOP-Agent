import 'dotenv/config';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { warmUpEmbeddingModel } from './src/services/embeddingService.js';

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  // Loading the embedding model takes a few seconds the first time (it
  // downloads ~30MB once, then caches it). Doing it now means the first
  // PDF upload or question doesn't pay that cost.
  warmUpEmbeddingModel().catch((err) => {
    console.error('Embedding model failed to load:', err.message);
  });

  app.listen(PORT, () => {
    console.log(`SOP Agent API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
