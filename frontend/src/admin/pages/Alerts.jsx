import { useState, useEffect } from "react"
import { Send, Users } from "lucide-react"
import toast from "react-hot-toast"
import { sendAlertToUser, sendAlertToMultipleUsers } from "../api/alert.api"
import { getAllUsers } from "../api/users.api"

const ALERT_TYPES = [
  { value: "info", label: "Information", icon: "ℹ️" },
  { value: "warning", label: "Warning", icon: "⚠️" },
  { value: "error", label: "Error", icon: "❌" },
  { value: "success", label: "Success", icon: "✅" },
  { value: "storage", label: "Storage", icon: "💾" },
  { value: "security", label: "Security", icon: "🔒" },
  { value: "system", label: "System", icon: "⚙️" },
]

const ALERT_SEVERITIES = [
  { value: "low", label: "Low", color: "bg-blue-500/10 text-blue-400" },
  { value: "medium", label: "Medium", color: "bg-amber-500/10 text-amber-400" },
  { value: "high", label: "High", color: "bg-red-500/10 text-red-400" },
  { value: "critical", label: "Critical", color: "bg-rose-600/10 text-rose-400" },
]

const Alerts = () => {
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    severity: "medium",
    actionUrl: "",
    actionLabel: "",
    sendEmail: true,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers()
      setUsers(res.data.data.users)
    } catch {
      toast.error("Failed to load users.")
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((u) => u._id))
    }
  }

  const sendAlert = async (userIds) => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Please fill in title and message.")
      return
    }
    if (userIds.length === 0) {
      toast.error("Please select at least one user.")
      return
    }

    setIsLoading(true)
    try {
      let res
      if (userIds.length === 1) {
        res = await sendAlertToUser({ userId: userIds[0], ...formData })
      } else {
        res = await sendAlertToMultipleUsers({ userIds, ...formData })
      }

      const successCount = res.data.data.successCount || userIds.length
      toast.success(`Alert sent to ${successCount} user(s).`)

      setFormData({
        title: "",
        message: "",
        type: "info",
        severity: "medium",
        actionUrl: "",
        actionLabel: "",
        sendEmail: true,
      })
      setSelectedUsers([])
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send alert.")
    } finally {
      setIsLoading(false)
    }
  }

  const alertType = ALERT_TYPES.find((t) => t.value === formData.type)
  const alertSeverity = ALERT_SEVERITIES.find((s) => s.value === formData.severity)

  return (
    <div className="p-6 overflow-y-auto flex-1">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Send Alerts</h1>
        <p className="text-sm text-zinc-500 mt-1">Send custom alerts to users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Compose Alert</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                  Alert Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Maintenance Scheduled"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Enter alert message..."
                  rows={5}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors"
                  >
                    {ALERT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                    Severity
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors"
                  >
                    {ALERT_SEVERITIES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">
                  Optional Action Button
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="actionUrl"
                    value={formData.actionUrl}
                    onChange={handleInputChange}
                    placeholder="/pricing"
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                  <input
                    type="text"
                    name="actionLabel"
                    value={formData.actionLabel}
                    onChange={handleInputChange}
                    placeholder="Button text"
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  name="sendEmail"
                  checked={formData.sendEmail}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-zinc-600 accent-blue-600 cursor-pointer"
                />
                <label htmlFor="sendEmail" className="text-sm text-zinc-400 cursor-pointer">
                  Also send email notification
                </label>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">
                  Preview
                </p>
                <div className={`p-4 rounded-lg border ${alertSeverity?.color || "bg-blue-500/10 text-blue-400"} border-current/20`}>
                  <div className="flex gap-3">
                    <span className="text-lg">{alertType?.icon}</span>
                    <div>
                      <h4 className="text-sm font-semibold">
                        {formData.title || "Alert Title"}
                      </h4>
                      <p className="text-xs mt-1 opacity-90">
                        {formData.message || "Alert message will appear here"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-6">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={16} />
              Select Recipients
            </h2>

            <div className="mb-4 pb-4 border-b border-zinc-800">
              <button
                onClick={selectAllUsers}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {selectedUsers.length === users.length ? "Deselect All" : "Select All"}
              </button>
              <p className="text-xs text-zinc-500 mt-2">
                {selectedUsers.length} of {users.length} selected
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
              {users.map((user) => (
                <label
                  key={user._id}
                  className="flex items-center gap-2 p-2 hover:bg-zinc-800 rounded cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => toggleUserSelection(user._id)}
                    className="w-4 h-4 rounded border-zinc-600 accent-blue-600 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{user.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  </div>
                </label>
              ))}
              {users.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-4">No users found.</p>
              )}
            </div>

            <div className="space-y-2">
              {selectedUsers.length > 0 ? (
                <button
                  onClick={() => sendAlert(selectedUsers)}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  {isLoading ? "Sending..." : `Send to ${selectedUsers.length}`}
                </button>
              ) : (
                <p className="text-xs text-zinc-500 text-center py-3">
                  Select users to send alert
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Alerts
