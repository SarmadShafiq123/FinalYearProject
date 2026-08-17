import { useState } from "react";
import formatBytes from "../../utils/formatBytes";
import ConfirmModal from "../common/ConfirmModal";

const categoryIcons = {
  image: (
    <svg
      className="w-8 h-8 text-green-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  video: (
    <svg
      className="w-8 h-8 text-purple-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  ),
  audio: (
    <svg
      className="w-8 h-8 text-yellow-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
      />
    </svg>
  ),
  document: (
    <svg
      className="w-8 h-8 text-blue-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  archive: (
    <svg
      className="w-8 h-8 text-orange-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
      />
    </svg>
  ),
  other: (
    <svg
      className="w-8 h-8 text-zinc-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  ),
};

const TrashCard = ({ file, onRestore, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const icon = categoryIcons[file.category] || categoryIcons.other;
  const daysSinceDeletion = Math.floor(
    (Date.now() - new Date(file.deletedAt)) / 86400000,
  );
  const daysRemaining = file.daysRemaining;
  const isUrgent = daysRemaining <= 5;

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="shrink-0">{icon}</div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium text-white truncate"
              title={file.originalName}
            >
              {file.originalName}
            </p>
            {file.deletedByExpiry && (
              <p className="text-xs inline-flex rounded-full border border-amber-500 bg-amber-500/10 px-2 py-1 mt-2 text-amber-300">
                Plan-expired backup — restores for 45 days
              </p>
            )}
            <p className="text-xs text-zinc-400 mt-0.5">
              {formatBytes(file.size)}
            </p>
            <p
              className={`text-xs mt-1 ${isUrgent ? "text-red-500" : "text-zinc-500"}`}
            >
              Deleted {daysSinceDeletion} days ago • Auto-deletes in{" "}
              {daysRemaining} days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onRestore(file._id)}
            className="bg-zinc-800 hover:bg-zinc-700 transition-colors text-white text-xs px-3 py-1.5 rounded-md cursor-pointer"
            aria-label={`Restore ${file.originalName}`}
          >
            Restore
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 hover:bg-red-700 transition-colors text-white text-xs px-3 py-1.5 rounded-md cursor-pointer"
            aria-label={`Delete ${file.originalName} forever`}
          >
            Delete Forever
          </button>
        </div>
      </div>
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Permanently Delete"
        message="This file will be permanently deleted and cannot be recovered. Are you sure?"
        confirmText="Delete Forever"
        confirmVariant="danger"
        onConfirm={() => {
          onDelete(file._id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default TrashCard;
