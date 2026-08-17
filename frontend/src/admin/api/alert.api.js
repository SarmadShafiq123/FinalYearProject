import adminAxios from "../utils/adminAxios";

const sendAlertToUser = (data) => adminAxios.post("/alerts/send-to-user", data);

const sendAlertToMultipleUsers = (data) =>
  adminAxios.post("/alerts/send-to-multiple", data);

const getAllAlerts = (userId, type, severity, skip = 0, limit = 20) =>
  adminAxios.get("/alerts", {
    params: {
      skip,
      limit,
      ...(userId && { userId }),
      ...(type && { type }),
      ...(severity && { severity }),
    },
  });

const deleteAlert = (id) => adminAxios.delete(`/alerts/${id}/admin`);

const getAlertStats = () => adminAxios.get("/alerts/stats");

export {
  sendAlertToUser,
  sendAlertToMultipleUsers,
  getAllAlerts,
  deleteAlert,
  getAlertStats,
};
