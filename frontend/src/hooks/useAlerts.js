import { useState, useEffect, useCallback } from "react"
import {
  getMyAlerts,
  getUnreadAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert as deleteAlertAPI,
} from "../api/alert.api"

const useAlerts = () => {
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchAlerts = useCallback(async (skip = 0, limit = 20) => {
    setLoading(true)
    try {
      const res = await getMyAlerts(skip, limit)
      setAlerts(res.data.data.alerts)
      setTotal(res.data.data.total)
      setHasMore(res.data.data.hasMore)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadAlerts()
      setUnreadCount(res.data.data.count)
      return res.data.data
    } catch {
      return null
    }
  }, [])

  const markAsRead = useCallback(async (alertId) => {
    try {
      await markAlertAsRead(alertId)
      setAlerts((prev) =>
        prev.map((alert) => (alert._id === alertId ? { ...alert, isRead: true } : alert))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // silent
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllAlertsAsRead()
      setAlerts((prev) => prev.map((alert) => ({ ...alert, isRead: true })))
      setUnreadCount(0)
    } catch {
      // silent
    }
  }, [])

  const deleteAlert = useCallback(
    async (alertId) => {
      try {
        await deleteAlertAPI(alertId)
        const deletedAlert = alerts.find((a) => a._id === alertId)
        setAlerts((prev) => prev.filter((alert) => alert._id !== alertId))
        setTotal((prev) => Math.max(0, prev - 1))
        if (deletedAlert && !deletedAlert.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      } catch {
        // silent
      }
    },
    [alerts]
  )

  useEffect(() => {
    fetchAlerts()
    fetchUnreadCount()

    const interval = setInterval(() => {
      fetchAlerts()
      fetchUnreadCount()
    }, 10000)

    return () => clearInterval(interval)
  }, [fetchAlerts, fetchUnreadCount])

  return {
    alerts,
    unreadCount,
    loading,
    hasMore,
    total,
    fetchAlerts,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteAlert,
  }
}

export default useAlerts
