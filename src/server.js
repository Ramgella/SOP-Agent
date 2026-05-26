/**
 * OpsMind AI — Enterprise SOP Agent
 * Main Express Server
 *
 * Week 1: /api/admin/documents  — Upload PDFs, trigger ingestion pipeline
 * Week 2: /api/query            — RAG-powered SOP question answering
 */

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const connectDB  = require('./config/database');
const adminRoutes = require('./routes/adminRoutes');
const queryRoutes = require('./routes/queryRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ───────────────────────────────────────────────────────────────
app.use('/api/admin',  adminRoutes);   // Week 1: upload, list, delete
app.use('/api/query',  queryRoutes);   // Week 2: vector search + answer

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'OpsMind AI' }));

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error.' });
});

// ── Start ────────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 OpsMind AI running on http://localhost:${PORT}`);
    console.log(`   Admin API : http://localhost:${PORT}/api/admin/documents`);
    console.log(`   Query API : http://localhost:${PORT}/api/query\n`);
  });
});
