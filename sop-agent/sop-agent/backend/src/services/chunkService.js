const CHUNK_SIZE = 1000; // characters per chunk
const CHUNK_OVERLAP = 150; // characters shared between consecutive chunks

/**
 * Splits an array of per-page text into overlapping chunks. Each chunk
 * keeps a reference to its source page number, which is what lets the
 * chat feature cite an exact page in its answer.
 *
 * @param {string[]} pages - pages[0] is page 1, pages[1] is page 2, etc.
 * @returns {{ text: string, pageNumber: number, chunkIndex: number }[]}
 */
export function chunkPages(pages) {
  const chunks = [];
  let chunkIndex = 0;

  pages.forEach((rawPageText, idx) => {
    const pageNumber = idx + 1;
    const cleaned = rawPageText.replace(/\s+/g, ' ').trim();

    if (!cleaned) return; // skip blank pages (e.g. cover/back pages)

    if (cleaned.length <= CHUNK_SIZE) {
      chunks.push({ text: cleaned, pageNumber, chunkIndex: chunkIndex++ });
      return;
    }

    let start = 0;
    while (start < cleaned.length) {
      const end = Math.min(start + CHUNK_SIZE, cleaned.length);
      const text = cleaned.slice(start, end).trim();

      if (text) {
        chunks.push({ text, pageNumber, chunkIndex: chunkIndex++ });
      }

      if (end === cleaned.length) break;
      start = end - CHUNK_OVERLAP;
    }
  });

  return chunks;
}
