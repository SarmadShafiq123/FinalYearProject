import { useState } from "react";
import useFolders from "../../hooks/useFolders";

const CreateFolderModal = ({ isOpen, onClose, onSuccess, parentFolder }) => {
  const { createFolder } = useFolders();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (loading) return;
    setName("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Folder name is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createFolder(name.trim(), parentFolder);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create folder.");
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
      aria-labelledby="create-folder-modal-title"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 id="create-folder-modal-title" className="text-lg font-semibold text-white">
            Create Folder
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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="folder-name" className="text-sm text-zinc-400 mb-1 block">
              Folder Name
            </label>
            <input
              id="folder-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 w-full text-sm"
              placeholder="Enter folder name"
              disabled={loading}
              autoFocus
            />
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
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;
