const mimeCategories = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/tiff"],
  video: ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/webm", "video/ogg"],
  audio: ["audio/mpeg", "audio/ogg", "audio/wav", "audio/webm", "audio/aac", "audio/flac"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "text/html",
  ],
  archive: [
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/x-tar",
    "application/gzip",
  ],
};

const getFileCategory = (mimeType) => {
  for (const [category, types] of Object.entries(mimeCategories)) {
    if (types.includes(mimeType)) return category;
  }
  return "other";
};

export default getFileCategory;
