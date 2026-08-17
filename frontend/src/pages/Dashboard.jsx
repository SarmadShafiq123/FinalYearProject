import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useFiles from "../hooks/useFiles";
import useAlerts from "../hooks/useAlerts";
import StorageBar from "../components/dashboard/StorageBar";
import StorageAlerts from "../components/dashboard/StorageAlerts";
import ActivityLog from "../components/dashboard/ActivityLog";
import Loader from "../components/common/Loader";
import NotificationModal from "../components/common/NotificationModal";
import { ArrowRight, AlertTriangle } from "lucide-react";

const categoryStats = (files) => {
  const counts = {
    image: 0,
    video: 0,
    audio: 0,
    document: 0,
    archive: 0,
    other: 0,
  };
  files.forEach((f) => {
    if (counts[f.category] !== undefined) counts[f.category]++;
    else counts.other++;
  });
  return counts;
};

const colorMap = {
  image: "bg-green-600",
  video: "bg-purple-600",
  audio: "bg-yellow-500",
  document: "bg-blue-600",
  archive: "bg-orange-500",
  other: "bg-zinc-600",
};

const StatCard = ({ label, count, color }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center gap-4">
    <div
      className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-white font-bold text-sm">{count}</span>
    </div>
    <div>
      <p className="text-sm font-medium text-white capitalize">{label}s</p>
      <p className="text-xs text-zinc-400">
        {count} file{count !== 1 ? "s" : ""}
      </p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const { files, loading, fetchFiles } = useFiles();
  const { alerts, unreadCount } = useAlerts();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
    refreshUser();
  }, [fetchFiles]);

  const stats = categoryStats(files);
  const isLocked =
    user?.planStatus === "locked" || user?.planStatus === "expired";
  const wasOnPaidPlan = user?.planStatus === "free" && user?.lastPaymentDate;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Here&apos;s an overview of your storage
        </p>
      </div>

      {isLocked && (
        <div className="bg-red-950 border border-red-800 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">
              Your storage is locked due to non-payment. Renew within 45 days to
              restore your files before they are permanently deleted.
            </p>
          </div>
          <Link
            to="/pricing"
            className="text-xs font-medium bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            Renew Now
          </Link>
        </div>
      )}

      {wasOnPaidPlan && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            Your files were deleted. Choose a plan to get started again.
          </p>
          <Link
            to="/pricing"
            className="text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ml-4"
          >
            Choose a Plan
          </Link>
        </div>
      )}

      <StorageAlerts
        storageUsed={user?.storageUsed || 0}
        storageLimit={user?.storageLimit || 1073741824}
        userEmail={user?.email}
      />

      {alerts.length > 0 && (
        <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">
              📢 Your Notifications ({unreadCount} unread)
            </h2>
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors flex items-center gap-1"
            >
              Show all
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert._id}
                className={`p-3 rounded-lg border ${
                  !alert.isRead
                    ? "bg-zinc-800 border-blue-500/30"
                    : "bg-zinc-900 border-zinc-700"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">{alert.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {alert.title}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {alert.message}
                    </p>
                    {alert.actionUrl && (
                      <a
                        href={alert.actionUrl}
                        className="inline-block text-xs text-blue-400 hover:text-blue-300 mt-2 font-medium"
                      >
                        {alert.actionLabel || "View"} →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <StorageBar
            storageUsed={user?.storageUsed || 0}
            storageLimit={user?.storageLimit || 1073741824}
            planStatus={user?.planStatus}
          />
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{files.length}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Total Files</p>
            <p className="text-xs text-zinc-400">All encrypted</p>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {Object.entries(stats).map(([cat, count]) => (
              <StatCard
                key={cat}
                label={cat}
                count={count}
                color={colorMap[cat]}
              />
            ))}
          </div>
          <ActivityLog files={files} />
        </>
      )}

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
