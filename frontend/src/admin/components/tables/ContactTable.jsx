import { Trash2 } from "lucide-react"

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

const ContactTable = ({ contacts, onDelete }) => {
  return (
    <div className="space-y-3">
      {contacts.map((c) => (
        <div key={c._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{c.name}</p>
                <p className="text-xs text-zinc-500">{c.email}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500">{formatDate(c.createdAt)}</p>
          </div>
          <p className="text-sm text-zinc-300 font-medium mt-2">{c.subject}</p>
          <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{c.message}</p>
          <div className="flex justify-end mt-3">
            <button
              onClick={() => onDelete(c)}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </div>
      ))}
      {contacts.length === 0 && (
        <div className="text-center text-sm text-zinc-500 py-12">No messages found.</div>
      )}
    </div>
  )
}

export default ContactTable
