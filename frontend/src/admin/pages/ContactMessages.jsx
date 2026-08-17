import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import ContactTable from "../components/tables/ContactTable";
import ConfirmModal from "../components/ConfirmModal";
import { getAllContacts, deleteContact } from "../api/contact.api";

const ContactMessages = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const fetchedRef = useRef(false);

  const fetchContacts = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    try {
      const res = await getAllContacts();
      setContacts(res.data.data.contacts || []);
    } catch {
      toast.error("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchContacts]);

  const handleDeleteClick = (contact) => {
    setConfirmModal({ contact });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal) return;
    setActionLoading(true);
    try {
      await deleteContact(confirmModal.contact._id);
      toast.success("Message deleted.");
      setConfirmModal(null);
      fetchContacts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete message.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 overflow-y-auto flex-1">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-white">Contact Messages</h1>
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
            {contacts.length}
          </span>
        </div>
        <p className="text-sm text-zinc-500 mt-1">
          Messages from the contact form
        </p>
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm text-center py-12">Loading...</p>
      ) : (
        <ContactTable contacts={contacts} onDelete={handleDeleteClick} />
      )}

      {confirmModal && (
        <ConfirmModal
          title="Delete this message?"
          description="This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmModal(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default ContactMessages;
