import formatBytes from "../../utils/formatBytes";

const ActivityLog = ({ files }) => {
  const recent = [...files]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
      {recent.length === 0 ? (
        <p className="text-sm text-zinc-400">No recent activity.</p>
      ) : (
        <ul className="space-y-3">
          {recent.map((file) => (
            <li key={file._id} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{file.originalName}</p>
                <p className="text-xs text-zinc-400">
                  {formatBytes(file.size)} ·{" "}
                  {new Date(file.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <span className="text-xs text-zinc-400 capitalize flex-shrink-0">{file.category}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityLog;
