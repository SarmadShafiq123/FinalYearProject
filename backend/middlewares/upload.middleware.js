import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp",
  "video/mp4", "video/mpeg", "video/quicktime", "video/webm",
  "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm", "audio/aac",
  "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain", "text/csv",
  "application/zip", "application/x-rar-compressed", "application/x-7z-compressed"
];

const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
};

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error("File type not allowed"), false);
  }
  
  file.originalname = sanitizeFilename(file.originalname);
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
  },
});

export { upload };
