const { extractTextFromPdf } = require('../services/pdf.service');

/**
 * Middleware that processes and normalizes resume input from either:
 * 1. An uploaded PDF file in req.file (multipart/form-data)
 * 2. Pasted text in req.body.resumeText (application/json or multipart form)
 *
 * Populates req.body.resumeText and attaches req.resumeSource ('pdf' | 'paste').
 */
async function processResumeInput(req, res, next) {
  try {
    if (req.file) {
      const extractedText = await extractTextFromPdf(req.file.buffer);
      req.body = req.body || {};
      req.body.resumeText = extractedText;
      req.resumeSource = 'pdf';
    } else {
      req.resumeSource = 'paste';
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = processResumeInput;
