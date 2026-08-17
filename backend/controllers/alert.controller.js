import Alert from "../models/Alert.model.js"
import User from "../models/User.model.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"
import {
  createAlert,
  getUserAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
  getUnreadAlertCount,
} from "../services/alert.service.js"

export const getMyAlerts = async (req, res) => {
  try {
    const userId = req.user._id
    const { skip = 0, limit = 10, isRead } = req.query

    const result = await getUserAlerts(userId, {
      skip: parseInt(skip),
      limit: parseInt(limit),
      isRead: isRead ? isRead === "true" : null,
      sortBy: "createdAt",
      sortOrder: -1,
    })

    return successResponse(res, result)
  } catch (err) {
    return errorResponse(res, "Failed to fetch alerts.", 500)
  }
}

export const getUnreadAlerts = async (req, res) => {
  try {
    const userId = req.user._id
    const count = await getUnreadAlertCount(userId)

    const unreadAlerts = await Alert.find({ userId, isRead: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    return successResponse(res, { count, unreadAlerts })
  } catch (err) {
    return errorResponse(res, "Failed to fetch unread alerts.", 500)
  }
}

export const readAlert = async (req, res) => {
  try {
    const alertId = req.params.id
    const userId = req.user._id

    const alert = await Alert.findById(alertId)

    if (!alert) {
      return errorResponse(res, "Alert not found.", 404)
    }

    if (alert.userId.toString() !== userId.toString()) {
      return errorResponse(res, "Unauthorized.", 403)
    }

    const updatedAlert = await markAlertAsRead(alertId)

    return successResponse(res, { alert: updatedAlert }, "Alert marked as read.")
  } catch (err) {
    return errorResponse(res, "Failed to mark alert as read.", 500)
  }
}

export const readAllAlerts = async (req, res) => {
  try {
    const userId = req.user._id
    await markAllAlertsAsRead(userId)
    return successResponse(res, null, "All alerts marked as read.")
  } catch (err) {
    return errorResponse(res, "Failed to mark alerts as read.", 500)
  }
}

export const removeAlert = async (req, res) => {
  try {
    const alertId = req.params.id
    const userId = req.user._id

    const alert = await Alert.findById(alertId)

    if (!alert) {
      return errorResponse(res, "Alert not found.", 404)
    }

    if (alert.userId.toString() !== userId.toString()) {
      return errorResponse(res, "Unauthorized.", 403)
    }

    await deleteAlert(alertId)

    return successResponse(res, null, "Alert deleted.")
  } catch (err) {
    return errorResponse(res, "Failed to delete alert.", 500)
  }
}

export const sendAlertToUser = async (req, res) => {
  try {
    const { userId, title, message, type, severity, actionUrl, actionLabel, sendEmail } = req.body

    if (!userId || !title || !message) {
      return errorResponse(res, "userId, title, and message are required.", 400)
    }

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return errorResponse(res, "Invalid userId format.", 400)
    }

    const user = await User.findById(userId)
    if (!user) {
      return errorResponse(res, "User not found.", 404)
    }

    const alert = await createAlert(userId, {
      title,
      message,
      type: type || "info",
      severity: severity || "medium",
      actionUrl: actionUrl || null,
      actionLabel: actionLabel || null,
      sendEmail: sendEmail !== false,
      createdBy: req.user._id,
    })

    return successResponse(res, { alert }, "Alert sent to user successfully.", 201)
  } catch (err) {
    return errorResponse(res, "Failed to send alert.", 500)
  }
}

export const sendAlertToMultipleUsers = async (req, res) => {
  try {
    const { userIds, title, message, type, severity, actionUrl, actionLabel, sendEmail } = req.body

    if (!userIds || !Array.isArray(userIds) || !title || !message) {
      return errorResponse(res, "userIds (array), title, and message are required.", 400)
    }

    const users = await User.find({ _id: { $in: userIds } })

    if (users.length === 0) {
      return errorResponse(res, "No valid users found.", 404)
    }

    const alerts = []

    for (const user of users) {
      const alert = await createAlert(user._id, {
        title,
        message,
        type: type || "info",
        severity: severity || "medium",
        actionUrl: actionUrl || null,
        actionLabel: actionLabel || null,
        sendEmail: sendEmail !== false,
        createdBy: req.user._id,
      })
      alerts.push(alert)
    }

    return successResponse(
      res,
      { alerts, successCount: alerts.length, totalRequested: userIds.length },
      `Alert sent to ${alerts.length} user(s).`,
      201
    )
  } catch (err) {
    return errorResponse(res, "Failed to send alerts.", 500)
  }
}

export const getAllAlerts = async (req, res) => {
  try {
    const { skip = 0, limit = 20, userId, type, severity } = req.query

    const filter = {}
    if (userId) filter.userId = userId
    if (type) filter.type = type
    if (severity) filter.severity = severity

    const alerts = await Alert.find(filter)
      .populate("userId", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean()

    const total = await Alert.countDocuments(filter)

    return successResponse(res, {
      alerts,
      total,
      skip: parseInt(skip),
      limit: parseInt(limit),
      hasMore: parseInt(skip) + parseInt(limit) < total,
    })
  } catch (err) {
    return errorResponse(res, "Failed to fetch alerts.", 500)
  }
}

export const deleteAlertByAdmin = async (req, res) => {
  try {
    const alertId = req.params.id

    const alert = await Alert.findById(alertId)

    if (!alert) {
      return errorResponse(res, "Alert not found.", 404)
    }

    await deleteAlert(alertId)

    return successResponse(res, null, "Alert deleted.")
  } catch (err) {
    return errorResponse(res, "Failed to delete alert.", 500)
  }
}

export const getAlertStats = async (req, res) => {
  try {
    const stats = await Alert.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          unread: { $sum: { $cond: ["$isRead", 0, 1] } },
        },
      },
      { $sort: { count: -1 } },
    ])

    const totalAlerts = await Alert.countDocuments()
    const totalUnread = await Alert.countDocuments({ isRead: false })

    return successResponse(res, { totalAlerts, totalUnread, byType: stats })
  } catch (err) {
    return errorResponse(res, "Failed to fetch alert stats.", 500)
  }
}
