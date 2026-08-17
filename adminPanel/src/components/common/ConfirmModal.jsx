const ConfirmModal = ({ title, description, confirmLabel = "Confirm", confirmClass = "bg-red-600 hover:bg-red-500", onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
        {description && (
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">{description}</p>
        )}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm text-white rounded-lg transition-colors cursor-pointer ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
