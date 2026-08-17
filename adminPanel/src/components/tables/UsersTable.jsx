import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";

const formatBytes = (bytes) => {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + " GB";
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const StorageBar = ({ used, limit }) => {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const color = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-blue-500";
  return (
    <div className="w-24 h-1 bg-zinc-800 rounded-full mt-1">
      <div className={`h-1 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

const UsersTable = ({ users, onUpdateStorage, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (user) => {
    setEditingId(user._id);
    setEditValue(String(Math.round(user.storageLimit / 1073741824)));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = (userId) => {
    const gb = parseFloat(editValue);
    if (isNaN(gb) || gb < 0) return;
    onUpdateStorage(userId, Math.round(gb * 1073741824));
    setEditingId(null);
    setEditValue("");
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {["Name", "Email", "Storage", "Joined", "Verified", "Actions"].map((h) => (
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
          {users.map((u) => (
            <tr key={u._id} className="border-b border-zinc-800/50">
              <td className="text-sm text-zinc-300 py-3 pr-4">{u.name}</td>
              <td className="text-sm text-zinc-400 py-3 pr-4">{u.email}</td>
              <td className="py-3 pr-4">
                <p className="text-sm text-zinc-300">
                  {formatBytes(u.storageUsed)} / {formatBytes(u.storageLimit)}
                </p>
                <StorageBar used={u.storageUsed} limit={u.storageLimit} />
              </td>
              <td className="text-sm text-zinc-400 py-3 pr-4">{formatDate(u.createdAt)}</td>
              <td className="py-3 pr-4">
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${u.isEmailVerified ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-400"}`}>
                  {u.isEmailVerified ? "Yes" : "No"}
                </span>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  {editingId === u._id ? (
                    <>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                        placeholder="GB"
                      />
                      <span className="text-xs text-zinc-500">GB</span>
                      <button
                        onClick={() => saveEdit(u._id)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(u)}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(u)}
                        className="text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-sm text-zinc-500 py-8">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
