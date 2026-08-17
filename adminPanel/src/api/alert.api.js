import axiosInstance from "../utils/axiosInstance";

const sendAlertToUser = (data) =>
  axiosInstance.post("/api/alerts/send-to-user", data);

const sendAlertToMultipleUsers = (data) =>
  axiosInstance.post("/api/alerts/send-to-multiple", data);

const getAllAlerts = (userId, type, severity, skip = 0, limit = 20) =>
  axiosInstance.get("/api/alerts", {
    params: {
      skip,
      limit,
      ...(userId && { userId }),
      ...(type && { type }),
      ...(severity && { severity }),
    },
  });

const deleteAlert = (id) =>
  axiosInstance.delete(`/api/alerts/${id}/admin`);

const getAlertStats = () =>
  axiosInstance.get("/api/alerts/stats");

export { sendAlertToUser, sendAlertToMultipleUsers, getAllAlerts, deleteAlert, getAlertStats };
