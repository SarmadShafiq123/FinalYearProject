import axiosInstance from "../utils/axiosInstance";

const getMyAlerts = (skip = 0, limit = 10, isRead = null) =>
  axiosInstance.get("/alerts/my-alerts", {
    params: {
      skip,
      limit,
      ...(isRead !== null && { isRead }),
    },
  });

const getUnreadAlerts = () =>
  axiosInstance.get("/alerts/unread-count");

const markAlertAsRead = (id) =>
  axiosInstance.patch(`/alerts/${id}/read`);

const markAllAlertsAsRead = () =>
  axiosInstance.patch("/alerts/read-all");

const deleteAlert = (id) =>
  axiosInstance.delete(`/alerts/${id}`);

export {
  getMyAlerts,
  getUnreadAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
};
