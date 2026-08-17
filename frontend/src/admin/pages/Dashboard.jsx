import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard";
import ConfirmModal from "../components/ConfirmModal";
import {
  getStats,
  getAllRequests,
  approveRequest,
  rejectRequest,
} from "../api/requests.api";

const formatBytes = (bytes) => {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + " GB";
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const statusBadge = (status) => {
  const map = {
    pending: "bg-yellow-500/10 text-yellow-400",
    approved: "bg-emerald-500/10 text-emerald-400",
    rejected: "bg-red-500/10 text-red-400",
  };
  return map[status] || "bg-zinc-800 text-zinc-400";
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const fetchedRef = useRef(false);

  const fetchData = async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    try {
      const [statsRes, reqRes] = await Promise.all([
        getStats(),
        getAllRequests(),
      ]);
      setStats(statsRes.data.data);
      setRequests(reqRes.data.data.requests?.slice(0, 8) || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load dashboard.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = (r) => {
    setConfirmModal({
      type: "approve",
      request: r,
      title: "Approve this request?",
      description: `An account will be created and credentials emailed to ${r.email}`,
    });
  };

  const handleReject = (r) => {
    setConfirmModal({
      type: "reject",
      request: r,
      title: "Reject this request?",
      description: "The applicant will be notified via email.",
    });
  };

  const handleConfirm = async () => {
    if (!confirmModal) return;
    setActionLoading(true);
    try {
      if (confirmModal.type === "approve") {
        await approveRequest(confirmModal.request._id);
        toast.success("Account created and email sent.");
      } else {
        await rejectRequest(confirmModal.request._id);
        toast.success("Request rejected.");
      }
      setConfirmModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 overflow-y-auto flex-1">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Overview of CloudStore system
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats?.totalUsers ?? "—"} />
        <StatCard
          label="Pending Requests"
          value={stats?.pendingRequests ?? "—"}
          sub={stats?.pendingRequests > 0 ? "Needs attention" : undefined}
          subRed={stats?.pendingRequests > 0}
        />
        <StatCard label="Total Files" value={stats?.totalFiles ?? "—"} />
        <StatCard
          label="Storage Used"
          value={stats ? formatBytes(stats.totalStorage) : "—"}
        />
        <StatCard label="Approved" value={stats?.approvedRequests ?? "—"} />
        <StatCard label="Messages" value={stats?.contactMessages ?? "—"} />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">
          Recent Requests
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {["Name", "Email", "Plan", "Date", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-xs font-medium text-zinc-500 uppercase tracking-wide pb-3 border-b border-zinc-800 text-left pr-4 last:pr-0"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id} className="border-b border-zinc-800/50">
                  <td className="text-sm text-zinc-300 py-3 pr-4">{r.name}</td>
                  <td className="text-sm text-zinc-400 py-3 pr-4">{r.email}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md capitalize">
                      {r.plan}
                    </span>
                  </td>
                  <td className="text-sm text-zinc-400 py-3 pr-4">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize ${statusBadge(r.status)}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {r.status === "pending" ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleApprove(r)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(r)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize ${statusBadge(r.status)}`}
                      >
                        {r.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-sm text-zinc-500 py-8"
                  >
                    No requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          description={confirmModal.description}
          confirmLabel={confirmModal.type === "approve" ? "Approve" : "Reject"}
          confirmClass={
            confirmModal.type === "approve"
              ? "bg-emerald-600 hover:bg-emerald-500"
              : "bg-red-600 hover:bg-red-500"
          }
          onConfirm={handleConfirm}
          onCancel={() => setConfirmModal(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default Dashboard;
