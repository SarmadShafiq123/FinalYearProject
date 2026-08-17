import { cloudinary } from "../config/cloudinary.js";
import { Readable } from "stream";

const uploadEncryptedBuffer = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: filename,
        folder: "encrypted_files",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

const deleteFile = async (publicId) => {
  return cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
};

export { uploadEncryptedBuffer, deleteFile };
