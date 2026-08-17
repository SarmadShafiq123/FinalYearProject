import { AlertTriangle, HelpCircle } from "lucide-react";

const ConfirmModal = ({ isOpen, title, message, confirmText, confirmVariant = "danger", onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${
            confirmVariant === "danger" ? "bg-red-500/10" : "bg-blue-500/10"
          }`}
        >
          {confirmVariant === "danger" ? (
            <AlertTriangle className="text-red-400" size={22} />
          ) : (
            <HelpCircle className="text-blue-400" size={22} />
          )}
        </div>
        <p className="text-base font-semibold text-white text-center mb-2">{title}</p>
        <p className="text-sm text-zinc-400 text-center mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer ${
              confirmVariant === "danger"
                ? "bg-red-600 hover:bg-red-500"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
