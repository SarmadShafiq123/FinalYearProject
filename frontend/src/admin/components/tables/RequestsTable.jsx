const statusBadge = (status) => {
  const map = {
    pending: "bg-yellow-500/10 text-yellow-400",
    approved: "bg-emerald-500/10 text-emerald-400",
    rejected: "bg-red-500/10 text-red-400",
  };
  return map[status] || "bg-zinc-800 text-zinc-400";
};

const paymentStatusBadge = (status) => {
  const map = {
    pending: "bg-yellow-500/10 text-yellow-400",
    completed: "bg-emerald-500/10 text-emerald-400",
    failed: "bg-red-500/10 text-red-400",
    cancelled: "bg-orange-500/10 text-orange-400",
  };
  return map[status] || "bg-zinc-800 text-zinc-400";
};

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

const RequestsTable = ({
  requests,
  onApprove,
  onReject,
  onStatusChange,
  showActions = true,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {[
              "Name",
              "Email",
              "Plan",
              "Amount",
              "Payment",
              "Storage",
              "Date",
              "Status",
              ...(showActions ? ["Actions"] : []),
            ].map((h) => (
              <th
                key={h}
                className="text-xs font-medium text-zinc-500 uppercase tracking-wide pb-3 border-b border-zinc-800 text-left pr-4 last:pr-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr
              key={r._id}
              className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors"
            >
              <td className="text-sm text-zinc-300 py-3 pr-4">{r.name}</td>
              <td className="text-xs text-zinc-300 py-3 pr-4 font-mono">
                {r.email}
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md capitalize">
                    {r.plan}
                  </span>
                  {r.userId && (
                    <span className="text-[10px] uppercase tracking-[0.15em] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-md">
                      Renewal
                    </span>
                  )}
                </div>
              </td>
              <td className="text-sm text-zinc-400 py-3 pr-4">
                {r.amount > 0 ? `$${r.amount}` : "Free"}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize ${paymentStatusBadge(r.paymentStatus || "pending")}`}
                >
                  {r.paymentStatus || "pending"}
                </span>
              </td>
              <td className="text-sm text-zinc-400 py-3 pr-4">
                {formatBytes(r.storageBytes)}
              </td>
              <td className="text-sm text-zinc-400 py-3 pr-4">
                {formatDate(r.createdAt)}
              </td>
              <td className="py-3 pr-4">
                {showActions ? (
                  <select
                    value={r.status}
                    onChange={(e) => onStatusChange(r._id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-md font-medium capitalize cursor-pointer border-0 ${statusBadge(r.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                ) : (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize ${statusBadge(r.status)}`}
                  >
                    {r.status}
                  </span>
                )}
              </td>
              {showActions && (
                <td className="py-3">
                  {r.status === "pending" ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onApprove(r)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(r)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500">Processed</span>
                  )}
                </td>
              )}
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td
                colSpan={showActions ? 9 : 8}
                className="text-center text-sm text-zinc-500 py-8"
              >
                No requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RequestsTable;
