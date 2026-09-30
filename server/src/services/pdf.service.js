const pdfParse = require('pdf-parse');
const logger = require('../utils/logger');

/**
 * Validates that buffer starts with '%PDF' magic byte signature (0x25 0x50 0x44 0x46).
 *
 * @param {Buffer} buffer
 * @returns {boolean}
 */
function isValidPdfSignature(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) {
    return false;
  }
  return buffer.slice(0, 4).toString('ascii') === '%PDF';
}

/**
 * Extracts and sanitizes plain text from a PDF Buffer.
 *
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function extractTextFromPdf(buffer) {
  if (!isValidPdfSignature(buffer)) {
    const error = new Error('Uploaded file is not a valid PDF document (missing %PDF signature)');
    error.code = 'INVALID_FILE_TYPE';
    error.status = 400;
    throw error;
  }

  let rawText = '';
  try {
    if (pdfParse && pdfParse.PDFParse) {
      const parser = new pdfParse.PDFParse({ data: buffer });
      const result = await parser.getText();
      rawText = result && typeof result.text === 'string' ? result.text : '';
      if (typeof parser.destroy === 'function') {
        await parser.destroy().catch(() => {});
      }
    } else if (typeof pdfParse === 'function') {
      const pdfData = await pdfParse(buffer, { max: 10 });
      rawText = pdfData && typeof pdfData.text === 'string' ? pdfData.text : '';
    } else {
      throw new Error('PDF parsing engine is not available');
    }
  } catch (err) {
    logger.warn('PDF parsing error encountered', { error: err.message });
    const error = new Error(
      'Unable to parse PDF. The document may be corrupted, encrypted, or password-protected. Please paste your resume text instead.'
    );
    error.code = 'UNREADABLE_PDF';
    error.status = 422;
    throw error;
  }

  // Clean and sanitize extracted text
  const cleanedText = (rawText || '')
    .replace(/\0/g, '') // remove null characters
    .replace(/\r\n/g, '\n') // normalize newlines
    .trim();

  // If text is under 50 characters, it's either scanned/image-only or essentially empty
  if (cleanedText.length < 50) {
    const error = new Error(
      'PDF contains no readable text or is an image/scanned document. Please paste your resume text instead.'
    );
    error.code = 'EMPTY_OR_SCANNED_PDF';
    error.status = 422;
    throw error;
  }

  // Truncate to maximum allowable resume length
  return cleanedText.slice(0, 20000);
}

module.exports = {
  isValidPdfSignature,
  extractTextFromPdf,
};
