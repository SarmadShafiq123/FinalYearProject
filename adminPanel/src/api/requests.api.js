import axiosInstance from "../utils/axiosInstance";

const getStats = () => axiosInstance.get("/api/admin/stats");

const getAllRequests = (status) =>
  axiosInstance.get("/api/admin/requests", {
    params: status && status !== "all" ? { status } : {},
  });

const approveRequest = (id) =>
  axiosInstance.patch(`/api/admin/requests/${id}/approve`);

const rejectRequest = (id) =>
  axiosInstance.patch(`/api/admin/requests/${id}/reject`);

const updateRequestStatus = (id, status) =>
  axiosInstance.patch(`/api/admin/requests/${id}/status`, { status });

export { getStats, getAllRequests, approveRequest, rejectRequest, updateRequestStatus };
