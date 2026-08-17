import { useState } from "react";
import { Bell, X, Trash2, Check } from "lucide-react";
import useAlerts from "../../hooks/useAlerts";
import NotificationModal from "./NotificationModal";

const AlertsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    alerts,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteAlert,
  } = useAlerts();

  const getSeverityColor = (severity) => {
    const colors = {
      low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      high: "bg-red-500/10 text-red-400 border-red-500/20",
      critical: "bg-rose-600/10 text-rose-400 border-rose-600/20",
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityBgLight = (severity) => {
    const colors = {
      low: "bg-blue-500/5",
      medium: "bg-amber-500/5",
      high: "bg-red-500/5",
      critical: "bg-rose-600/5",
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
    });
  };

  return (
    <>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Bell size={20} className="text-zinc-400 hover:text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Alerts Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              <p className="text-xs text-zinc-400 mt-1">
                {unreadCount} unread • {alerts.length} total
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Alerts List */}
          <div className="max-h-96 overflow-y-auto scrollbar-custom">
            {loading ? (
              <div className="p-8 text-center text-zinc-500">
                <p className="text-sm">Loading alerts...</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                <p className="text-sm">No alerts yet</p>
                <p className="text-xs mt-1 text-zinc-600">
                  You're all caught up!
                </p>
              </div>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert._id}
                  className={`p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer ${
                    !alert.isRead ? getSeverityBgLight(alert.severity) : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Alert Icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getSeverityColor(
                        alert.severity
                      ).split(" ").slice(0, 1)[0]} text-lg`}
                    >
                      {alert.icon}
                    </div>

                    {/* Alert Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-white">
                            {alert.title}
                          </h4>
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                            {alert.message}
                          </p>
                        </div>

                        {/* Unread Indicator */}
                        {!alert.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>

                      {/* Time */}
                      <p className="text-xs text-zinc-500 mt-2">
                        {formatTime(alert.createdAt)}
                      </p>

                      {/* Action Button */}
                      {alert.actionUrl && (
                        <a
                          href={alert.actionUrl}
                          className="inline-block text-xs text-blue-400 hover:text-blue-300 mt-2 font-medium"
                        >
                          {alert.actionLabel || "View"} →
                        </a>
                      )}

                      {/* Alert Actions */}
                      <div className="flex gap-2 mt-2">
                        {!alert.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(alert._id);
                            }}
                            className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                          >
                            <Check size={14} />
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAlert(alert._id);
                          }}
                          className="text-xs text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Show All Button */}
          {alerts.length > 0 && (
            <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50 flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    markAllAsRead();
                    setIsOpen(false);
                  }}
                  className="flex-1 text-xs px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded font-medium transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsOpen(false);
                }}
                className="flex-1 text-xs px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
              >
                Show all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default AlertsPanel;
