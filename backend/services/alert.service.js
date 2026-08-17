import Alert from "../models/Alert.model.js"
import User from "../models/User.model.js"
import transporter from "../config/nodemailer.js"

const getAlertColor = (severity) => {
  const colors = {
    low: "#3b82f6",
    medium: "#f59e0b",
    high: "#ef4444",
    critical: "#7f1d1d",
  }
  return colors[severity] || "#3b82f6"
}

const getAlertIcon = (type) => {
  const icons = {
    info: "ℹ️",
    warning: "⚠️",
    error: "❌",
    success: "✅",
    storage: "💾",
    security: "🔒",
    system: "⚙️",
  }
  return icons[type] || "ℹ️"
}

export const createAlert = async (userId, alertData) => {
  try {
    const alert = await Alert.create({
      userId,
      title: alertData.title,
      message: alertData.message,
      type: alertData.type || "info",
      severity: alertData.severity || "medium",
      icon: alertData.icon || getAlertIcon(alertData.type),
      sendEmail: alertData.sendEmail !== false,
      actionUrl: alertData.actionUrl || null,
      actionLabel: alertData.actionLabel || null,
      expiresAt: alertData.expiresAt || null,
      createdBy: alertData.createdBy || null,
    })

    if (alert.sendEmail) {
      const user = await User.findById(userId)
      if (user) {
        await sendAlertEmail(user, alert).catch(() => {})
        alert.emailSent = true
        alert.emailSentAt = new Date()
        await alert.save()
      }
    }

    return alert
  } catch (error) {
    throw new Error(`Failed to create alert: ${error.message}`)
  }
}

export const sendAlertEmail = async (user, alert) => {
  try {
    const color = getAlertColor(alert.severity)
    const borderColor =
      alert.severity === "critical" ? "#dc2626" : alert.severity === "high" ? "#ef4444" : color

    const actionButton = alert.actionUrl
      ? `
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <a href="${process.env.CLIENT_URL}${alert.actionUrl}" style="background-color:${color};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;display:inline-block;">
              ${alert.actionLabel || "View"}
            </a>
          </td>
        </tr>
      `
      : ""

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#18181b;border-radius:8px;border-left:4px solid ${borderColor};padding:40px;">
                  <tr>
                    <td align="center" style="padding-bottom:30px;">
                      <span style="font-size:40px;">${alert.icon}</span>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom:24px;">
                      <h1 style="color:${color};font-size:22px;font-weight:700;margin:0;">${alert.title}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="color:#ffffff;font-size:16px;line-height:24px;padding-bottom:16px;">
                      Hi ${user.name},
                    </td>
                  </tr>
                  <tr>
                    <td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">
                      ${alert.message}
                    </td>
                  </tr>
                  ${actionButton}
                  <tr>
                    <td style="color:#71717a;font-size:12px;line-height:18px;padding-top:20px;border-top:1px solid #27272a;">
                      This is an important alert from CloudStore. Please review it on your dashboard.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `

    await transporter.sendMail({
      from: `"CloudStore" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `${alert.icon} ${alert.title} - CloudStore Alert`,
      html,
    })
  } catch (error) {
    throw error
  }
}

export const getUserAlerts = async (userId, options = {}) => {
  try {
    const {
      skip = 0,
      limit = 10,
      isRead = null,
      type = null,
      severity = null,
      sortBy = "createdAt",
      sortOrder = -1,
    } = options

    const filter = { userId }
    if (isRead !== null) filter.isRead = isRead
    if (type) filter.type = type
    if (severity) filter.severity = severity

    const alerts = await Alert.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Alert.countDocuments(filter)

    return {
      alerts,
      total,
      skip,
      limit,
      hasMore: skip + limit < total,
    }
  } catch (error) {
    throw new Error(`Failed to fetch alerts: ${error.message}`)
  }
}

export const markAlertAsRead = async (alertId) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      { isRead: true, readAt: new Date() },
      { new: true }
    )
    return alert
  } catch (error) {
    throw new Error(`Failed to mark alert as read: ${error.message}`)
  }
}

export const markAllAlertsAsRead = async (userId) => {
  try {
    const result = await Alert.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    )
    return result
  } catch (error) {
    throw new Error(`Failed to mark all alerts as read: ${error.message}`)
  }
}

export const deleteAlert = async (alertId) => {
  try {
    const alert = await Alert.findByIdAndDelete(alertId)
    return alert
  } catch (error) {
    throw new Error(`Failed to delete alert: ${error.message}`)
  }
}

export const getUnreadAlertCount = async (userId) => {
  try {
    const count = await Alert.countDocuments({ userId, isRead: false })
    return count
  } catch (error) {
    throw new Error(`Failed to get unread alert count: ${error.message}`)
  }
}
