import axiosInstance from "../utils/axiosInstance";

const getAllContacts = () => axiosInstance.get("/api/admin/contacts");

const deleteContact = (id) => axiosInstance.delete(`/api/admin/contacts/${id}`);

export { getAllContacts, deleteContact };
