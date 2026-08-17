import { useState } from "react";
import ConfirmModal from "../common/ConfirmModal";

const FolderCard = ({ folder, onRename, onDelete, onClick }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  return (
    <>
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col gap-3 cursor-pointer hover:border-zinc-700 transition-colors"
        onClick={() => onClick(folder)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate" title={folder.name}>
              {folder.name}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {new Date(folder.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRename(folder);
            }}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 transition-colors text-white text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer"
            aria-label={`Rename ${folder.name}`}
          >
            Rename
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 transition-colors text-white text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer"
            aria-label={`Delete ${folder.name}`}
          >
            Delete
          </button>
        </div>
      </div>
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Folder"
        message="Deleting this folder will move all files inside it to root. This cannot be undone."
        confirmText="Delete Folder"
        confirmVariant="danger"
        onConfirm={() => {
          onDelete(folder._id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default FolderCard;
