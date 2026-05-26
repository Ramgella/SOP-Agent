/**
 * WEEK 1 — PDF Parsing & Chunking Service
 *
 * Responsibility:
 *  1. Parse raw PDF buffer → plain text
 *  2. Split text into overlapping chunks:
 *       chunkSize    = 1000 characters
 *       chunkOverlap = 100  characters
 *  3. Return array of { text, chunkIndex, pageNumber, source }
 */

const pdfParse = require('pdf-parse');

const CHUNK_SIZE    = 1000;
const CHUNK_OVERLAP = 100;

/**
 * Parse a PDF file buffer and return extracted text.
 * @param {Buffer} buffer
 * @returns {Promise<{ text: string, numPages: number }>}
 */
async function parsePDF(buffer) {
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    numPages: data.numpages,
  };
}

/**
 * Split a long text string into overlapping chunks.
 *
 * Algorithm:
 *   - Walk through text with a sliding window.
 *   - Each window is CHUNK_SIZE characters wide.
 *   - Each step advances by (CHUNK_SIZE - CHUNK_OVERLAP) characters,
 *     so consecutive chunks share 100 chars of context.
 *
 * @param {string} text
 * @returns {{ text: string, chunkIndex: number }[]}
 */
function chunkText(text) {
  const chunks = [];
  const step   = CHUNK_SIZE - CHUNK_OVERLAP; // 900 chars per step
  let   index  = 0;

  // Normalise whitespace so chunks aren't full of newline noise
  const cleaned = text.replace(/\s+/g, ' ').trim();

  let chunkIndex = 0;
  while (index < cleaned.length) {
    const chunk = cleaned.slice(index, index + CHUNK_SIZE);
    if (chunk.trim().length > 0) {
      chunks.push({
        text: chunk.trim(),
        chunkIndex,
      });
      chunkIndex++;
    }
    index += step;
  }

  return chunks;
}

/**
 * Full pipeline: PDF buffer → array of chunk objects ready for embedding.
 *
 * @param {Buffer} buffer        - raw PDF file buffer
 * @param {string} documentName  - original filename for source citation
 * @returns {Promise<Array<{ text, chunkIndex, pageNumber, source }>>}
 */
async function parsePDFAndChunk(buffer, documentName) {
  const { text, numPages } = await parsePDF(buffer);

  if (!text || text.trim().length === 0) {
    throw new Error('PDF appears to be empty or is a scanned image-only PDF (no extractable text).');
  }

  const rawChunks = chunkText(text);

  // Attach source citation metadata to each chunk
  const chunks = rawChunks.map((chunk) => ({
    ...chunk,
    pageNumber: null, // page-level attribution requires per-page parsing (future enhancement)
    source: `${documentName} — Chunk ${chunk.chunkIndex + 1}`,
  }));

  console.log(`📄 Parsed "${documentName}": ${numPages} pages → ${chunks.length} chunks`);
  return chunks;
}

module.exports = { parsePDFAndChunk, parsePDF, chunkText };
