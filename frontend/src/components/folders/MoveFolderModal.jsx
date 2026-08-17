import { useState } from "react";
import useFolders from "../../hooks/useFolders";

const MoveFolderModal = ({ isOpen, onClose, fileId, fileName, onSuccess }) => {
  const { folders, moveFile } = useFolders();
  const [selectedFolder, setSelectedFolder] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (loading) return;
    setSelectedFolder("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await moveFile(fileId, selectedFolder || null);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to move file.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="move-file-modal-title"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 id="move-file-modal-title" className="text-lg font-semibold text-white">
            Move File
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-zinc-400 mb-4 truncate">
          Moving: <span className="font-medium text-white">{fileName}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="folder-select" className="text-sm text-zinc-400 mb-1 block">
              Select Destination
            </label>
            <select
              id="folder-select"
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500 w-full text-sm"
              disabled={loading}
            >
              <option value="">Root</option>
              {folders.map((folder) => (
                <option key={folder._id} value={folder._id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 transition-colors text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Moving..." : "Move"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoveFolderModal;
