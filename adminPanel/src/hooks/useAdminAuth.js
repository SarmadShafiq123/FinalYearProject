import { useContext } from "react";
import { AdminAuthContext } from "../context/AdminAuthContext";

const useAdminAuth = () => useContext(AdminAuthContext);

export default useAdminAuth;
