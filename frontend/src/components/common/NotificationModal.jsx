import { X, Bell, CheckCheck, Trash2 } from "lucide-react";
import { useEffect } from "react";
import useAlerts from "../../hooks/useAlerts";

const NotificationModal = ({ isOpen, onClose }) => {
  const { alerts, loading, markAsRead, markAllAsRead, deleteAlert } = useAlerts();

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getSeverityColor = (severity) => {
    const colors = {
      low: "bg-blue-500/10 border-blue-500/30",
      medium: "bg-amber-500/10 border-amber-500/30",
      high: "bg-red-500/10 border-red-500/30",
      critical: "bg-rose-600/10 border-rose-600/30",
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityTextColor = (severity) => {
    const colors = {
      low: "text-blue-400",
      medium: "text-amber-400",
      high: "text-red-400",
      critical: "text-rose-400",
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityIconBg = (severity) => {
    const colors = {
      low: "bg-blue-500/20",
      medium: "bg-amber-500/20",
      high: "bg-red-500/20",
      critical: "bg-rose-600/20",
    };
    return colors[severity] || colors.medium;
  };

  const formatTime = (date) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diffMs = now - alertDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return alertDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: alertDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-zinc-900 to-zinc-950">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Bell className="text-blue-400" size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Notifications</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {unreadCount} unread • {alerts.length} total
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
            >
              <X size={22} />
            </button>
          </div>

          {/* Action Bar */}
          {alerts.length > 0 && unreadCount > 0 && (
            <div className="px-6 py-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-end gap-3">
              <button
                onClick={markAllAsRead}
                className="text-xs px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto scrollbar-custom">
            {loading ? (
              <div className="p-8 text-center text-zinc-400">
                <div className="inline-block">
                  <div className="w-8 h-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
                </div>
                <p className="text-sm mt-3">Loading notifications...</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="text-zinc-600" size={28} />
                </div>
                <p className="text-sm font-medium text-white">No notifications yet</p>
                <p className="text-xs text-zinc-500 mt-2">
                  You&apos;re all caught up! Check back later for updates.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {alerts.map((alert) => (
                  <div
                    key={alert._id}
                    className={`px-6 py-4 transition-colors duration-200 ${
                      !alert.isRead
                        ? "bg-gradient-to-r from-blue-500/5 via-zinc-900 to-zinc-900 hover:from-blue-500/10 hover:via-zinc-900 hover:to-zinc-900"
                        : "hover:bg-zinc-800/30"
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Alert Icon */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xl ${getSeverityIconBg(
                          alert.severity
                        )}`}
                      >
                        {alert.icon}
                      </div>

                      {/* Alert Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-white">
                              {alert.title}
                            </h3>
                            <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                              {alert.message}
                            </p>

                            {/* Time */}
                            <p className="text-xs text-zinc-500 mt-2">
                              {formatTime(alert.createdAt)}
                            </p>

                            {/* Action Link */}
                            {alert.actionUrl && (
                              <a
                                href={alert.actionUrl}
                                className="inline-block text-xs text-blue-400 hover:text-blue-300 mt-3 font-semibold transition-colors"
                              >
                                {alert.actionLabel || "View"} →
                              </a>
                            )}
                          </div>

                          {/* Unread Indicator */}
                          {!alert.isRead && (
                            <div className="flex-shrink-0 w-2.5 h-2.5 bg-blue-500 rounded-full mt-1" />
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3">
                          {!alert.isRead && (
                            <button
                              onClick={() => markAsRead(alert._id)}
                              className="text-xs px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded transition-colors font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => deleteAlert(alert._id)}
                            className="text-xs px-3 py-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors font-medium ml-auto flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationModal;
