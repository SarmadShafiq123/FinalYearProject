import adminAxios from "../utils/adminAxios";

const getAllUsers = () => adminAxios.get("/admin/users");

const updateUserStorage = (id, storageLimit) =>
  adminAxios.patch(`/admin/users/${id}/storage`, { storageLimit });

const deleteUser = (id) => adminAxios.delete(`/admin/users/${id}`);

export { getAllUsers, updateUserStorage, deleteUser };
