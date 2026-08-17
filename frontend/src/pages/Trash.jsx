import { useState } from "react";
import useTrash from "../hooks/useTrash";
import useFiles from "../hooks/useFiles";
import TrashGrid from "../components/trash/TrashGrid";
import Loader from "../components/common/Loader";
import ConfirmModal from "../components/common/ConfirmModal";

const Trash = () => {
  const { trashedFiles, loading, restoreFile, permanentDelete, emptyTrash } =
    useTrash();
  const { fetchFiles } = useFiles();
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

  const handleRestore = async (id) => {
    try {
      await restoreFile(id);
      await fetchFiles();
    } catch (err) {
      return;
    }
  };

  const handleDelete = async (id) => {
    try {
      await permanentDelete(id);
    } catch (err) {
      return;
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await emptyTrash();
    } catch (err) {
      return;
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">Trash</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Files are permanently deleted after 30 days, or 45 days for files
              locked due to an expired paid plan.
            </p>
          </div>
          {trashedFiles.length > 0 && (
            <button
              onClick={() => setShowEmptyConfirm(true)}
              className="bg-red-600 hover:bg-red-700 transition-colors text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer"
            >
              Empty Trash
            </button>
          )}
        </div>

        <TrashGrid
          files={trashedFiles}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      </div>

      <ConfirmModal
        isOpen={showEmptyConfirm}
        title="Empty Trash"
        message="All files in trash will be permanently deleted. This action cannot be undone."
        confirmText="Empty Trash"
        confirmVariant="danger"
        onConfirm={() => {
          handleEmptyTrash();
          setShowEmptyConfirm(false);
        }}
        onCancel={() => setShowEmptyConfirm(false)}
      />
    </div>
  );
};

export default Trash;
