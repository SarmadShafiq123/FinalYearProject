import axiosInstance from "../utils/axiosInstance";

const getAllUsers = () => axiosInstance.get("/api/admin/users");

const updateUserStorage = (id, storageLimit) =>
  axiosInstance.patch(`/api/admin/users/${id}/storage`, { storageLimit });

const deleteUser = (id) => axiosInstance.delete(`/api/admin/users/${id}`);

export { getAllUsers, updateUserStorage, deleteUser };
