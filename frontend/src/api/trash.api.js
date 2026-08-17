import axiosInstance from "../utils/axiosInstance";

const getTrash = () => axiosInstance.get("/trash");

const restoreFile = (id) => axiosInstance.patch(`/trash/${id}/restore`);

const permanentDelete = (id) => axiosInstance.delete(`/trash/${id}`);

const emptyTrash = () => axiosInstance.delete("/trash/empty");

export { getTrash, restoreFile, permanentDelete, emptyTrash };
