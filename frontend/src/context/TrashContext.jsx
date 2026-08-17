import { createContext, useState, useCallback, useEffect } from "react"
import toast from "react-hot-toast"
import {
  getTrash as apiGetTrash,
  restoreFile as apiRestoreFile,
  permanentDelete as apiPermanentDelete,
  emptyTrash as apiEmptyTrash,
} from "../api/trash.api"

const TrashContext = createContext(null)

const TrashProvider = ({ children }) => {
  const [trashedFiles, setTrashedFiles] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchTrash = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    setLoading(true)
    try {
      const res = await apiGetTrash()
      setTrashedFiles(res.data.data.files)
    } catch {
      setTrashedFiles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTrash()
  }, [fetchTrash])

  const restoreFile = async (id) => {
    try {
      await apiRestoreFile(id)
      setTrashedFiles((prev) => prev.filter((f) => f._id !== id))
      toast.success("File restored successfully")
    } catch {
      toast.error("Failed to restore file")
    }
  }

  const permanentDelete = async (id) => {
    try {
      await apiPermanentDelete(id)
      setTrashedFiles((prev) => prev.filter((f) => f._id !== id))
      toast.success("File permanently deleted")
    } catch {
      toast.error("Failed to delete file")
    }
  }

  const emptyTrash = async () => {
    try {
      await apiEmptyTrash()
      setTrashedFiles([])
      toast.success("Trash emptied successfully")
    } catch {
      toast.error("Failed to empty trash")
    }
  }

  return (
    <TrashContext.Provider
      value={{
        trashedFiles,
        loading,
        fetchTrash,
        restoreFile,
        permanentDelete,
        emptyTrash,
      }}
    >
      {children}
    </TrashContext.Provider>
  )
}

export { TrashContext, TrashProvider }
