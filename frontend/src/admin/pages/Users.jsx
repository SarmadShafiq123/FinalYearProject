import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import UsersTable from "../components/tables/UsersTable";
import ConfirmModal from "../components/ConfirmModal";
import { getAllUsers, updateUserStorage, deleteUser } from "../api/users.api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const fetchedRef = useRef(false);

  const fetchUsers = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(res.data.data.users || []);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const handleUpdateStorage = async (id, storageLimit) => {
    try {
      await updateUserStorage(id, storageLimit);
      toast.success("Storage updated.");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update storage.");
    }
  };

  const handleDeleteClick = (user) => {
    setConfirmModal({ user });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal) return;
    setActionLoading(true);
    try {
      await deleteUser(confirmModal.user._id);
      toast.success("User deleted.");
      setConfirmModal(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 overflow-y-auto flex-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white">Users</h1>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
              {users.length}
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">Manage registered users</p>
        </div>
      </div>

      <div className="relative mb-5">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        {loading ? (
          <p className="text-zinc-500 text-sm text-center py-12">Loading...</p>
        ) : (
          <UsersTable
            users={filtered}
            onUpdateStorage={handleUpdateStorage}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {confirmModal && (
        <ConfirmModal
          title="Delete this user?"
          description="This will permanently delete all their files and folders. This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmModal(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default Users;
