import axiosInstance from "../utils/axiosInstance";

const fetchFiles = (params) => axiosInstance.get("/files", { params });

const uploadFile = (formData, onUploadProgress) =>
  axiosInstance.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onUploadProgress?.(percent);
    },
  });

const downloadFile = (id) =>
  axiosInstance.get(`/files/${id}/download`, {
    responseType: "blob",
  });

const deleteFile = (id) => axiosInstance.delete(`/files/${id}`);

const moveFile = (id, folder) => axiosInstance.patch(`/files/${id}/move`, { folder });

export { fetchFiles, uploadFile, downloadFile, deleteFile, moveFile };
