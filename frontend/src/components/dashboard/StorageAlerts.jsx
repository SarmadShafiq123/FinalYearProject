import { AlertCircle, Zap, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const StorageAlerts = ({ storageUsed, storageLimit, userEmail }) => {
  const navigate = useNavigate();
  const storagePercentage = (storageUsed / storageLimit) * 100;

  // Alert when storage is 90% full
  const is90Percent = storagePercentage >= 90;
  
  // Critical alert when storage is 100% full
  const is100Percent = storageUsed >= storageLimit;

  if (!is90Percent && !is100Percent) {
    return null;
  }

  if (is100Percent) {
    return (
      <div className="bg-red-500/10 border-2 border-red-500 rounded-lg p-4 mb-6 flex items-start gap-4">
        <Trash2 className="text-red-500 flex-shrink-0 mt-1" size={20} />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-400 mb-1">⚠️ DANGER: Storage Full</h3>
          <p className="text-sm text-red-300 mb-3">
            Your storage is completely full ({(storageUsed / (1024 ** 3)).toFixed(2)} GB / {(storageLimit / (1024 ** 3)).toFixed(2)} GB). 
            <strong> New files cannot be uploaded.</strong> Your data will be automatically deleted in 30 days if you don't upgrade or delete files.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast("Save your important files to your computer immediately!", {
                  icon: "💾",
                  duration: 5000,
                  style: {
                    background: "#7f1d1d",
                    color: "#fca5a5",
                    border: "2px solid #dc2626",
                  },
                });
                navigate("/files");
              }}
              className="text-xs px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
            >
              Go to Files
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="text-xs px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (is90Percent) {
    return (
      <div className="bg-amber-500/10 border-2 border-amber-500 rounded-lg p-4 mb-6 flex items-start gap-4">
        <AlertCircle className="text-amber-500 flex-shrink-0 mt-1" size={20} />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-400 mb-1">⚡ Storage Almost Full</h3>
          <p className="text-sm text-amber-300 mb-3">
            You've used {storagePercentage.toFixed(0)}% of your storage ({(storageUsed / (1024 ** 3)).toFixed(2)} GB / {(storageLimit / (1024 ** 3)).toFixed(2)} GB). 
            Consider upgrading your plan to continue uploading files.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/pricing")}
              className="text-xs px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium transition-colors flex items-center gap-1"
            >
              <Zap size={14} />
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StorageAlerts;
