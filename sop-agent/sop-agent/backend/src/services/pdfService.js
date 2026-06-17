import fs from 'fs';
import pdfParse from 'pdf-parse';

/**
 * Extracts text from a PDF, keeping track of which page each piece of text
 * came from. pdf-parse normally returns one big string for the whole PDF,
 * so we override its pagerender hook to capture text page by page instead.
 *
 * @param {string} filePath - absolute path to the PDF on disk
 * @returns {Promise<{ totalPages: number, pages: string[] }>} pages[0] is page 1
 */
export async function extractTextByPage(filePath) {
  const buffer = fs.readFileSync(filePath);
  const pages = [];

  function renderPage(pageData) {
    const renderOptions = {
      normalizeWhitespace: true,
      disableCombineTextItems: false,
    };

    return pageData.getTextContent(renderOptions).then((textContent) => {
      let lastY;
      let pageText = '';

      for (const item of textContent.items) {
        if (lastY === item.transform[5] || !lastY) {
          pageText += item.str;
        } else {
          pageText += `\n${item.str}`;
        }
        lastY = item.transform[5];
      }

      pages.push(pageText.trim());
      return pageText;
    });
  }

  const data = await pdfParse(buffer, { pagerender: renderPage });

  return {
    totalPages: data.numpages,
    pages,
  };
}
