import adminAxios from "../utils/adminAxios";

const getStats = () => adminAxios.get("/admin/stats");

const getAllRequests = (status) =>
  adminAxios.get("/admin/requests", {
    params: status && status !== "all" ? { status } : {},
  });

const approveRequest = (id) =>
  adminAxios.patch(`/admin/requests/${id}/approve`);

const rejectRequest = (id) => adminAxios.patch(`/admin/requests/${id}/reject`);

const updateRequestStatus = (id, status) =>
  adminAxios.patch(`/admin/requests/${id}/status`, { status });

export {
  getStats,
  getAllRequests,
  approveRequest,
  rejectRequest,
  updateRequestStatus,
};
