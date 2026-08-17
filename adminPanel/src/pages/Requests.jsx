import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import RequestsTable from "../components/tables/RequestsTable";
import ConfirmModal from "../components/common/ConfirmModal";
import { getAllRequests, approveRequest, rejectRequest, updateRequestStatus } from "../api/requests.api";

const TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [confirmModal, setConfirmModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getAllRequests(activeTab || undefined);
      setRequests(res.data.data.requests);
    } catch {
      toast.error("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

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

  const handleStatusChange = (requestId, newStatus) => {
    const request = requests.find(r => r._id === requestId);
    
    if (newStatus === "approved" && request.status !== "approved") {
      handleApprove(request);
      setConfirmModal(prev => ({...prev, newStatus}));
    } else if (newStatus === "rejected" && request.status !== "rejected") {
      handleReject(request);
      setConfirmModal(prev => ({...prev, newStatus}));
    }
  };

  const handleConfirm = async () => {
    if (!confirmModal) return;
    setActionLoading(true);
    try {
      if (confirmModal.type === "approve" || confirmModal.newStatus === "approved") {
        await approveRequest(confirmModal.request._id);
        toast.success("Account created and email sent.");
      } else if (confirmModal.type === "reject" || confirmModal.newStatus === "rejected") {
        await rejectRequest(confirmModal.request._id);
        toast.success("Request rejected.");
      } else {
        await updateRequestStatus(confirmModal.request._id, confirmModal.newStatus);
        toast.success("Status updated.");
      }
      setConfirmModal(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 overflow-y-auto flex-1">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Requests</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage access requests and payments</p>
      </div>

      <div className="flex gap-1 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === tab.value
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
            {tab.value === "pending" && pendingCount > 0 && (
              <span className="bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded-md ml-1">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        {loading ? (
          <p className="text-zinc-500 text-sm text-center py-12">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-12">No requests found</p>
        ) : (
          <RequestsTable
            requests={requests}
            onApprove={handleApprove}
            onReject={handleReject}
            onStatusChange={handleStatusChange}
          />
        )}
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

export default Requests;
