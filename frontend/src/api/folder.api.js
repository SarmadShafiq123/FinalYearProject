import axiosInstance from "../utils/axiosInstance";

const createFolder = (name, parentFolder) =>
  axiosInstance.post("/folders", { name, parentFolder });

const getFolders = () => axiosInstance.get("/folders");

const renameFolder = (id, name) => axiosInstance.patch(`/folders/${id}`, { name });

const deleteFolder = (id) => axiosInstance.delete(`/folders/${id}`);

const moveFileToFolder = (fileId, folderId) =>
  axiosInstance.patch(`/files/${fileId}/move`, { folderId });

export { createFolder, getFolders, renameFolder, deleteFolder, moveFileToFolder };
