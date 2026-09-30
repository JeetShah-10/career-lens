const multer = require('multer');

// Configure in-memory storage only (no writing arbitrary files to disk)
const storage = multer.memoryStorage();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const fileFilter = (req, file, cb) => {
  // Verify declared mimetype is PDF
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = typeof file.originalname === 'string' && file.originalname.toLowerCase().endsWith('.pdf');

  if (isPdfMime || isPdfExt) {
    cb(null, true);
  } else {
    const error = new Error('Only PDF files (.pdf) are allowed');
    error.code = 'INVALID_FILE_TYPE';
    error.status = 400;
    cb(error, false);
  }
};

const multerInstance = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
});

/**
 * Middleware wrapper for single PDF file upload.
 * Catches Multer errors (file size, unexpected fields) and formats standardized responses.
 *
 * @param {string} fieldName - Form field name for file (default: 'file')
 */
function uploadPdf(fieldName = 'file') {
  const singleUpload = multerInstance.single(fieldName);

  return (req, res, next) => {
    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: {
              code: 'FILE_TOO_LARGE',
              message: 'File size exceeds maximum limit of 5MB',
            },
          });
        }
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: `Upload error: ${err.message}`,
          },
        });
      }

      if (err) {
        return res.status(err.status || 400).json({
          error: {
            code: err.code || 'INVALID_FILE_TYPE',
            message: err.message || 'Invalid upload',
          },
        });
      }

      next();
    });
  };
}

module.exports = {
  uploadPdf,
  MAX_FILE_SIZE,
};
