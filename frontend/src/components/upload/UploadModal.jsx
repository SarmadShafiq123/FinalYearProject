import { useEffect, useState } from "react";
import useFiles from "../../hooks/useFiles";
import useFolders from "../../hooks/useFolders";
import DropZone from "./DropZone";

const UploadModal = ({ isOpen, onClose, onSuccess, currentFolderId }) => {
  const { uploadFile, uploadProgress, uploadStage } = useFiles();
  const { folders } = useFolders();
  const [selectedFile, setSelectedFile] = useState(null);
  const [folderId, setFolderId] = useState(currentFolderId || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFolderId(currentFolderId || "");
    }
  }, [currentFolderId, isOpen]);

  const uploading = uploadStage !== "idle" && uploadStage !== "success";

  const handleClose = () => {
    if (uploading) return;
    setSelectedFile(null);
    setFolderId(currentFolderId || "");
    setError("");
    onClose();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", folderId || "");

      await uploadFile(formData);

      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again.",
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            id="upload-modal-title"
            className="text-lg font-semibold text-white"
          >
            Upload File
          </h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {uploadStage === "idle" || uploadStage === "error" ? (
          <>
            <DropZone
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
            />

            <div className="mt-4">
              <label
                htmlFor="folder-select"
                className="text-sm text-zinc-400 mb-1 block"
              >
                Destination Folder
              </label>
              <select
                id="folder-select"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500 w-full text-sm"
                disabled={uploading}
              >
                <option value="">Root</option>
                {folders.map((folder) => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="w-full bg-zinc-800 rounded-full h-2 mb-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
                role="progressbar"
                aria-valuenow={uploadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <p className="text-zinc-400 text-sm text-center">
              {uploadStage === "uploading" && "Uploading your file..."}
              {uploadStage === "encrypting" && "Encrypting with AES-256-CBC..."}
              {uploadStage === "storing" && "Storing securely..."}
              {uploadStage === "success" && "File saved securely 🔒"}
            </p>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {uploadStage === "error" && (
          <p className="mt-3 text-sm text-red-400">
            Upload failed. Please try again.
          </p>
        )}

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 transition-colors text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
