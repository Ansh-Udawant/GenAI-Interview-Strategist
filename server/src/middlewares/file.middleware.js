import multer from "multer";

/**
 * Multer file upload middleware configuration.
 * Stores uploaded resume PDF in memory with a max size limit of 3MB.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024
  }
});