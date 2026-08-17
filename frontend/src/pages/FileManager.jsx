import { useEffect, useState } from "react";
import useFiles from "../hooks/useFiles";
import useAuth from "../hooks/useAuth";
import useFolders from "../hooks/useFolders";
import FileGrid from "../components/dashboard/FileGrid";
import FolderGrid from "../components/folders/FolderGrid";
import StorageBar from "../components/dashboard/StorageBar";
import UploadModal from "../components/upload/UploadModal";
import CreateFolderModal from "../components/folders/CreateFolderModal";
import MoveFolderModal from "../components/folders/MoveFolderModal";
import FileDetailsModal from "../components/files/FileDetailsModal";
import Loader from "../components/common/Loader";

const CATEGORIES = [
  "all",
  "image",
  "video",
  "audio",
  "document",
  "archive",
  "other",
];

const RenameFolderModal = ({ isOpen, onClose, folder, onSuccess }) => {
  const { renameFolder } = useFolders();
  const [name, setName] = useState(folder?.name || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (folder) setName(folder.name);
  }, [folder]);

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
      await renameFolder(folder._id, name.trim());
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to rename folder.");
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
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Rename Folder</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
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
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="rename-folder"
              className="text-sm text-zinc-400 mb-1 block"
            >
              Folder Name
            </label>
            <input
              id="rename-folder"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 w-full text-sm"
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
              {loading ? "Renaming..." : "Rename"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FileManager = () => {
  const { user, refreshUser } = useAuth();
  const { files, loading, fetchFiles, deleteFile, downloadFile } = useFiles();
  const { folders, fetchFolders, deleteFolder } = useFolders();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [moveTarget, setMoveTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([{ name: "Root", id: null }]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("fileViewMode") || "grid";
  });

  useEffect(() => {
    localStorage.setItem("fileViewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    fetchFiles({ folder: currentFolderId === null ? "null" : currentFolderId });
    fetchFolders();
  }, [currentFolderId, fetchFiles, fetchFolders]);

  const handleDelete = async (id) => {
    await deleteFile(id);
    refreshUser();
  };

  const handleDownload = async (file) => {
    try {
      await downloadFile(file);
    } catch (err) {
      return;
    }
  };

  const handleDeleteFolder = async (id) => {
    await deleteFolder(id);
  };

  const handleFolderClick = (folder) => {
    setCurrentFolderId(folder._id);
    setBreadcrumb([...breadcrumb, { name: folder.name, id: folder._id }]);
  };

  const handleBreadcrumbClick = (index) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newBreadcrumb);
    setCurrentFolderId(newBreadcrumb[newBreadcrumb.length - 1].id);
  };

  const handleUploadSuccess = () => {
    fetchFiles({ folder: currentFolderId === null ? "null" : currentFolderId });
    refreshUser();
  };

  const handleMoveSuccess = () => {
    fetchFiles({ folder: currentFolderId === null ? "null" : currentFolderId });
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const currentFolderFolders = folders.filter(
    (f) =>
      f.parentFolder?._id === currentFolderId ||
      (!f.parentFolder && currentFolderId === null),
  );

  const filteredFolders = currentFolderFolders.filter((folder) =>
    folder.name.toLowerCase().includes(normalizedSearchQuery),
  );

  const filteredFiles = files.filter((file) => {
    const matchesCategory =
      activeCategory === "all" ? true : file.category === activeCategory;
    const matchesSearch = file.originalName
      .toLowerCase()
      .includes(normalizedSearchQuery);

    return matchesCategory && matchesSearch;
  });

  const hasSearchQuery = normalizedSearchQuery.length > 0;
  const totalVisibleItems = filteredFolders.length + filteredFiles.length;
  const summaryLabel = hasSearchQuery
    ? `${totalVisibleItems} result${totalVisibleItems !== 1 ? "s" : ""} for "${searchQuery.trim()}"`
    : `${filteredFiles.length} file${filteredFiles.length !== 1 ? "s" : ""} stored`;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Files</h1>
          <p className="text-zinc-400 text-sm mt-1">{summaryLabel}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCreateFolderOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 transition-colors text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            New Folder
          </button>
          <button
            onClick={() => setUploadOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload
          </button>
        </div>
      </div>

      <div className="mb-4">
        <StorageBar
          storageUsed={user?.storageUsed || 0}
          storageLimit={user?.storageLimit || 1073741824}
        />
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm">
        {breadcrumb.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            <button
              onClick={() => handleBreadcrumbClick(index)}
              className={`transition-colors ${
                index === breadcrumb.length - 1
                  ? "text-white font-medium"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {crumb.name}
            </button>
            {index < breadcrumb.length - 1 && (
              <span className="text-zinc-600">/</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap capitalize transition-colors cursor-pointer ${
              activeCategory === cat
                ? "bg-zinc-100 text-zinc-900"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <svg
            className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files and folders"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
            aria-label="Search files and folders"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <svg
                className="w-4 h-4"
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
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span className="bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1">
            {filteredFolders.length} folder
            {filteredFolders.length !== 1 ? "s" : ""}
          </span>
          <span className="bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1">
            {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}
          </span>
          {activeCategory !== "all" && (
            <span className="bg-blue-950/60 border border-blue-900 text-blue-200 rounded-full px-3 py-1 capitalize">
              {activeCategory}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Files</h2>
        <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-md overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 text-sm transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
            aria-label="Grid view"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 text-sm transition-colors cursor-pointer ${
              viewMode === "list"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
            aria-label="List view"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <FolderGrid
            folders={filteredFolders}
            onRename={(folder) => setRenameTarget(folder)}
            onDelete={handleDeleteFolder}
            onClick={handleFolderClick}
            emptyMessage={
              hasSearchQuery
                ? "No folders match your search in this location."
                : ""
            }
          />
          <FileGrid
            files={filteredFiles}
            onDelete={handleDelete}
            onMove={(file) => setMoveTarget(file)}
            onDownload={handleDownload}
            onFileClick={setSelectedFile}
            viewMode={viewMode}
            emptyMessage={
              hasSearchQuery ? "No matching files found" : "No files found"
            }
            emptyHint={
              hasSearchQuery
                ? "Try a different keyword or clear the active filters."
                : "Upload a file to get started"
            }
          />
        </>
      )}

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
        currentFolderId={currentFolderId}
      />

      <CreateFolderModal
        isOpen={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        onSuccess={() => fetchFolders()}
        parentFolder={currentFolderId}
      />

      {moveTarget && (
        <MoveFolderModal
          isOpen={!!moveTarget}
          onClose={() => setMoveTarget(null)}
          fileId={moveTarget._id}
          fileName={moveTarget.originalName}
          onSuccess={handleMoveSuccess}
        />
      )}

      {renameTarget && (
        <RenameFolderModal
          isOpen={!!renameTarget}
          onClose={() => setRenameTarget(null)}
          folder={renameTarget}
          onSuccess={() => fetchFolders()}
        />
      )}

      <FileDetailsModal
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        file={selectedFile}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default FileManager;
