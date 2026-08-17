import adminAxios from "../utils/adminAxios";

const getAllContacts = () => adminAxios.get("/admin/contacts");

const deleteContact = (id) => adminAxios.delete(`/admin/contacts/${id}`);

export { getAllContacts, deleteContact };
